# MEB Kitabım Nerede — Design Document

## 1. Overview

"MEB Kitabım Nerede" is a web application that provides access to official Turkish Ministry of National Education (MEB) textbooks and educational materials. It acts as a portal that scrapes, caches, and serves content from the official OGM Materyal platform (ogmmateryal.eba.gov.tr), offering users a faster, more organized, and mobile-friendly interface to browse, read online, and download textbooks.

## 2. Scope

All material categories available on OGM Materyal:
- Ders Kitapları (Course Books) — ~50 subjects, 9-12th grades
- Beceri Temelli Kitaplar (Skill-Based Books)
- Güzel Sanatlar Lisesi Kitapları (Fine Arts High School)
- Spor Lisesi Kitapları (Sports High School)
- Kazanım Kavrama Etkinlikleri (Learning Outcome Activities)
- Çalışma Defterleri (Workbooks)
- Kavram Öğretimi Çalışmaları (Concept Teaching)
- Oyun ve Etkinlik Kitapları (Game & Activity Books)
- YKS Hazırlık (University Exam Prep): denemeler, soru bankaları, konu özetleri
- Liseye Hoş Geldin (Welcome to High School)

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Next.js (App Router, SSR) |
| Backend | Next.js API Routes |
| Database | SQLite (via better-sqlite3) |
| Scraping | axios + cheerio (Node.js) |
| PDF Viewer | PDF.js (mozilla/pdf.js) |
| Styling | CSS Modules (no UI framework — custom minimal CSS) |
| Deployment | Node.js server (self-hosted or VPS) |

## 4. Architecture

```
┌─────────────────────────────────────────────────┐
│              NEXT.JS APP (SSR)                   │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │             Pages (App Router)             │   │
│  │  / → Ana Sayfa                             │   │
│  │  /ders/[slug] → Ders Sayfası               │   │
│  │  /kitap/[id] → Ünite Detay                 │   │
│  │  /oku → Etkileşimli Kitap Okuyucu          │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │          API Routes                         │   │
│  │  /api/proxy/pdf/[id] → PDF proxy           │   │
│  │  /api/kitaplar → Kitap listesi/json        │   │
│  │  /api/ara → Arama endpointi                 │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  ┌───────────────────────────────────────────┐   │
│  │              Scraper Module                │   │
│  │  Katalog → Ders → Sınıf → Ünite → Dosya   │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌────────────┐     ┌──────────────────┐
│  SQLite    │     │  Dosya Cache     │
│  (katalog) │     │  (pdf, kapak)    │
└────────────┘     └──────────────────┘
```

### Data Flow

1. **Scrape job** (manual trigger or cron): Crawls OGM's catalog pages and API endpoints, saves metadata to SQLite, downloads cover images and PDFs to cache.
2. **User visit**: Next.js SSR page queries SQLite for catalog data, renders the page instantly. No OGM dependency during page load.
3. **PDF request**: `/api/proxy/pdf/[id]` checks cache → if cached, serves directly; if not, streams from OGM and caches asynchronously.
4. **Interactive book**: The OGM interactive viewer is embedded via iframe in `/oku` page — no proxy attempted (ASP.NET Web Forms app).
5. **ZIP download**: Direct redirect to OGM URL (files are large, caching impractical).

## 5. Data Model (SQLite)

```sql
CREATE TABLE kategoriler (
    id INTEGER PRIMARY KEY,
    baslik TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon_url TEXT,
    ust_id INTEGER REFERENCES kategoriler(id),
    sira INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE siniflar (
    id INTEGER PRIMARY KEY,
    baslik TEXT NOT NULL,
    slug TEXT NOT NULL,
    sira INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE dersler (
    id INTEGER PRIMARY KEY,
    baslik TEXT NOT NULL,
    slug TEXT NOT NULL,
    kategori_id INTEGER REFERENCES kategoriler(id),
    icon_url TEXT,
    sinif_ids TEXT   -- comma-separated sinif IDs
);

CREATE TABLE uniteler (
    id INTEGER PRIMARY KEY,
    baslik TEXT NOT NULL,
    sira INTEGER NOT NULL DEFAULT 0,
    kapak_url TEXT,
    ders_id INTEGER NOT NULL REFERENCES dersler(id),
    sinif_id INTEGER REFERENCES siniflar(id)
);

CREATE TABLE kazanimlar (
    id INTEGER PRIMARY KEY,
    baslik TEXT NOT NULL,
    unite_id INTEGER NOT NULL REFERENCES uniteler(id)
);

CREATE TABLE dosyalar (
    id INTEGER PRIMARY KEY,
    unite_id INTEGER NOT NULL REFERENCES uniteler(id),
    tur TEXT NOT NULL CHECK(tur IN ('pdf', 'zip', 'interactive')),
    url TEXT NOT NULL,
    cache_durumu TEXT DEFAULT 'none',
    boyut INTEGER
);
```

