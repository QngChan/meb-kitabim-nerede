import { getKatalog } from '@/lib/db'
import SubjectIcon from './subject-icon'
import SearchBar from './search-bar'

export default async function HomePage() {
  const { kategoriler } = getKatalog()

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Kitabını Bul, Hemen Oku!</h1>
          <p>MEB ders kitaplarına hızlı ve ücretsiz erişim. İstediğin dersi seç, kitabını bul, hemen okumaya başla.</p>
          <SearchBar variant="hero" />
        </div>
      </section>

      <div className="container" style={{ marginTop: 32 }}>
        <h2 className="section-title">Ders Kitapları</h2>
        {kategoriler.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>Katalog henüz yüklenmedi</h3>
            <p><code>npm run scrape</code> komutunu çalıştırarak kataloğu oluşturabilirsiniz.</p>
          </div>
        ) : (
          <div className="category-grid">
            {kategoriler.map((k) => (
              <a key={k.id} href={`/ders/${k.slug}`} className="category-card">
                <SubjectIcon slug={k.slug} size={48} />
                <h3>{k.baslik}</h3>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
