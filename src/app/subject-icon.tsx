export default function SubjectIcon({ slug, size = 48 }: { slug: string; size?: number }) {
  const s = size
  const props = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

  const icons: Record<string, React.ReactNode> = {
    "tde": <svg {...props}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>,
    "tarih": <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    "cografya": <svg {...props}><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    "felsefe": <svg {...props}><path d="M15 14s.5-1 1.5-1 2.5.5 2.5 2c0 1.5-1 2-3 3.5-1.5 1-2.5 2-2.5 3"/><path d="M6 6h2a4 4 0 0 1 4 4v11"/><path d="M10 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14"/></svg>,
    "inkilap-tarihi": <svg {...props}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    "matematik": <svg {...props}><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-4"/><path d="M6 10V4"/></svg>,
    "fizik": <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M12 1v4"/><path d="M12 19v4"/><path d="M4.22 4.22l2.83 2.83"/><path d="M16.95 16.95l2.83 2.83"/><path d="M1 12h4"/><path d="M19 12h4"/><path d="M4.22 19.78l2.83-2.83"/><path d="M16.95 7.05l2.83-2.83"/></svg>,
    "kimya": <svg {...props}><path d="M18 8h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3.17"/><path d="M14 2h4v4"/><path d="m10 16 4-4"/><path d="m14 16-4-4"/></svg>,
    "biyoloji": <svg {...props}><path d="M12 22s8-4 8-10c0-4-3.5-8-8-8s-8 4-8 8c0 6 8 10 8 10z"/><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M12 12v4"/></svg>,
    "ingilizce": <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    "almanca": <svg {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    "astronomi-uzay-bilimleri": <svg {...props}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a6 6 0 0 1 8.48-2.45l-5.03 5.45z"/><path d="M21 11A10 10 0 1 1 11 1"/></svg>,
    "beden-egitimi": <svg {...props}><circle cx="12" cy="5" r="1"/><path d="M7 21.5 9 14l4-3 4 3 2 7.5"/><path d="M9 11 5.5 7.5"/><path d="M15 11l3.5-3.5"/></svg>,
    "bilgisayar-bilimi": <svg {...props}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    "ekonomi": <svg {...props}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    "isletme": <svg {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/></svg>,
    "muzik": <svg {...props}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    "gorsel-sanatlar": <svg {...props}><circle cx="13.5" cy="6.5" r="2.5"/><path d="M13 13.5 21 21"/><path d="m3 21 9-13 9 13"/></svg>,
    "psikoloji": <svg {...props}><path d="M12 2a4 4 0 0 1 4 4c0 2-1 3-2 4-1 1-2 2-2 4 0 2 1 3 2 4"/><path d="M12 2a4 4 0 0 0-4 4c0 2 1 3 2 4 1 1 2 2 2 4 0 2-1 3-2 4"/><path d="M2 22c1.5-2 3.5-3 6-3 2.5 0 4.5 1 6 3"/><path d="M22 22c-1.5-2-3.5-3-6-3-2.5 0-4.5 1-6 3"/></svg>,
    "mantik": <svg {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    "din": <svg {...props}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    "saglik-bilgisi-trafik-kulturu": <svg {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    "proje-hazirlama": <svg {...props}><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>,
    "insan-haklari": <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  }

  const defaultIcon = <svg {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>

  return (
    <span style={{
      width: size, height: size, borderRadius: 10,
      background: "var(--blue-light)", color: "var(--blue)",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {icons[slug] || defaultIcon}
    </span>
  )
}
