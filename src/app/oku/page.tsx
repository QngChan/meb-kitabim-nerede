'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState, useEffect } from 'react'

type Tool = 'none' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line'

const COLORS = ['#000000', '#ff0000', '#0000ff', '#00cc00', '#ff9900', '#9933ff', '#ff00ff', '#00cccc']

function Reader() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const evvelcevapSlug = searchParams.get('c')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('none')
  const [color, setColor] = useState('#000000')
  const [lineWidth] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [showColors, setShowColors] = useState(false)
  const [showShapes, setShowShapes] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const startPt = useRef<{ x: number; y: number } | null>(null)

  const cevapAnahtariUrl = evvelcevapSlug
    ? `https://www.evvelcevap.com/${evvelcevapSlug}-ders-ve-calisma-kitabi-cevaplari/`
    : null

  const penMode = tool === 'pen' || tool === 'eraser'
  const shapeMode = tool === 'rectangle' || tool === 'circle' || tool === 'line'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const p = canvas.parentElement
      if (!p) return
      canvas.width = p.clientWidth
      canvas.height = p.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const pos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current
    if (!c) return { x: 0, y: 0 }
    const r = c.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const onDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'none') return
    const p = pos(e)
    startPt.current = p
    if (tool === 'pen' || tool === 'eraser') {
      setIsDrawing(true)
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
    }
  }

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (tool !== 'pen' && tool !== 'eraser')) return
    const p = pos(e)
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = 20
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
    }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const onUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'none') return
    if (isDrawing && (tool === 'pen' || tool === 'eraser')) {
      setIsDrawing(false)
      return
    }
    if (shapeMode && startPt.current) {
      const end = pos(e)
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      const sx = startPt.current.x, sy = startPt.current.y, ex = end.x, ey = end.y
      ctx.beginPath()
      if (tool === 'rectangle') ctx.rect(sx, sy, ex - sx, ey - sy)
      else if (tool === 'circle') {
        const cx = (sx + ex) / 2, cy = (sy + ey) / 2
        ctx.ellipse(cx, cy, Math.abs(ex - sx) / 2, Math.abs(ey - sy) / 2, 0, 0, Math.PI * 2)
      } else if (tool === 'line') { ctx.moveTo(sx, sy); ctx.lineTo(ex, ey) }
      ctx.stroke()
      setTool('none')
    }
    startPt.current = null
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const resetAll = () => {
    clearCanvas()
    setIframeKey(k => k + 1)
    setTool('none')
    setShowColors(false)
    setShowShapes(false)
  }

  const togglePen = () => {
    if (tool === 'pen') { setTool('none'); setShowColors(false); return }
    setTool('pen'); setShowColors(true); setShowShapes(false)
  }

  const toggleEraser = () => {
    setTool(prev => prev === 'eraser' ? 'none' : 'eraser')
    setShowShapes(false); setShowColors(false)
  }

  const selectShape = (s: Tool) => { setTool(s); setShowShapes(false); setShowColors(false) }

  if (!url) return <p className="error">Geçersiz URL parametresi.</p>

  return (
    <>
      {penMode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#6366f1', color: '#fff', textAlign: 'center',
          padding: '10px', fontSize: 13, fontWeight: 500,
        }}>
          ✏️ Kalem modundasınız. Çıkmak için tekrar kaleme basın.
        </div>
      )}

      <div className="container" style={{ padding: 0, maxWidth: '100%', paddingTop: penMode ? 40 : 0, transition: 'padding-top 0.2s' }}>

        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #ddd' }}>
          <a href="javascript:history.back()" className="back-link" style={{ marginBottom: 0 }}>← Geri</a>
          <span style={{ marginLeft: 16, fontSize: 14, color: '#666' }}>Etkileşimli Kitap Okuyucu</span>
        </div>

        <div style={{
          position: 'relative',
          boxShadow: penMode ? '0 0 0 4px #6366f1 inset' : 'none',
          transition: 'box-shadow 0.2s',
        }}>
          <iframe
            key={iframeKey}
            src={url}
            className="reader-iframe"
            allow="fullscreen"
            title="Etkileşimli Kitap"
            style={{ display: 'block' }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              pointerEvents: tool === 'none' ? 'none' : 'auto',
              cursor: tool === 'eraser' ? 'not-allowed' : 'crosshair',
            }}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
          />
        </div>

        {cevapAnahtariUrl && (
          <a href={cevapAnahtariUrl} target="_blank" rel="noopener noreferrer" style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', background: '#6366f1', color: '#fff',
            borderRadius: 8, textDecoration: 'none', fontWeight: 600,
            fontSize: 14, boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Cevap Anahtarı
          </a>
        )}
      </div>

      {/* Floating pen toggle button on left */}
      <button
        onClick={() => { setPanelOpen(!panelOpen); if (panelOpen) { setTool('none'); setShowColors(false); setShowShapes(false) } }}
        title={panelOpen ? 'Kapat' : 'Kalem'}
        style={{
          position: 'fixed', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2000,
          width: 44, height: 44, borderRadius: '50%', border: penMode ? '2px solid #6366f1' : '1px solid #ddd',
          background: penMode ? '#eef2ff' : '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
        </svg>
      </button>

      {/* Floating panel */}
      {panelOpen && (
        <div style={{
          position: 'fixed', left: 72, top: '50%', transform: 'translateY(-50%)', zIndex: 2000,
          background: '#fff', borderRadius: 12, border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          padding: '10px', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 48, alignItems: 'center',
        }}>
          {/* Pen */}
          <button onClick={togglePen} title="Kalem" style={{
            width: 40, height: 40, borderRadius: 8, border: tool === 'pen' ? '2px solid #6366f1' : '1px solid #ddd',
            background: tool === 'pen' ? '#eef2ff' : '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
            </svg>
          </button>

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

          {/* Eraser */}
          <button onClick={toggleEraser} title="Silgi" style={{
            width: 40, height: 40, borderRadius: 8, border: tool === 'eraser' ? '2px solid #6366f1' : '1px solid #ddd',
            background: tool === 'eraser' ? '#eef2ff' : '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.6 1.6a2 2 0 0 1 2.8 0L21 5.2a2 2 0 0 1 0 2.8L12 17"/>
            </svg>
          </button>

          {/* Shapes */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setShowShapes(!showShapes); setShowColors(false) }} title="Şekiller" style={{
              width: 40, height: 40, borderRadius: 8, border: shapeMode ? '2px solid #6366f1' : '1px solid #ddd',
              background: shapeMode ? '#eef2ff' : '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><circle cx="17.5" cy="9.5" r="3.5"/><path d="M5 16 9 20M9 16 5 20"/>
              </svg>
            </button>
            {showShapes && (
              <div style={{
                position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)',
                marginLeft: 8, background: '#fff', border: '1px solid #ddd', borderRadius: 8,
                padding: 4, display: 'flex', gap: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>
                {([
                  ['rectangle', '▬'],
                  ['circle', '●'],
                  ['line', '╱'],
                ] as const).map(([s, label]) => (
                  <button key={s} onClick={() => selectShape(s)} style={{
                    width: 36, height: 36, borderRadius: 6, border: tool === s ? '2px solid #6366f1' : '1px solid #ddd',
                    background: tool === s ? '#eef2ff' : '#fff', cursor: 'pointer', fontSize: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{label}</button>
                ))}
              </div>
            )}
          </div>

          {/* Separator */}
          <div style={{ width: 32, height: 1, background: '#ddd' }} />

          {/* Clear */}
          <button onClick={clearCanvas} title="Temizle" style={{
            width: 40, height: 40, borderRadius: 8, border: '1px solid #ddd',
            background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e53935',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>

          {/* Sıfırla */}
          <button onClick={resetAll} title="Sayfayı sıfırla" style={{
            width: 40, height: 40, borderRadius: 8, border: '1px solid #ddd',
            background: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>
      )}
    </>
  )
}

export default function OkuPage() {
  return (
    <Suspense fallback={<p className="loading">Yükleniyor...</p>}>
      <Reader />
    </Suspense>
  )
}
