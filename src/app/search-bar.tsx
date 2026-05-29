'use client'

import Link from "next/link"
import { useRef, useState, useEffect, useCallback } from "react"

interface SearchResult {
  id: number
  baslik: string
  kapak_url: string | null
  ders_adi: string
}

let globalSearchId = 0

export default function SearchBar({ variant = "header" }: { variant?: "header" | "hero" }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const searchIdRef = useRef(0)

  const doSearch = useCallback(async (q: string) => {
    const id = ++searchIdRef.current
    if (q.length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/kitaplar?q=${encodeURIComponent(q)}`)
      const data: SearchResult[] = await res.json()
      if (id !== searchIdRef.current) return
      setResults(data)
      setOpen(data.length > 0)
      setSelectedIdx(-1)
    } catch { } finally {
      if (id === searchIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 200)
    return () => clearTimeout(timer)
  }, [query, doSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, 0))
    } else if (e.key === "Enter" && selectedIdx >= 0 && results[selectedIdx]) {
      window.location.href = `/kitap/${results[selectedIdx].id}`
      setOpen(false)
    } else if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const select = (r: SearchResult) => {
    setOpen(false)
    setQuery("")
    window.location.href = `/kitap/${r.id}`
  }

  return (
    <div className={`search-bar${variant === "hero" ? " hero-search" : ""}`}>
      {variant === "hero" && (
        <svg className="hero-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      )}
      {variant === "header" && (
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      )}
      <input
        ref={inputRef}
        type="text"
        placeholder="Ders, ünite veya kitap ara..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true) }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKeyDown}
      />
      {loading && <span className="search-spinner" />}
      {open && results.length > 0 && (
        <div className="search-dropdown" ref={listRef}>
          {results.map((r, i) => (
            <div
              key={r.id}
              className={`search-item${i === selectedIdx ? " selected" : ""}`}
              onMouseDown={() => select(r)}
            >
              {r.kapak_url && <img src={r.kapak_url} alt="" className="search-item-img" />}
              <div className="search-item-info">
                <span className="search-item-title">{r.baslik}</span>
                <span className="search-item-ders">{r.ders_adi}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
