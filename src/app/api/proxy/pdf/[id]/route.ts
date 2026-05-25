import { NextRequest, NextResponse } from 'next/server'
import { getKatalog } from '@/lib/db'
import fs from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), 'data', 'cache', 'pdf')

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)
  if (isNaN(id)) return new NextResponse('Geçersiz ID', { status: 400 })

  const { dosyalar } = getKatalog()
  const dosya = dosyalar.find(d => d.unite_id === id && d.tur === 'pdf')
  if (!dosya) return new NextResponse('PDF bulunamadı', { status: 404 })

  const cachedPath = path.join(CACHE_DIR, `${id}.pdf`)
  if (fs.existsSync(cachedPath)) {
    const fileBuffer = fs.readFileSync(cachedPath)
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400'
      }
    })
  }

  try {
    const fetchRes = await fetch(dosya.url)
    if (!fetchRes.ok) throw new Error('OGM yanıt vermedi')
    const buffer = Buffer.from(await fetchRes.arrayBuffer())
    fs.mkdirSync(path.dirname(cachedPath), { recursive: true })
    fs.writeFileSync(cachedPath, buffer)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400'
      }
    })
  } catch {
    return new NextResponse('PDF alınamadı', { status: 502 })
  }
}
