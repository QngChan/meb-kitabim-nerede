import Link from 'next/link'
import { getKatalog } from '@/lib/db'
import { notFound } from 'next/navigation'
import SubjectIcon from '@/app/subject-icon'

export default async function DersPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sinif?: string }>
}) {
  const slug = (await params).slug
  const { sinif } = await searchParams
  const sinifFiltre = sinif ? parseInt(sinif) : null

  const { dersler, siniflar, uniteler } = getKatalog()

  const ders = dersler.find(d => d.slug === slug)
  if (!ders) notFound()

  const sinifIds = [...new Set(uniteler.filter(u => u.ders_id === ders.id).map(u => u.sinif_id).filter(Boolean))]
  const ilgiliSiniflar = siniflar.filter(s => sinifIds.includes(s.id))
  let ilgiliUniteler = uniteler.filter(u => u.ders_id === ders.id)

  if (sinifFiltre) {
    ilgiliUniteler = ilgiliUniteler.filter(u => u.sinif_id === sinifFiltre)
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <Link href="/" className="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        Ana Sayfa
      </Link>
      <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SubjectIcon slug={slug} size={40} />
        {ders.baslik}
      </h1>
      {ilgiliSiniflar.length > 0 && (
        <div className="grade-tabs">
          <Link href={`/ders/${slug}`} className={`grade-tab${!sinifFiltre ? ' active' : ''}`}>Tümü</Link>
          {ilgiliSiniflar.map((s) => (
            <Link key={s.id} href={`/ders/${slug}?sinif=${s.id}`} className={`grade-tab${sinifFiltre === s.id ? ' active' : ''}`}>{s.baslik}</Link>
          ))}
        </div>
      )}
      {ilgiliUniteler.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <h3>Bu sınıf için ünite bulunamadı</h3>
          <p>Farklı bir sınıf seçmeyi deneyin.</p>
        </div>
      ) : (
        <div className="unit-grid">
          {ilgiliUniteler.map((u) => (
            <Link key={u.id} href={`/kitap/${u.id}`} className="unit-card">
              <div className="cover-wrap">
                <img className="cover" src={u.kapak_url || '/placeholder.png'} alt={u.baslik} loading="lazy" />
                <div className="cover-overlay">
                  <span className="btn btn-sm btn-primary">Oku</span>
                </div>
              </div>
              <div className="body">
                <h4>{u.baslik}</h4>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
