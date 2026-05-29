import fs from 'fs'
import path from 'path'

const MAP_PATH = path.join(process.cwd(), 'data', 'evvelcevap-map.json')

interface EvvelcevapSubject {
  name: string
  slug: string | null
  defaultPublisher?: string
}

interface EvvelcevapMap {
  subjects: EvvelcevapSubject[]
}

let mapCache: EvvelcevapMap | null = null

const DEFAULT_PUBLISHER = 'meb'

function getMap(): EvvelcevapMap {
  if (mapCache) return mapCache
  const raw = fs.readFileSync(MAP_PATH, 'utf-8')
  mapCache = JSON.parse(raw) as EvvelcevapMap
  return mapCache
}

export function getEvvelcevapInfo(kategoriBaslik: string): { slug: string | null, publisher: string } {
  const map = getMap()
  const found = map.subjects.find(s => s.name === kategoriBaslik)

  const publisher = found?.defaultPublisher || DEFAULT_PUBLISHER

  if (found?.slug) return { slug: found.slug, publisher }

  const generated = turkceToSlug(kategoriBaslik)
    .replace(/^tc-/, 'tc-')
    .replace(/^t-c-/, 'tc-')
  return { slug: generated || null, publisher }
}

export function getEvvelcevapSlug(kategoriBaslik: string): string | null {
  return getEvvelcevapInfo(kategoriBaslik).slug
}

const SINIF_REGEX = /^(\d+)/

export function getSinifNo(sinifBaslik: string): string | null {
  const match = sinifBaslik.match(SINIF_REGEX)
  return match ? match[1] : null
}

export function turkceToSlug(text: string): string {
  const tr: Record<string, string> = {
    'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c',
    'İ': 'i', 'Ğ': 'g', 'Ü': 'u', 'Ş': 's', 'Ö': 'o', 'Ç': 'c',
    'â': 'a', 'Â': 'a',
  }
  let result = text.toLowerCase()
  for (const [from, to] of Object.entries(tr)) {
    result = result.replaceAll(from, to)
  }
  return result
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
