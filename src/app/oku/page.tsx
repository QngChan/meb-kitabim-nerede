'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useRef } from 'react'

function Reader() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const evvelcevapSlug = searchParams.get('c')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [query, setQuery] = useState('')

  const cevapAnahtariUrl = evvelcevapSlug
    ? `https://www.evvelcevap.com/${evvelcevapSlug}-ders-ve-calisma-kitabi-cevaplari/`
    : null

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || !url) return
    const num = parseInt(trimmed)
    if (!isNaN(num) && num > 0) {
      const src = url.includes('?') ? `${url}&page=${num}` : `${url}?page=${num}`
      if (iframeRef.current) iframeRef.current.src = src
    }
  }

  if (!url) {
    return <p className="error">Geçersiz URL parametresi.</p>
  }

  return (
    <div className="container" style={{ padding: 0, maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #ddd', gap: 12 }}>
        <a href="javascript:history.back()" className="back-link" style={{ marginBottom: 0 }}>← Geri</a>
        <span style={{ fontSize: 14, color: '#666', marginRight: 'auto' }}>Etkileşimli Kitap Okuyucu</span>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 4 }}>
          <input
            type="text"
            placeholder="Sayfa no ara..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd',
              fontSize: 13, outline: 'none', width: 140,
            }}
          />
          <button type="submit" style={{
            padding: '6px 12px', borderRadius: 6, border: 'none',
            background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500,
          }}>Git</button>
        </form>
      </div>
      <iframe
        ref={iframeRef}
        src={url}
        className="reader-iframe"
        allow="fullscreen"
        title="Etkileşimli Kitap"
      />
      {cevapAnahtariUrl && (
        <a
          href={cevapAnahtariUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 18px',
            background: '#6366f1',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
            boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
            whiteSpace: 'nowrap',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          Cevap Anahtarı
        </a>
      )}
    </div>
  )
}

export default function OkuPage() {
  return (
    <Suspense fallback={<p className="loading">Yükleniyor...</p>}>
      <Reader />
    </Suspense>
  )
}
