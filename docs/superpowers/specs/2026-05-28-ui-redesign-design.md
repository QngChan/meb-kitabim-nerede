# MEB Kitabım Nerede — UI Redesign

## 1. Overview

Complete visual redesign of the MEB Kitabım Nerede web application to create a modern, vibrant, student-friendly interface that differentiates the platform from competitors (OGM Materyal, Evvelcevap, etc.).

## 2. Design Direction

- **Style**: Canlı Eğitim Teknolojisi (Vibrant EdTech) — warm, inviting, energetic
- **Target audience**: Turkish high school students (grades 9-12) and teachers
- **Goal**: Make textbook browsing feel modern and enjoyable, not like a government portal

## 3. Visual Identity

### Color Palette

| Role       | Color    | Hex       | Usage                              |
|------------|----------|-----------|------------------------------------|
| Primary    | Green    | `#10B981` | Buttons, links, active states      |
| Secondary  | Blue     | `#3B82F6` | Header, navigation, secondary UI   |
| Accent     | Orange   | `#F97316` | Badges, highlights, hover effects  |
| Background | Light    | `#F8FAFC` | Page background                    |
| Surface    | White    | `#FFFFFF` | Cards, modals, containers          |
| Text       | Dark     | `#0F172A` | Primary text                       |
| Muted      | Gray     | `#64748B` | Secondary text, labels             |
| Dark BG    | Navy     | `#0F172A` | Dark mode background               |
| Dark Card  | Darker   | `#1E293B` | Dark mode card surfaces            |

### Typography

- **Font Family**: Inter (Google Fonts, loaded via `next/font`)
- **Scale**:
  - Hero title: 36px / Bold 700
  - Page title: 28px / Bold 700
  - Section title: 20px / Semibold 600
  - Card title: 16px / Medium 500
  - Body: 14-16px / Regular 400
  - Small/caption: 12-13px / Regular 400

### Spacing

- 4px base unit, using multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Section padding: 24-48px
- Card padding: 16-20px

### Border Radius

- Cards: 8px (`rounded-lg`)
- Buttons: 8px
- Inputs: 8px
- Modals: 12px
- Avatars/icons: 12px

## 4. Page Designs

### 4.1 Layout (`layout.tsx`)

**Header (subpages)**:
- Fixed top, white background, subtle bottom shadow
- Left: Logo "MEB Kitabım Nerede" in bold
- Center: Search bar with icon (expands on focus)
- Right: Navigation links (Ana Sayfa, Kategoriler)
- Dark mode: Dark navy background

**Footer**:
- Dark background (`#1E293B`), light text
- Logo, quick links, disclaimer text
- "MEB'e ait tüm içerikler ogmmateryal.eba.gov.tr adresinden alınmaktadır."

### 4.2 Homepage (`/`)

**Hero Section**:
- Full-width gradient background (blue-to-light `#3B82F6` → `#F8FAFC`)
- Large heading: "Kitabını Bul, Hemen Oku!"
- Subtitle: "MEB ders kitaplarına hızlı ve ücretsiz erişim"
- Search input with icon, placeholder "Ders, ünite veya kitap ara..."
- Below: quick category pills (Tümü, 9. Sınıf, 10. Sınıf, etc.)

**Category Grid**:
- 4-column responsive grid of subject cards
- Each card: icon (64px) + subject name
- Hover: subtle lift + shadow increase
- Click → `/ders/[slug]`

### 4.3 Subject Page (`/ders/[slug]`)

- Back button + subject title with icon
- Grade filter: pill tabs (Tümü, 9, 10, 11, 12)
- Unit grid: 3-4 column responsive
- Each card: cover image (aspect ratio 3:4), title overlay at bottom, "Oku" button on hover
- Empty state: "Bu kriterde içerik bulunamadı"

### 4.4 Book Detail Page (`/kitap/[id]`)

- Two-column layout: left = cover image (sticky), right = details
- Details: title, grade, unit info, metadata
- Action buttons (stacked):
  - "Oku" (primary green, full-width)
  - "PDF İndir" (outlined blue)
  - "Etkileşimli İçerik" (outlined gray)
- "Cevap Anahtarı" link if available (orange accent)

### 4.5 Reader Page (`/oku`)

- Keep existing image-based viewer functionality
- Modernize toolbar: translucent glass effect instead of dark solid bar
- Drawing tools: same, with updated icon style
- Responsive improvements for tablet

## 5. Components

### New Components to Create
- `SearchBar` — animated search input with results dropdown
- `SubjectCard` — category card with icon and hover effect
- `UnitCard` — book cover card with hover overlay
- `GradeFilter` — pill tab group for grade selection
- `ActionButton` — styled CTA button variants (primary, outline, ghost)
- `ThemeToggle` — dark/light mode switcher
- `HeroSection` — homepage hero with gradient background
- `SectionHeader` — reusable section title component
- `LoadingSkeleton` — shimmer loading placeholder
- `ErrorState` — error display with retry action
- `EmptyState` — empty result illustration with message

## 6. Dark Mode

- CSS custom properties on `:root` and `[data-theme="dark"]`
- System preference detection via `prefers-color-scheme: dark`
- Manual toggle in header (sun/moon icon)
- Persist preference in localStorage
- Dark variant for every surface, text, and border color

## 7. Technical Approach

- **Styling**: Custom CSS with CSS custom properties (no framework migration)
- **File**: Single `globals.css` restructured with sections
- **Assets**: SVG icons inline (no icon library)
- **Font**: Inter via `next/font`
- **Animations**: CSS transitions and keyframes (no Framer Motion)
- **Responsive**: Mobile-first with breakpoints at 640px, 768px, 1024px, 1280px

## 8. Implementation Order

1. CSS setup: custom properties, dark mode, typography, reset
2. Layout: header + footer
3. Homepage: hero + category grid
4. Subject page: grade filter + unit grid
5. Book detail page: two-column layout
6. Components: SearchBar, cards, skeleton, etc.
7. Reader page: toolbar modernization
8. Error/loading/empty states
9. Polish: animations, transitions, responsive tweaks
