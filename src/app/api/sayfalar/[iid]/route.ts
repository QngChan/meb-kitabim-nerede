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
    const pages: string[] = []

    const imgRegex = /<img[^>]+src\s*=\s*"([^"]+)"[^>]*>/gi
    let match: RegExpExecArray | null

    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1]
      if (src.includes('/upload/etki/')) {
        const absUrl = new URL(src, baseUrl).href
        if (!pages.includes(absUrl)) {
          pages.push(absUrl)
        }
      }
    }

    if (pages.length === 0) {
      return NextResponse.json({ error: 'Sayfa resmi bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ pages, totalPages: pages.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
