'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Reader() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')

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
