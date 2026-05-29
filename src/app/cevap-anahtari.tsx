'use client'

import { useState } from "react"

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

  const gradeUrl = sinifNo
    ? `https://www.evvelcevap.com/${sinifNo}-sinif-ders-ve-calisma-kitabi-cevaplari/`
    : `https://www.evvelcevap.com/ders-ve-calisma-kitabi-cevaplari/`

  const pageNote = sayfa ? ` (Sayfa ${sayfa})` : ""

  return (
    <>
      <a
        href={gradeUrl}
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 8, verticalAlign: 'middle' }}>
            <path d="M18 8A6 6 0 0 1 6 8c0-7 6-11 6-11s6 4 6 11"/><path d="M14 14a2 2 0 1 1-4 0"/>
          </svg>
          Cevap anahtarı yeni sekmede açıldı
        </div>
      )}
    </>
  )
}
