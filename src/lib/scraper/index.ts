import { getKatalog, saveKatalog } from '../db'
import { api, extractSubjects, extractGrades, extractUnits, extractFiles } from './utils'
import type { Kategori, Ders, Sinif, Unite, Dosya } from '../types'

export async function scrapeAll() {
  console.log('=== OGM Materyal Scraper ===\n')

  const katalog = getKatalog()
  katalog.kategoriler = []
  katalog.dersler = []
  katalog.siniflar = []
  katalog.uniteler = []
  katalog.dosyalar = []

  const res = await api.get('/etkilesimli-kitaplar')
  const subjects = extractSubjects(res.data)

  let katId = 0
  for (const sub of subjects) {
    katId++
    katalog.kategoriler.push({
      id: katId, baslik: sub.baslik, slug: sub.slug,
      icon_url: sub.icon, ust_id: null, sira: katId
    })
    katalog.dersler.push({
      id: katId, baslik: sub.baslik, slug: sub.slug,
      kategori_id: katId, icon_url: sub.icon, sinif_ids: ''
    })
  }
  saveKatalog()
  console.log(`${subjects.length} kategori bulundu`)

  const CONCURRENCY = 3

  const seenSinifIds = new Set<number>()

  const topla = async (sub: { baslik: string; slug: string }) => {
    console.log(`  Isleniyor: ${sub.baslik}`)
    try {
      const res = await api.get(`/etkilesimli-kitaplar/${sub.slug}`)
      const grades = extractGrades(res.data)

      for (const grade of grades) {
        if (!seenSinifIds.has(grade.id)) {
          seenSinifIds.add(grade.id)
          katalog.siniflar.push({
            id: grade.id, baslik: grade.baslik,
            slug: grade.baslik.toLowerCase().replace(/\s+/g, '-'),
            sira: grade.id
          })
        }

        const ders = katalog.dersler.find(d => d.slug === sub.slug)
        if (!ders) continue

        const unitRes = await api.get(`/etkilesimli-kitap/${sub.slug}?s=${grade.id}&d=${grade.d}&u=0&k=0`)
        const units = extractUnits(unitRes.data, ders.id, grade.id)

        for (const unit of units) {
          katalog.uniteler.push({
            id: unit.id, baslik: unit.baslik, sira: unit.sira,
            kapak_url: unit.kapak_url, ders_id: unit.ders_id, sinif_id: unit.sinif_id
          })

          const files = extractFiles(unitRes.data, unit.id)
          for (const file of files) {
            katalog.dosyalar.push({
              id: file.id, unite_id: file.unite_id,
              tur: file.tur, url: file.url,
              cache_durumu: 'none', boyut: null
            })
          }
        }
      }
    } catch (err) {
      console.error(`  Hata: ${sub.baslik}`, (err as Error).message)
    }
  }

  for (let i = 0; i < subjects.length; i += CONCURRENCY) {
    const batch = subjects.slice(i, i + CONCURRENCY)
    await Promise.all(batch.map(topla))
    saveKatalog()
  }

  console.log(`\n${katalog.uniteler.length} unite, ${katalog.dosyalar.length} dosya kaydedildi`)
  console.log('=== Tarama tamamlandi ===')
}

if (require.main === module) {
  scrapeAll().catch(console.error)
}
