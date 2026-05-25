'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function Reader() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const evvelcevapSlug = searchParams.get('c')
  const sinifNo = searchParams.get('s')
  const [sayfa, setSayfa] = useState('')

  const hasEvvelcevap = !!evvelcevapSlug && !!sinifNo

  let cevapAnahtariUrl: string | null = null
  if (hasEvvelcevap) {
    const base = `https://www.evvelcevap.com/${evvelcevapSlug}-ders-ve-calisma-kitabi-cevaplari/`
    if (sayfa && /^\d+$/.test(sayfa)) {
      cevapAnahtariUrl = `https://www.evvelcevap.com/${sinifNo}-sinif-${evvelcevapSlug}-ders-kitabi-cevaplari-meb-yayinlari-sayfa-${sayfa}/`
    } else {
      cevapAnahtariUrl = base
    }
  }

  if (!url) {
    return <p className="error">Geçersiz URL parametresi.</p>
  }

  return (
    <div className="container" style={{ padding: 0, maxWidth: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #ddd' }}>
        <a href="javascript:history.back()" className="back-link" style={{ marginBottom: 0 }}>← Geri</a>
        <span style={{ marginLeft: 16, fontSize: 14, color: '#666' }}>Etkileşimli Kitap Okuyucu</span>
      </div>
      <iframe
        src={url}
        className="reader-iframe"
        allow="fullscreen"
        title="Etkileşimli Kitap"
      />
      {cevapAnahtariUrl && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="number"
              min="1"
              placeholder="Sayfa"
              value={sayfa}
              onChange={e => setSayfa(e.target.value)}
              style={{
                width: 70,
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid #ddd',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <a
              href={cevapAnahtariUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
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
          </div>
        </div>
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
