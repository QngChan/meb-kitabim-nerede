'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState, useEffect, useCallback } from 'react'

type Tool = 'none' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line'

const COLORS = ['#000000', '#ff0000', '#0000ff', '#00cc00', '#ff9900', '#9933ff', '#ff00ff', '#00cccc']

function ToolBtn({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 40, height: 40, borderRadius: 8, border: active ? '2px solid #6366f1' : '1px solid #ddd',
      background: active ? '#eef2ff' : '#fff', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#333',
    }}>
      {children}
    </button>
  )
}

function BarBtn({ active, onClick, title, children, disabled }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={{
      height: 44, minWidth: 44, padding: '0 10px',
      border: 'none', background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
      cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1,
      color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, borderRadius: 0,
    }}>
      {children}
    </button>
  )
}

function OgmViewer({ url, evvelcevapSlug }: { url: string; evvelcevapSlug: string | null }) {
  const cevapAnahtariUrl = evvelcevapSlug
    ? `https://www.evvelcevap.com/${evvelcevapSlug}-kitabi-cevaplari/`
    : null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #ddd', gap: 12, flexShrink: 0 }}>
        <a href="javascript:history.back()" className="back-link" style={{ marginBottom: 0 }}>← Geri</a>
      </div>
      <iframe src={url} style={{ flex: 1, width: '100%', border: 'none' }} allowFullScreen />
      {cevapAnahtariUrl && (
        <a href={cevapAnahtariUrl} target="_blank" rel="noopener noreferrer" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          background: '#6366f1', color: '#fff', borderRadius: 8, textDecoration: 'none',
          fontWeight: 600, fontSize: 14, boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
        }}>
          Cevap Anahtarı
        </a>
      )}
    </div>
  )
}

