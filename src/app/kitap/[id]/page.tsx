import { getKatalog } from '@/lib/db'
import { getEvvelcevapSlug } from '@/lib/evvelcevap'
import { notFound } from 'next/navigation'

export default async function KitapPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)
  if (isNaN(id)) notFound()

  const { uniteler, dosyalar, dersler, kategoriler } = getKatalog()

  const unite = uniteler.find(u => u.id === id)
  if (!unite) notFound()

  const uniteDosyalar = dosyalar.filter(d => d.unite_id === id)
  const ders = dersler.find(d => d.id === unite.ders_id)
  const kategori = kategoriler.find(k => k.id === ders?.kategori_id)
  const evvelcevapSlug = kategori ? getEvvelcevapSlug(kategori.baslik) : null

  const interactiveUrl = uniteDosyalar.find(d => d.tur === 'interactive')?.url
  const pdfUrl = uniteDosyalar.find(d => d.tur === 'pdf')?.url
  const zipUrl = uniteDosyalar.find(d => d.tur === 'zip')?.url

  let okuHref = '#'
  let isImageViewer = false
  if (unite.id > 0) {
    okuHref = `/oku?iid=${unite.id}${evvelcevapSlug ? `&c=${evvelcevapSlug}` : ''}`
    isImageViewer = true
  } else if (interactiveUrl) {
    okuHref = `/oku?url=${encodeURIComponent(interactiveUrl)}${evvelcevapSlug ? `&c=${evvelcevapSlug}` : ''}`
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <a href={`/ders/${ders?.slug}`} className="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        {ders?.baslik || 'Ders'}
      </a>
      <div className="book-detail">
        {unite.kapak_url && (
          <div className="cover-section">
            <img src={unite.kapak_url} alt={unite.baslik} />
          </div>
        )}
        <div className="info-section">
          <h1>{unite.baslik}</h1>
          <p className="meta">{ders?.baslik}</p>
          <div className="actions">
            {okuHref !== '#' && (
              <a href={okuHref} className="btn btn-primary btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                {isImageViewer ? 'Oku' : 'Etkileşimli Oku'}
              </a>
            )}
            {pdfUrl && (
              <a href={`/api/proxy/pdf/${id}`} className="btn btn-outline btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                PDF İndir
              </a>
            )}
            {zipUrl && (
              <a href={zipUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                Etkileşimli İçerik (ZIP)
              </a>
            )}
          </div>
          {uniteDosyalar.length === 0 && (
            <div className="empty-state" style={{ marginTop: 24 }}>
              <div className="empty-icon">📄</div>
              <h3>Dosya bulunamadı</h3>
              <p>Bu ünite için henüz dosya yüklenmemiş.</p>
            </div>
          )}
          {evvelcevapSlug && (
            <a href={`https://www.evvelcevap.com/${evvelcevapSlug}-kitabi-cevaplari/`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ marginTop: 16, color: 'var(--orange)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Cevap Anahtarı
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
