import { getKatalog } from '@/lib/db'
import { getEvvelcevapSlug, getSinifNo } from '@/lib/evvelcevap'
import { notFound } from 'next/navigation'

export default async function KitapPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)
  if (isNaN(id)) notFound()

  const { uniteler, dosyalar, dersler, kategoriler, siniflar } = getKatalog()

  const unite = uniteler.find(u => u.id === id)
  if (!unite) notFound()

  const uniteDosyalar = dosyalar.filter(d => d.unite_id === id)
  const ders = dersler.find(d => d.id === unite.ders_id)
  const kategori = kategoriler.find(k => k.id === ders?.kategori_id)
  const sinif = siniflar.find(s => s.id === unite.sinif_id)
  const evvelcevapSlug = kategori ? getEvvelcevapSlug(kategori.baslik) : null
  const sinifNo = sinif ? getSinifNo(sinif.baslik) : null

  const interactiveUrl = uniteDosyalar.find(d => d.tur === 'interactive')?.url
  const pdfUrl = uniteDosyalar.find(d => d.tur === 'pdf')?.url
  const zipUrl = uniteDosyalar.find(d => d.tur === 'zip')?.url

  const okuParams = new URLSearchParams()
  okuParams.set('url', interactiveUrl || '')
  if (evvelcevapSlug) okuParams.set('c', evvelcevapSlug)
  if (sinifNo) okuParams.set('s', sinifNo)

  return (
    <div className="container">
      <a href={`/ders/${ders?.slug}`} className="back-link">← {ders?.baslik || 'Ders'}</a>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {unite.kapak_url && (
          <img src={unite.kapak_url} alt={unite.baslik} style={{ width: 200, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
        )}
        <div style={{ flex: 1, minWidth: 250 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{unite.baslik}</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>{ders?.baslik}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {interactiveUrl && (
              <a href={`/oku?${okuParams.toString()}`} className="btn-oku" style={{ padding: '12px 24px', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontWeight: 600, fontSize: 15, display: 'block' }}>
                Etkileşimli Oku
              </a>
            )}
            {pdfUrl && (
              <a href={`/api/proxy/pdf/${id}`} style={{ padding: '12px 24px', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontWeight: 600, fontSize: 15, display: 'block', background: '#fff', border: '1px solid #ddd', color: '#333' }}>
                PDF İndir
              </a>
            )}
            {zipUrl && (
              <a href={zipUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '12px 24px', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontWeight: 600, fontSize: 15, display: 'block', background: '#fff', border: '1px solid #ddd', color: '#888' }}>
                Etkileşimli İçerik (ZIP)
              </a>
            )}
          </div>
          {uniteDosyalar.length === 0 && (
            <p className="loading">Bu ünite için henüz dosya bulunamadı.</p>
          )}
        </div>
      </div>
    </div>
  )
}
