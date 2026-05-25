import { getKatalog } from '@/lib/db'

export default async function HomePage() {
  const { kategoriler } = getKatalog()

  return (
    <div className="container">
      <h1 className="section-title">Ders Kitapları</h1>
      {kategoriler.length === 0 ? (
        <p className="loading">Katalog henüz yüklenmedi. <code>npm run scrape</code> komutunu çalıştırın.</p>
      ) : (
        <div className="grid">
          {kategoriler.map((k) => (
            <a key={k.id} href={`/ders/${k.slug}`} className="card">
              {k.icon_url ? (
                <img src={k.icon_url} alt={k.baslik} loading="lazy" />
              ) : (
                <div style={{ width: 64, height: 64, margin: '0 auto 12px', background: '#e0e0e0', borderRadius: 8 }} />
              )}
              <h3>{k.baslik}</h3>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
