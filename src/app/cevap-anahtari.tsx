'use client'

import { useState } from "react"

export function buildEvvelcevapUrl(
  subjectSlug: string,
  sinifNo?: number | null,
  sayfa?: number
): string {
  if (sinifNo && sayfa) {
    return `https://www.evvelcevap.com/${sinifNo}-sinif-${subjectSlug}-ders-kitabi-cevaplari-meb-sayfa-${sayfa}/`
  }
  if (sinifNo) {
    return `https://www.evvelcevap.com/${sinifNo}-sinif-${subjectSlug}-ders-kitabi-cevaplari-meb/`
  }
  if (sayfa) {
    return `https://www.evvelcevap.com/${subjectSlug}-ders-kitabi-cevaplari-meb-sayfa-${sayfa}/`
  }
  return `https://www.evvelcevap.com/${subjectSlug}-ders-kitabi-cevaplari-meb/`
}

export default function CevapAnahtari({
  slug,
  sinifNo,
  sayfa,
}: {
  slug: string
  sinifNo?: number | null
  sayfa?: number
}) {
  const [toast, setToast] = useState(false)

  const url = buildEvvelcevapUrl(slug, sinifNo, sayfa)

  const pageNote = sayfa ? ` (Sayfa ${sayfa})` : ""

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => { setToast(true); setTimeout(() => setToast(false), 3000) }}
        className="btn btn-ghost"
        style={{ color: "var(--orange)", textDecoration: "none" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Cevap Anahtarı{pageNote}
      </a>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#222', color: '#fff', padding: '10px 20px', borderRadius: 8,
          fontSize: 14, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          Cevap anahtarı yeni sekmede açıldı
        </div>
      )}
    </>
  )
}
