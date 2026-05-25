# MEB Kitabım Nerede — Implementation Plan

## Phase 1: Project Scaffolding
- [ ] Next.js (App Router) + TypeScript kurulumu
- [ ] Klasör yapısı (src/app, src/lib, src/components)
- [ ] Bağımlılıklar: better-sqlite3, axios, cheerio

## Phase 2: Database & Types
- [ ] TypeScript tip tanımları (types.ts)
- [ ] SQLite şeması + DB helper (db.ts)
- [ ] Tablolar: kategoriler, siniflar, dersler, uniteler, kazanimlar, dosyalar

## Phase 3: Scraper Module
- [ ] Katalog scraper (katalog.ts) — ana sayfadaki dersleri çeker
- [ ] Unit scraper (uniteler.ts) — her ders/sınıf için üniteleri çeker
- [ ] Dosya scraper (dosyalar.ts) — PDF/ZIP/interactive linklerini çıkarır
- [ ] Orchestrator (index.ts) — tüm scrape sürecini yönetir
- [ ] Scrape script (npm run scrape)

## Phase 4: Pages (UI)
- [ ] Ana Sayfa (/) — ders kategorileri grid
- [ ] Ders Sayfası (/ders/[slug]) — sınıf seçimi + ünite listesi
- [ ] Kitap Sayfası (/kitap/[id]) — ünite detay + aksiyonlar
- [ ] Okuyucu Sayfası (/oku) — iframe embed
- [ ] Arama bileşeni

## Phase 5: API Routes
- [ ] /api/proxy/pdf/[id] — PDF proxy + cache
- [ ] /api/kitaplar — kitap listesi
- [ ] /api/ara — arama endpointi

## Phase 6: Cache System
- [ ] Dosya cache yönetimi (cache.ts)
- [ ] Cover image cache
- [ ] PDF cache + streaming

## Phase 7: Styling & Polish
- [ ] CSS Modules (AnaSayfa, DersSayfasi, KitapSayfasi, Okuyucu)
- [ ] Responsive layout
- [ ] Loading/error states
- [ ] 404 sayfası

## Phase 8: Deploy
- [ ] Dockerfile
- [ ] .env.example
- [ ] README
