export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="logo-small">
          <span style={{
            width: 20, height: 20, borderRadius: 4,
            background: 'linear-gradient(135deg, var(--green), var(--blue))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: 700,
          }}>M</span>
          MEB Kitabım Nerede
        </div>
        <p>
          Bu site, Milli Eğitim Bakanlığı OGM Materyal kaynağında bulunan içeriklere hızlı erişim sağlamak amacıyla hazırlanmıştır.<br />
          Tüm içeriklerin telif hakkı MEB&apos;e aittir. Resmi kaynak: <a href="https://ogmmateryal.eba.gov.tr" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>ogmmateryal.eba.gov.tr</a>
        </p>
      </div>
    </footer>
  )
}
