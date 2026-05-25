'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState, useEffect } from 'react'

type Tool = 'none' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line'

const COLORS = ['#000000', '#ff0000', '#0000ff', '#00cc00', '#ff9900', '#9933ff', '#ff00ff', '#00cccc']

function ToolBtn({ active, onClick, title, children }: { active: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 40, height: 40, borderRadius: 8, border: active ? '2px solid #6366f1' : '1px solid #ddd',
      background: active ? '#eef2ff' : '#fff', cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#333',
      transition: 'all 0.15s',
    }}>
      {children}
    </button>
  )
}

function OgmViewer({ url, evvelcevapSlug }: { url: string; evvelcevapSlug: string | null }) {
  const cevapAnahtariUrl = evvelcevapSlug
    ? `https://www.evvelcevap.com/${evvelcevapSlug}-ders-ve-calisma-kitabi-cevaplari/`
    : null

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #ddd', gap: 12, flexShrink: 0 }}>
        <a href="javascript:history.back()" className="back-link" style={{ marginBottom: 0 }}>← Geri</a>
        <span style={{ fontSize: 14, color: '#666' }}>Etkileşimli Kitap</span>
      </div>
      <iframe src={url} style={{ flex: 1, width: '100%', border: 'none' }} allowFullScreen />
      {cevapAnahtariUrl && (
        <a href={cevapAnahtariUrl} target="_blank" rel="noopener noreferrer" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '10px 18px', background: '#6366f1', color: '#fff',
          borderRadius: 8, textDecoration: 'none', fontWeight: 600,
          fontSize: 14, boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          Cevap Anahtarı
        </a>
      )}
    </div>
  )
}

