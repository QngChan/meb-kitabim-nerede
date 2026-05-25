import { NextResponse } from 'next/server'
import { getKatalog } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)
  if (isNaN(id)) return NextResponse.json({ error: 'Geçersiz ID' }, { status: 400 })

  const { dosyalar } = getKatalog()
  const dosya = dosyalar.find(d => d.unite_id === id && d.tur === 'pdf')
  if (!dosya) return NextResponse.json({ error: 'PDF bulunamadı' }, { status: 404 })

  return NextResponse.json({ proxyUrl: `/api/proxy/pdf/${id}` })
}