function ImageViewer({ iid, evvelcevapSlug }: { iid: string; evvelcevapSlug: string | null }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const panning = useRef(false)
  const panStart = useRef({ x: 0, y: 0, sx: 0, sy: 0 })
  const [pages, setPages] = useState<string[]>([])
  const [pageIdx, setPageIdx] = useState(0)
  const [firstPage, setFirstPage] = useState(1)
  const [scale, setScale] = useState(1)
  const [dispW, setDispW] = useState(0)
  const [dispH, setDispH] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tool, setTool] = useState<Tool>('none')
  const [color, setColor] = useState('#000000')
  const [isDrawing, setIsDrawing] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showShapes, setShowShapes] = useState(false)
  const [panMode, setPanMode] = useState(false)
  const [showThumbs, setShowThumbs] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const startPt = useRef<{ x: number; y: number } | null>(null)
  const naturalSize = useRef({ w: 0, h: 0 })
  const searchRef = useRef<HTMLInputElement>(null)
  const pageDrawings = useRef<Map<number, HTMLCanvasElement>>(new Map())
  const pageIdxRef = useRef(0)

  const cevapAnahtariUrl = evvelcevapSlug
    ? `https://www.evvelcevap.com/${evvelcevapSlug}-kitabi-cevaplari/`
    : null

  const penMode = tool === 'pen' || tool === 'eraser'
  const shapeMode = tool === 'rectangle' || tool === 'circle' || tool === 'line'

  const calcFitScale = useCallback((nw: number, nh: number) => {
    const maxW = window.innerWidth - 40
    const maxH = window.innerHeight - 96
    return Math.min(maxW / nw, maxH / nh, 1)
  }, [])

  const applySize = useCallback((nw: number, nh: number, s: number) => {
    setDispW(Math.round(nw * s))
    setDispH(Math.round(nh * s))
  }, [])

  const fitToScreen = useCallback(() => {
    const img = imgRef.current
    if (!img) return false
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    if (!nw || !nh) return false
    naturalSize.current = { w: nw, h: nh }
    const s = calcFitScale(nw, nh)
    setScale(s)
    applySize(nw, nh, s)
    return true
  }, [calcFitScale, applySize])

  const thumbUrls = useRef<string[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/sayfalar/${iid}`)
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Sayfalar yüklenemedi')
        }
        const data = await res.json()
        if (cancelled) return
        setPages(data.pages)
        if (data.firstPage) setFirstPage(data.firstPage)
        thumbUrls.current = data.pages.map((p: string) => {
          const m = p.match(/\/upload\/etki\/(\d+)\/(\d+)\.jpg$/)
          if (m) return `https://ogmmateryal.eba.gov.tr/panel/upload/etki/${m[1]}/thumb/${m[2]}.jpg`
          return p
        })
        setLoading(false)
      } catch (err: any) {
        if (!cancelled) { setError(err.message); setLoading(false) }
      }
    }
    load()
    return () => { cancelled = true }
  }, [iid])

  useEffect(() => {
    const img = imgRef.current
    if (img?.complete) {
      if (fitToScreen()) return
    }
  }, [pageIdx, fitToScreen])

  useEffect(() => {
    pageIdxRef.current = pageIdx
    const c = drawCanvasRef.current
    if (!c || !c.width || !c.height) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    const saved = pageDrawings.current.get(pageIdx)
    if (saved) { ctx.drawImage(saved, 0, 0) }
  }, [pageIdx])

  useEffect(() => {
    const c = drawCanvasRef.current
    if (!c || !dispW) return
    c.width = dispW
    c.height = dispH
    const ctx = c.getContext('2d')
    if (!ctx) return
    const saved = pageDrawings.current.get(pageIdx)
    if (saved) { ctx.drawImage(saved, 0, 0) }
  }, [dispW, dispH])

  const fullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = drawCanvasRef.current
    if (!c) return { x: 0, y: 0 }
    const r = c.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onDrawDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'none') return
    const p = getPos(e)
    startPt.current = p
    if (tool === 'pen' || tool === 'eraser') {
      setIsDrawing(true)
      const ctx = drawCanvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
    }
  }

  const onDrawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (tool !== 'pen' && tool !== 'eraser')) return
    const p = getPos(e)
    const ctx = drawCanvasRef.current?.getContext('2d')
    if (!ctx) return
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = 20
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = 3
    }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const onDrawUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'none') return
    if (isDrawing && (tool === 'pen' || tool === 'eraser')) {
      setIsDrawing(false)
      return
    }
    if (shapeMode && startPt.current) {
      const end = getPos(e)
      const ctx = drawCanvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      const sx = startPt.current.x, sy = startPt.current.y, ex = end.x, ey = end.y
      ctx.beginPath()
      if (tool === 'rectangle') ctx.rect(sx, sy, ex - sx, ey - sy)
      else if (tool === 'circle') {
        ctx.ellipse((sx + ex) / 2, (sy + ey) / 2, Math.abs(ex - sx) / 2, Math.abs(ey - sy) / 2, 0, 0, Math.PI * 2)
      } else if (tool === 'line') { ctx.moveTo(sx, sy); ctx.lineTo(ex, ey) }
      ctx.stroke()
      setTool('none')
    }
    startPt.current = null
  }

  const clearDrawings = () => {
    const c = drawCanvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    pageDrawings.current.delete(pageIdx)
  }

  const togglePen = () => {
    if (tool === 'pen') { setTool('none'); setShowColors(false); return }
    setTool('pen'); setShowColors(true); setShowShapes(false); setPanMode(false)
  }

  const toggleEraser = () => {
    setTool(prev => prev === 'eraser' ? 'none' : 'eraser')
    setShowShapes(false); setShowColors(false)
  }

  const selectShape = (s: Tool) => { setTool(s); setShowShapes(false); setShowColors(false) }

  const startPan = (e: React.MouseEvent) => {
    if (!panMode) return
    panning.current = true
    panStart.current = { x: e.clientX, y: e.clientY, sx: scrollRef.current?.scrollLeft || 0, sy: scrollRef.current?.scrollTop || 0 }
  }

  const movePan = (e: React.MouseEvent) => {
    if (!panning.current || !panMode || !scrollRef.current) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    scrollRef.current.scrollLeft = panStart.current.sx - dx
    scrollRef.current.scrollTop = panStart.current.sy - dy
  }

  const saveCurrentDrawing = useCallback(() => {
    const c = drawCanvasRef.current
    if (!c || !c.width || !c.height) return
    const offscreen = document.createElement('canvas')
    offscreen.width = c.width
    offscreen.height = c.height
    const offCtx = offscreen.getContext('2d')
    if (!offCtx) return
    offCtx.drawImage(c, 0, 0)
    pageDrawings.current.set(pageIdxRef.current, offscreen)
  }, [])

  const goToPage = useCallback((n: number) => {
    const newIdx = Math.max(0, Math.min(n, pages.length - 1))
    saveCurrentDrawing()
    setPageIdx(newIdx)
    setShowThumbs(false)
  }, [pages.length, saveCurrentDrawing])

  const zoomTo = (newScale: number) => {
    const { w, h } = naturalSize.current
    if (!w || !h) return
    setScale(newScale)
    applySize(w, h, newScale)
  }

  const endPan = () => { panning.current = false }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToPage(pageIdx + 1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToPage(pageIdx - 1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [pageIdx, goToPage])

  if (error) return <p className="error">{error}</p>
  if (loading) return (
    <div className="container" style={{ textAlign: 'center', padding: 80 }}>
      <p className="loading">Kitap yükleniyor...</p>
    </div>
  )
  if (pages.length === 0) return <p className="error">Bu kitapta sayfa bulunamadı.</p>

  return (
    <>
      {penMode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#6366f1', color: '#fff', textAlign: 'center',
          padding: '10px', fontSize: 13, fontWeight: 500,
        }}>
          ✏️ Kalem modundasınız. Çıkmak için araç çubuğundan kaleme tekrar basın.
        </div>
      )}

      {showSearch && (
        <div style={{
          position: 'fixed', top: 50, left: '50%', transform: 'translateX(-50%)', zIndex: 9998,
          background: '#fff', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center', minWidth: 320,
        }}>
          <input ref={searchRef} type="text" placeholder="Sayfa numarası girin..."
            defaultValue=""
            onKeyDown={e => {
              if (e.key !== 'Enter') return
              const v = (e.target as HTMLInputElement).value
              const n = parseInt(v) - firstPage
              if (!isNaN(n) && n >= 0) goToPage(n)
              setShowSearch(false)
            }}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd', fontSize: 14, outline: 'none' }}
            autoFocus
          />
          <button onClick={() => {
            if (!searchRef.current) return
            const n = parseInt(searchRef.current.value) - firstPage
            if (!isNaN(n) && n >= 0) goToPage(n)
            setShowSearch(false)
          }} style={{
            padding: '8px 14px', borderRadius: 6, background: '#6366f1', color: '#fff',
            border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13,
          }}>Git</button>
          <button onClick={() => setShowSearch(false)} style={{
            padding: '8px 10px', borderRadius: 6, background: '#f5f5f5', color: '#666',
            border: '1px solid #ddd', cursor: 'pointer', fontSize: 16,
          }}>✕</button>
        </div>
      )}

      {/* Thumbnails modal */}
      {showThumbs && (
        <div onClick={() => setShowThumbs(false)} style={{
          position: 'fixed', inset: 0, zIndex: 9997,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#222', borderRadius: 12, padding: 20, maxWidth: '90vw', maxHeight: '80vh',
            overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
          }}>
            {pages.map((_, i) => (
              <div key={i} onClick={() => goToPage(i)} style={{
                cursor: 'pointer', borderRadius: 6, overflow: 'hidden',
                border: i === pageIdx ? '3px solid #6366f1' : '2px solid transparent',
                opacity: i === pageIdx ? 1 : 0.6, transition: 'opacity 0.15s',
              }}>
                <img src={thumbUrls.current[i]} alt={`S.${i + firstPage}`} style={{ width: 120, height: 160, objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div style={{ textAlign: 'center', color: '#fff', fontSize: 11, padding: '4px 0', background: '#333' }}>
                  {i + firstPage}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} style={{
        height: '100vh', overflow: 'auto', display: 'flex', justifyContent: 'center',
        background: '#f5f5f5', position: 'relative',
        paddingBottom: 52,
        cursor: panMode ? 'grab' : (panning.current ? 'grabbing' : 'default'),
      }}>
        <div ref={imgWrapRef} onMouseDown={startPan} onMouseMove={movePan} onMouseUp={endPan} onMouseLeave={endPan}
          style={{ position: 'relative', alignSelf: 'flex-start', margin: '20px auto' }}>
          <img
            ref={imgRef}
            src={pages[pageIdx]}
            alt={`Sayfa ${pageIdx + firstPage}`}
            draggable={false}
            onLoad={fitToScreen}
            width={dispW || undefined}
            height={dispH || undefined}
            style={{ display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', userSelect: 'none' }}
          />
          {dispW > 0 && (
            <canvas
              ref={drawCanvasRef}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                pointerEvents: tool === 'none' || panMode ? 'none' : 'auto',
                cursor: tool === 'eraser' ? 'not-allowed' : 'crosshair',
              }}
              onMouseDown={onDrawDown} onMouseMove={onDrawMove}
              onMouseUp={onDrawUp} onMouseLeave={onDrawUp}
            />
          )}
        </div>
      </div>

      {/* OGM-style bottom toolbar (fixed) */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 52, background: '#3a3b3f', color: '#fff',
        padding: '0 4px', userSelect: 'none',
      }}>
          {/* Left group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <BarBtn onClick={() => { const d = new URLSearchParams(); d.set('id', iid); window.open(`/api/proxy/pdf/${iid}`) }} title="PDF İndir">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </BarBtn>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.15)' }} />
            <BarBtn onClick={() => zoomTo(Math.max(0.3, scale - 0.2))} title="Küçült">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </BarBtn>
            <BarBtn onClick={() => zoomTo(Math.min(3, scale + 0.2))} title="Büyüt">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </BarBtn>
            <BarBtn active={panMode} onClick={() => { setPanMode(!panMode); if (!panMode) setTool('none') }} title="El (Sürükle)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v1M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 0 1 4 0v6a8 8 0 0 1-8 8h-2c-2.21 0-4.21-.9-5.7-2.3L2.7 15.7a1.5 1.5 0 0 1 0-2.1l.1-.1a1.8 1.8 0 0 1 2.6.2L8 16v-5.5"/></svg>
            </BarBtn>
            <BarBtn onClick={fitToScreen} title="Sıfırla">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/></svg>
            </BarBtn>
          </div>

          {/* Center group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <BarBtn onClick={() => goToPage(0)} disabled={pageIdx <= 0} title="İlk Sayfa">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
            </BarBtn>
            <BarBtn onClick={() => goToPage(pageIdx - 1)} disabled={pageIdx <= 0} title="Önceki">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </BarBtn>
            <div onClick={() => setShowThumbs(true)} title="Sayfa listesi" style={{
              cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '0 12px',
              minWidth: 80, textAlign: 'center', lineHeight: '44px', whiteSpace: 'nowrap',
            }}>
              {pageIdx + firstPage} / {pages.length}
            </div>
            <BarBtn onClick={() => goToPage(pageIdx + 1)} disabled={pageIdx >= pages.length - 1} title="Sonraki">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </BarBtn>
            <BarBtn onClick={() => goToPage(pages.length - 1)} disabled={pageIdx >= pages.length - 1} title="Son Sayfa">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
            </BarBtn>
          </div>

          {/* Right group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <BarBtn onClick={() => setShowSearch(true)} title="Sayfaya Git">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </BarBtn>
            <BarBtn onClick={() => setShowThumbs(true)} title="Küçük Resimler">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </BarBtn>
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.15)' }} />
            <BarBtn onClick={fullscreen} title="Tam Ekran">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </BarBtn>
          </div>
        </div>

      {/* Drawing panel (left side) */}
      <div style={{
        position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2000,
          background: '#fff', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          padding: '10px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 48, alignItems: 'center',
        }}>
          <ToolBtn active={tool === 'pen'} onClick={togglePen} title="Kalem">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </ToolBtn>
          {showColors && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} title={c} style={{
                  width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer', padding: 0,
                  border: color === c ? '2px solid #6366f1' : '2px solid #e0e0e0',
                }} />
              ))}
            </div>
          )}
          <ToolBtn active={tool === 'eraser'} onClick={toggleEraser} title="Silgi">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.6 1.6a2 2 0 0 1 2.8 0L21 5.2a2 2 0 0 1 0 2.8L12 17"/></svg>
          </ToolBtn>
          <div style={{ position: 'relative' }}>
            <ToolBtn active={shapeMode} onClick={() => { setShowShapes(!showShapes); setShowColors(false) }} title="Şekiller">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><circle cx="17.5" cy="9.5" r="3.5"/><path d="M5 16 9 20M9 16 5 20"/></svg>
            </ToolBtn>
            {showShapes && (
              <div style={{
                position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)',
                marginLeft: 8, background: '#fff', border: '1px solid #ddd', borderRadius: 8,
                padding: 4, display: 'flex', gap: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                {([['rectangle','▬'],['circle','●'],['line','╱']] as const).map(([s,lb]) => (
                  <button key={s} onClick={() => selectShape(s)} style={{
                    width: 36, height: 36, borderRadius: 6, border: tool === s ? '2px solid #6366f1' : '1px solid #ddd',
                    background: tool === s ? '#eef2ff' : '#fff', cursor: 'pointer', fontSize: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{lb}</button>
                ))}
              </div>
            )}
          </div>
          <div style={{ width: 32, height: 1, background: '#ddd' }} />
          <button onClick={clearDrawings} title="Temizle" style={{
            width: 40, height: 40, borderRadius: 8, border: '1px solid #ddd',
            background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e53935',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>

      {cevapAnahtariUrl && (
        <a href={cevapAnahtariUrl} target="_blank" rel="noopener noreferrer" style={{
          position: 'fixed', bottom: 68, right: 24, zIndex: 1000,
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          background: '#6366f1', color: '#fff', borderRadius: 8, textDecoration: 'none',
          fontWeight: 600, fontSize: 14, boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
        }}>
          Cevap Anahtarı
        </a>
      )}
    </>
  )
}

function OkuContent() {
  const searchParams = useSearchParams()
  const iid = searchParams.get('iid')
  const url = searchParams.get('url')
  const evvelcevapSlug = searchParams.get('c')

  if (iid) {
    return <ImageViewer iid={iid} evvelcevapSlug={evvelcevapSlug} />
  }
  if (url) {
    return <OgmViewer url={url} evvelcevapSlug={evvelcevapSlug} />
  }
  return <p className="error">Geçersiz bağlantı. Lütfen bir kitap seçin.</p>
}

export default function OkuPage() {
  return (
    <Suspense fallback={<p className="loading" style={{ padding: 80 }}>Yükleniyor...</p>}>
      <OkuContent />
    </Suspense>
  )
}
