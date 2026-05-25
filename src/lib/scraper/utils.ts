import axios from 'axios'
import * as cheerio from 'cheerio'

const BASE = 'https://ogmmateryal.eba.gov.tr'

export const api = axios.create({
  baseURL: BASE,
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
})

export function extractSubjects(html: string) {
  const $ = cheerio.load(html)
  const subjects: { baslik: string; slug: string; icon: string }[] = []

  $('.books-detail-content a').each((_, el) => {
    const href = $(el).attr('href') || ''
    const baslik = $(el).find('h4').text().trim()
    const icon = $(el).find('img').attr('src') || ''
    const slug = href.replace('/etkilesimli-kitaplar/', '')

    if (baslik && slug) {
      subjects.push({ baslik, slug, icon: icon ? `${BASE}${icon}` : '' })
    }
  })

  return subjects
}

export function extractGrades(html: string) {
  const $ = cheerio.load(html)
  const grades: { id: number; baslik: string; d: number }[] = []

  $('.books-detail-content a').each((_, el) => {
    const href = $(el).attr('href') || ''
    const baslik = $(el).find('h4').text().trim()
    const sMatch = href.match(/[?&]s=(\d+)/)
    const dMatch = href.match(/[?&]d=(\d+)/)
    if (sMatch && baslik) {
      grades.push({ id: parseInt(sMatch[1]), baslik, d: dMatch ? parseInt(dMatch[1]) : 0 })
    }
  })

  return grades
}

export function extractUnits(html: string, dersId: number, sinifId: number) {
  const $ = cheerio.load(html)
  const units: {
    id: number
    baslik: string
    sira: number
    kapak_url: string | null
    ders_id: number
    sinif_id: number
  }[] = []

  $('.books-detail-action-content').each((i, el) => {
    const ribbon = $(el).find('h4.ribbon').text().trim()
    const cover = $(el).find('img').attr('src') || ''
    const links = $(el).find('a')

    let unitId = 0
    links.each((_, link) => {
      const href = $(link).attr('href') || ''
      const match = href.match(/EKitapUniteOnizle\.aspx\?Id=(\d+)/)
      if (match) unitId = parseInt(match[1])
    })

    if (unitId > 0) {
      units.push({
        id: unitId,
        baslik: ribbon,
        sira: i + 1,
        kapak_url: cover || null,
        ders_id: dersId,
        sinif_id: sinifId
      })
    }
  })

  return units
}

export function extractFiles(html: string, unitId: number) {
  const $ = cheerio.load(html)
  const files: { id: number; unite_id: number; tur: 'pdf' | 'zip' | 'interactive'; url: string }[] = []
  let fileId = unitId * 10

  $('.books-detail-action-content').each((_, el) => {
    const links = $(el).find('a')
    links.each((__, link) => {
      const href = $(link).attr('href') || ''

      if (href.includes('EKitapUniteOnizle.aspx')) {
        const url = href.startsWith('http') ? href : `${BASE}${href.startsWith('/') ? '' : '/'}${href}`
        files.push({ id: ++fileId, unite_id: unitId, tur: 'interactive', url })
      } else if (href.endsWith('.pdf')) {
        files.push({ id: ++fileId, unite_id: unitId, tur: 'pdf', url: href })
      } else if (href.endsWith('.zip')) {
        files.push({ id: ++fileId, unite_id: unitId, tur: 'zip', url: href })
      }
    })
  })

  return files
}