function PdfViewer({ unitId, evvelcevapSlug }: { unitId: string; evvelcevapSlug: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [pageNum, setPageNum] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [tool, setTool] = useState<Tool>('none')
  const [color, setColor] = useState('#000000')
  const [isDrawing, setIsDrawing] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showShapes, setShowShapes] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const startPt = useRef<{ x: number; y: number } | null>(null)
  const renderTask = useRef<any>(null)

  const cevapAnahtariUrl = evvelcevapSlug
    ? `https://www.evvelcevap.com/${evvelcevapSlug}-ders-ve-calisma-kitabi-cevaplari/`
    : null

  const penMode = tool === 'pen' || tool === 'eraser'
  const shapeMode = tool === 'rectangle' || tool === 'circle' || tool === 'line'

  useEffect(() => {
    if (!unitId) { setLoading(false); setError('Kitap ID bulunamadı.'); return }
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`/api/pdf-url/${unitId}`)
        if (!res.ok) throw new Error('PDF URL alınamadı')
        const { proxyUrl } = await res.json()
        if (!proxyUrl) throw new Error('Bu kitap için PDF bulunamadı')

        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const loadingTask = pdfjsLib.getDocument(proxyUrl)
        const pdf = await loadingTask.promise
        if (cancelled) return
        setPdfDoc(pdf)
        setTotalPages(pdf.numPages)
        setLoading(false)
      } catch (err: any) {
        if (!cancelled) { setError(err.message); setLoading(false) }
      }
    }
    load()
    return () => { cancelled = true }
  }, [unitId])

  useEffect(() => {
    if (!pdfDoc) return
    const prevTask = renderTask.current
    if (prevTask) prevTask.cancel()
    const canvas = canvasRef.current
    if (!canvas) return

    ;(async () => {
      try {
        const page = await pdfDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale })
        const cvs = canvas
        cvs.width = viewport.width
        cvs.height = viewport.height
        const ctx = cvs.getContext('2d')
        if (!ctx) return
        const task = page.render({ canvasContext: ctx, viewport })
        renderTask.current = task
        await task.promise
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') console.error(err)
      }
    })()
  }, [pdfDoc, pageNum, scale])

  const goToPage = (n: number) => {
    const p = Math.max(1, Math.min(n, totalPages))
    setPageNum(p)
  }

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseInt(query)
    if (!isNaN(n)) goToPage(n)
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

  if (error) return <p className="error">{error}</p>
  if (loading) return (
    <div className="container" style={{ textAlign: 'center', padding: 80 }}>
      <p className="loading">Kitap yükleniyor...</p>
    </div>
  )

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

      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: penMode ? 40 : 0, transition: 'padding-top 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', background: '#fff', borderBottom: '1px solid #ddd', gap: 12, flexShrink: 0 }}>
          <a href="javascript:history.back()" className="back-link" style={{ marginBottom: 0 }}>← Geri</a>
          <span style={{ fontSize: 14, color: '#666' }}>Sayfa {pageNum} / {totalPages}</span>

          <form onSubmit={handleJump} style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
            <input type="number" min={1} max={totalPages} placeholder="Git..."
              value={query} onChange={e => setQuery(e.target.value)}
              style={{ width: 60, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13, outline: 'none' }}
            />
            <button type="submit" style={{
              padding: '4px 10px', borderRadius: 6, border: 'none',
              background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500,
            }}>Git</button>
          </form>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onClick={() => setScale(s => Math.max(0.3, s - 0.2))} title="Küçült" style={{
              padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 16, lineHeight: 1,
            }}>−</button>
            <span style={{ fontSize: 12, color: '#666', minWidth: 36, textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(3, s + 0.2))} title="Büyüt" style={{
              padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 16, lineHeight: 1,
            }}>+</button>
          </div>
        </div>

        <div style={{
          flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center',
          background: '#f5f5f5', position: 'relative',
          boxShadow: penMode ? '0 0 0 4px #6366f1 inset' : 'none',
          transition: 'box-shadow 0.2s',
        }}>
          <div style={{ position: 'relative', alignSelf: 'flex-start', margin: '20px auto' }}>
            <canvas ref={canvasRef} style={{ display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} />
            <canvas
              ref={drawCanvasRef}
              style={{
                position: 'absolute', top: 0, left: 0,
                pointerEvents: tool === 'none' ? 'none' : 'auto',
                cursor: tool === 'eraser' ? 'not-allowed' : 'crosshair',
                boxShadow: penMode ? '0 0 0 2px #6366f1' : 'none',
              }}
              width={canvasRef.current?.width || 0}
              height={canvasRef.current?.height || 0}
              onMouseDown={onDrawDown} onMouseMove={onDrawMove}
              onMouseUp={onDrawUp} onMouseLeave={onDrawUp}
            />
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: '8px 16px', background: '#fff', borderTop: '1px solid #ddd', flexShrink: 0,
        }}>
          <button onClick={() => goToPage(pageNum - 1)} disabled={pageNum <= 1} style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid #ddd',
            background: '#fff', cursor: pageNum <= 1 ? 'default' : 'pointer', opacity: pageNum <= 1 ? 0.4 : 1,
          }}>◀ Önceki</button>
          <span style={{ fontSize: 13, color: '#666' }}>{pageNum} / {totalPages}</span>
          <button onClick={() => goToPage(pageNum + 1)} disabled={pageNum >= totalPages} style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid #ddd',
            background: '#fff', cursor: pageNum >= totalPages ? 'default' : 'pointer', opacity: pageNum >= totalPages ? 0.4 : 1,
          }}>Sonraki ▶</button>
        </div>
      </div>

      <button
        onClick={() => { setPanelOpen(!panelOpen); if (panelOpen) { setTool('none'); setShowColors(false); setShowShapes(false) } }}
        title="Kalem"
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

      {panelOpen && (
        <div style={{
          position: 'fixed', left: 72, top: '50%', transform: 'translateY(-50%)', zIndex: 2000,
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
      )}

      {cevapAnahtariUrl && (
        <a href={cevapAnahtariUrl} target="_blank" rel="noopener noreferrer" style={{
          position: 'fixed', bottom: 80, right: 24, zIndex: 1000,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '10px 18px', background: '#6366f1', color: '#fff',
          borderRadius: 8, textDecoration: 'none', fontWeight: 600,
          fontSize: 14, boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          Cevap Anahtarı
        </a>
      )}
    </>
  )
}

function OkuContent() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')
  const unitId = searchParams.get('id')
  const evvelcevapSlug = searchParams.get('c')

  if (unitId) {
    return <PdfViewer unitId={unitId} evvelcevapSlug={evvelcevapSlug} />
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
