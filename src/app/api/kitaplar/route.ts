import { NextRequest, NextResponse } from 'next/server'
import { getKatalog } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { uniteler, dersler } = getKatalog()

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  let results: any[] = []
  if (q) {
    const lower = q.toLowerCase()

    const matchedDersIds = new Set(
      dersler.filter(d => d.baslik.toLowerCase().includes(lower)).map(d => d.id)
    )

    results = uniteler
      .filter(u =>
        u.baslik.toLowerCase().includes(lower) ||
        matchedDersIds.has(u.ders_id)
      )
      .slice(0, 20)
      .map(u => ({
        id: u.id,
        baslik: u.baslik,
        kapak_url: u.kapak_url,
        ders_adi: dersler.find(d => d.id === u.ders_id)?.baslik || ''
      }))
  }

  return NextResponse.json(results)
}
