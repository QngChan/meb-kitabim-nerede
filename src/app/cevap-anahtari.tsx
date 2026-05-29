'use client'

import { useState } from "react"

export default function CevapAnahtari({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)

  const url = `https://www.evvelcevap.com/${slug}-kitabi-cevaplari/`

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-ghost"
        style={{ color: "var(--orange)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        Cevap Anahtarı
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="modal-overlay"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="modal-content"
          >
            <div className="modal-header">
              <h3>Cevap Anahtarı</h3>
              <button onClick={() => setOpen(false)} className="modal-close">✕</button>
            </div>
            <div className="modal-body">
              <iframe
                src={url}
                className="modal-iframe"
                allow="clipboard-read; clipboard-write"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
