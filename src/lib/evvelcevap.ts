import fs from 'fs'
import path from 'path'

const MAP_PATH = path.join(process.cwd(), 'data', 'evvelcevap-map.json')
const PUB_PATH = path.join(process.cwd(), 'data', 'evvelcevap-publishers.json')

interface EvvelcevapSubject {
  name: string
  slug: string | null
}

interface EvvelcevapMap {
  subjects: EvvelcevapSubject[]
}

type PublisherMap = Record<string, Record<string, string[]>>

let mapCache: EvvelcevapMap | null = null
let pubCache: PublisherMap | null = null

function getMap(): EvvelcevapMap {
  if (mapCache) return mapCache
  const raw = fs.readFileSync(MAP_PATH, 'utf-8')
  mapCache = JSON.parse(raw) as EvvelcevapMap
  return mapCache
}

function getPubMap(): PublisherMap {
  if (pubCache) return pubCache
  const raw = fs.readFileSync(PUB_PATH, 'utf-8')
  pubCache = JSON.parse(raw) as PublisherMap
  return pubCache
}

export function getEvvelcevapSlug(kategoriBaslik: string): string | null {
  const map = getMap()
  const found = map.subjects.find(s => s.name === kategoriBaslik)
  return found?.slug ?? null
}

const SINIF_REGEX = /^(\d+)/

export function getSinifNo(sinifBaslik: string): string | null {
  const match = sinifBaslik.match(SINIF_REGEX)
  return match ? match[1] : null
}

export function getPublishers(subjectSlug: string, grade: string): string[] {
  const map = getPubMap()
  return map[subjectSlug]?.[grade] ?? []
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

export function buildEvvelcevapSubjectUrl(slug: string): string {
  return `https://www.evvelcevap.com/${slug}-ders-ve-calisma-kitabi-cevaplari/`
}

export function buildEvvelcevapSayfaUrl(slug: string, grade: string, publisher: string, sayfa: number): string {
  return `https://www.evvelcevap.com/${grade}-sinif-${publisher}-${slug}-ders-kitabi-sayfa-${sayfa}-cevabi/`
}