## 6. Scraping Strategy

### Source API Endpoints
- `POST /api/ders-listele/{sinifId}` → lists courses for a grade
- `POST /api/unite-listele/{dersId}` → lists units for a course
- `POST /api/kazanim-listele/{uniteId}` → lists learning outcomes

### Schedule
- **Full catalog refresh**: Once daily (scans all categories, grades, courses)
- **File download**: Cached on first user request, or pre-cached via background job
- **Trigger**: Manual via `npm run scrape` or cron job

### Scraper Steps
1. Fetch main catalog page → extract all category/subject links
2. For each subject, fetch its page → extract available grades → call API for course list
3. For each course, call unit listing API → extract unit metadata + file URLs
4. Insert/update all records in SQLite
5. Download cover images to cache
6. PDFs downloaded on-demand or via batch job

## 7. User Interface

### Pages

**Ana Sayfa (`/`)**:
- Header: logo + search bar + grade filter dropdown
- Grid of subject cards (icon + title)
- Each subject card links to `/ders/[slug]`
- Categories can be filtered by grade

**Ders Sayfası (`/ders/[slug]`)**:
- Back navigation
- Subject title + icon
- Grade selection tabs/buttons
- For each grade, list of available course editions
- Clicking a course-grade combination navigates to `/kitap/[unitId]`

**Kitap/Ünite Sayfası (`/kitap/[id]`)**:
- Unit title, cover image
- Grade info
- Action buttons:
  - "Oku" — opens interactive viewer (iframe)
  - "PDF İndir" — downloads/caches PDF
  - "Etkileşimli İçerik" — downloads ZIP
- Back to subject navigation

**Okuyucu Sayfası (`/oku`)**:
- Full-screen iframe embedding OGM interactive book viewer
- Loading state while viewer loads
- "Tam Ekran" button
- "Geri" button

### Design Principles
- Desktop-first responsive layout
- Minimal, clean, professional aesthetic (no "AI-generated" appearance)
- Turkish language throughout
- Fast initial load with SSR
- No unnecessary animations or decorative UI

## 8. Proxy & Cache

### PDF Proxy (`/api/proxy/pdf/[id]`)
1. Receives request with unit ID
2. Looks up file URL in SQLite
3. Checks `data/cache/pdf/{id}.pdf`
4. If cached: reads and streams file with correct headers
5. If not cached: fetches from OGM URL, streams to client, writes to cache async
6. Sets `Content-Disposition: inline` for browser display

### Image Cache
- Cover images scraped and stored in `data/cache/kapak/`
- Served via Next.js static file serving or custom route

### ZIP & Interactive Books
- ZIP: Direct 302 redirect to OGM URL (files too large for practical caching)
- Interactive (ASPX): Embedded via iframe — no proxy

## 9. Error Handling

- **OGM unreachable during scrape**: Log error, keep existing DB data, retry on next schedule
- **OGM unreachable during proxy**: Return 502 with user-friendly "Şu anda içerik alınamıyor" message
- **File not found**: Return 404 with navigation back to kitap page
- **Cache full**: Implement max cache size (e.g. 2GB), LRU eviction for old PDFs
- **Scrape fails partway**: Transactional DB writes — rollback on failure

## 10. Testing

- Scraper module unit tests (mocked HTTP responses)
- API route integration tests
- UI component tests with custom testing setup
- Manual crawl verification against live OGM data schema changes
- PDF proxy test: verify correct Content-Type, caching behavior

## 11. Non-Goals

- No user authentication or accounts
- No download manager / resumable downloads
- No search indexing beyond simple SQL LIKE queries
- No content transformation / OCR / AI features
- No real-time sync with OGM (daily scrape is sufficient)

## 12. Future Possibilities

- Offline reading mode (PWA)
- Bookmark/favorites (localStorage-based, no account)
- Multiple PDF download (batch per course)
- Search with full-text indexing (FTS5 on SQLite)
