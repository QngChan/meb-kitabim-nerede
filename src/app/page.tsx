import { getKatalog } from '@/lib/db'
import SubjectIcon from './subject-icon'

export default async function HomePage() {
  const { kategoriler } = getKatalog()

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Kitabını Bul, Hemen Oku!</h1>
          <p>MEB ders kitaplarına hızlı ve ücretsiz erişim. İstediğin dersi seç, kitabını bul, hemen okumaya başla.</p>
          <div className="hero-search">
            <svg className="hero-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Ders, ünite veya kitap ara..." id="hero-search-input" />
          </div>
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
