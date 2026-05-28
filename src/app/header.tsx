'use client'

import Link from "next/link"
import { useEffect, useState } from "react"

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light'
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <Link href="/" className="logo">
          <span className="logo-icon">M</span>
          MEB Kitabım Nerede
        </Link>

        <div className="search-bar">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Ders, ünite veya kitap ara..." />
        </div>

        <nav className="header-nav">
          <Link href="/">Ana Sayfa</Link>
          <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Koyu mod' : 'Aydınlık mod'}>
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
