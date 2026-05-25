import { getKatalog } from '@/lib/db'
import { notFound } from 'next/navigation'

export default async function DersPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const { dersler, siniflar, uniteler } = getKatalog()

  const ders = dersler.find(d => d.slug === slug)
  if (!ders) notFound()

  const sinifIds = [...new Set(uniteler.filter(u => u.ders_id === ders.id).map(u => u.sinif_id).filter(Boolean))]
  const ilgiliSiniflar = siniflar.filter(s => sinifIds.includes(s.id))
  const ilgiliUniteler = uniteler.filter(u => u.ders_id === ders.id)

  return (
    <div className="container">
      <a href="/" className="back-link">← Ana Sayfa</a>
      <h1 className="section-title">{ders.baslik}</h1>
      {ilgiliSiniflar.length > 0 && (
        <div className="grade-tabs">
          <a href={`/ders/${slug}`} className="grade-tab active">Tümü</a>
          {ilgiliSiniflar.map((s) => (
            <a key={s.id} href={`/ders/${slug}?sinif=${s.id}`} className="grade-tab">{s.baslik}</a>
          ))}
        </div>
      )}
      {ilgiliUniteler.length === 0 ? (
        <p className="loading">Bu ders için ünite bulunamadı.</p>
      ) : (
        <div className="unit-grid">
          {ilgiliUniteler.map((u) => (
            <div key={u.id} className="unit-card">
              <img className="cover" src={u.kapak_url || '/placeholder.png'} alt={u.baslik} loading="lazy" />
              <div className="body">
                <h4>{u.baslik}</h4>
                <div className="unit-actions">
                  <a href={`/kitap/${u.id}`} className="btn-oku">Oku</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
