import fs from 'fs'
import path from 'path'

const MAP_PATH = path.join(process.cwd(), 'data', 'evvelcevap-map.json')
const PUBLISHERS_PATH = path.join(process.cwd(), 'data', 'evvelcevap-publishers.json')

interface EvvelcevapSubject {
  name: string
  slug: string | null
  defaultPublisher?: string
}

interface EvvelcevapMap {
  subjects: EvvelcevapSubject[]
}

interface EvvelcevapPublishers {
  [slug: string]: {
    [grade: string]: string[]
  }
}

let mapCache: EvvelcevapMap | null = null
let publishersCache: EvvelcevapPublishers | null = null

const DEFAULT_PUBLISHER = 'meb'

function getMap(): EvvelcevapMap {
  if (mapCache) return mapCache
  const raw = fs.readFileSync(MAP_PATH, 'utf-8')
  mapCache = JSON.parse(raw) as EvvelcevapMap
  return mapCache
}

function getPublishers(): EvvelcevapPublishers {
  if (publishersCache) return publishersCache
  const raw = fs.readFileSync(PUBLISHERS_PATH, 'utf-8')
  publishersCache = JSON.parse(raw) as EvvelcevapPublishers
  return publishersCache
}

export function getEvvelcevapInfo(kategoriBaslik: string, sinifNo?: number | null): { slug: string | null, publisher: string, hasPage: boolean } {
  const map = getMap()
  const found = map.subjects.find(s => s.name === kategoriBaslik)

  let slug = found?.slug ?? null
  if (!slug) {
    const generated = turkceToSlug(kategoriBaslik)
      .replace(/^tc-/, 'tc-')
      .replace(/^t-c-/, 'tc-')
    slug = generated || null
  }

  if (!slug) return { slug: null, publisher: DEFAULT_PUBLISHER, hasPage: false }

  const defaultPublisher = found?.defaultPublisher || DEFAULT_PUBLISHER
  const publishers = getPublishers()
  const gradePublishers = publishers[slug]

  let publisher = defaultPublisher
  let hasPage = true

  if (gradePublishers === undefined) {
    hasPage = false
  } else if (sinifNo) {
    const gradeKey = String(sinifNo)
    if (gradePublishers[gradeKey]?.length) {
      publisher = gradePublishers[gradeKey][0]
    } else {
      hasPage = false
    }
  } else {
    if (Object.keys(gradePublishers).length === 0) {
      hasPage = false
    }
  }

  return { slug, publisher, hasPage }
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
