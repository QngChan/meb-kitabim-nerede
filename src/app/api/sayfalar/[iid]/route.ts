import { NextResponse } from 'next/server'

const OGM_BASE = 'https://ogmmateryal.eba.gov.tr'

export async function GET(_req: Request, { params }: { params: Promise<{ iid: string }> }) {
  const iid = (await params).iid
  if (!iid || !/^\d+$/.test(iid)) {
    return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 })
  }

  try {
    const url = `${OGM_BASE}/panel/panel/EKitapUniteOnizle.aspx?Id=${iid}`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Sayfa yüklenemedi' }, { status: 502 })
    }

    const html = await res.text()
    const baseUrl = new URL(url)

    const pageRegex = /<img[^>]+src\s*=\s*"([^"]+)"[^>]*>/gi
    const pageMap = new Map<number, string>()
    let match: RegExpExecArray | null

    while ((match = pageRegex.exec(html)) !== null) {
      const src = match[1]
      if (!src.includes('/upload/etki/')) continue
      const absUrl = new URL(src, baseUrl).href
      const numMatch = absUrl.match(/\/(\d+)\.jpg$/i)
      if (!numMatch) continue
      const pageNum = parseInt(numMatch[1], 10)
      if (isNaN(pageNum) || pageNum < 1) continue
      if (!pageMap.has(pageNum)) {
        pageMap.set(pageNum, absUrl)
      }
    }

    if (pageMap.size === 0) {
      return NextResponse.json({ error: 'Sayfa resmi bulunamadı' }, { status: 404 })
    }

    const sorted = [...pageMap.entries()].sort(([a], [b]) => a - b)
    const pages = sorted.map(([, url]) => url)
    const firstPage = sorted[0]?.[0] ?? 1

    return NextResponse.json({ pages, totalPages: pages.length, firstPage })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
