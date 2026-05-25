import fs from 'fs'
import path from 'path'
import type { Unite, Dosya, Ders, Kategori, Sinif } from './types'

const DB_PATH = path.join(process.cwd(), 'data', 'katalog.json')

export interface Katalog {
  kategoriler: Kategori[]
  siniflar: Sinif[]
  dersler: Ders[]
  uniteler: Unite[]
  dosyalar: Dosya[]
}

let cache: Katalog | null = null

export function getKatalog(): Katalog {
  if (cache) return cache
  if (fs.existsSync(DB_PATH)) {
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    cache = JSON.parse(raw) as Katalog
  } else {
    cache = { kategoriler: [], siniflar: [], dersler: [], uniteler: [], dosyalar: [] }
  }
  return cache as Katalog
}

export function saveKatalog(): void {
  if (!cache) return
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2), 'utf-8')
}

export function initKatalog(): Katalog {
  const data = getKatalog()
  return data
}
