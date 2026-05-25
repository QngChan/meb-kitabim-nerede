import fs from 'fs'
import path from 'path'

const MAPPED_SUBJECTS = [
  { name: 'Türk Dili ve Edebiyatı', slug: 'turk-dili-ve-edebiyati' },
  { name: 'Tarih', slug: 'tarih' },
  { name: 'Coğrafya', slug: 'cografya' },
  { name: 'Matematik', slug: 'matematik' },
  { name: 'Fizik', slug: 'fizik' },
  { name: 'Kimya', slug: 'kimya' },
  { name: 'Biyoloji', slug: 'biyoloji' },
  { name: 'Felsefe', slug: 'felsefe' },
  { name: 'İngilizce', slug: 'ingilizce' },
  { name: 'Din Kültürü ve Ahlak Bilgisi', slug: 'din-kulturu' },
  { name: 'Almanca', slug: 'almanca' },
]

const GRADES = ['9', '10', '11', '12']

async function fetchText(url) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  })
  return resp.text()
}

function extractBookLinks(html, subjectSlug) {
  const links = []
  const regex = /href="(https?:\/\/www\.evvelcevap\.com\/([^"]+))"/g
  let match
  while ((match = regex.exec(html)) !== null) {
    const pathPart = match[2].replace(/\/$/, '')
    if (!pathPart.includes('ders-kitabi-cevaplari')) continue
    if (pathPart.includes('ders-ve-calisma')) continue
    const gradeMatch = pathPart.match(/^(\d+)-sinif-/)
    if (!gradeMatch) continue
    if (!GRADES.includes(gradeMatch[1])) continue
    links.push(pathPart)
  }
  return [...new Set(links)]
}

function extractPublisher(pathPart, subjectSlug) {
  const gradeMatch = pathPart.match(/^(\d+)-sinif-/)
  const grade = gradeMatch[1]

  const idx = pathPart.indexOf(subjectSlug)
  if (idx === -1) return null

  const afterSubject = pathPart.slice(idx + subjectSlug.length)
  const suffix = '-ders-kitabi-cevaplari'
  let publisher = null

  if (afterSubject.startsWith(suffix + '-') || afterSubject.startsWith(suffix)) {
    const afterSuffix = afterSubject.slice(suffix.length)
    publisher = afterSuffix.replace(/^-/, '').replace(/\/?$/, '')
  } else {
    const beforeSubject = pathPart.slice(0, idx)
    const beforeGrade = beforeSubject.replace(/^\d+-sinif-/, '')
    publisher = beforeGrade.replace(/-$/, '')
  }

  if (publisher) {
    publisher = publisher.replace(/\/?$/, '')
  }

  return { grade, publisher }
}

async function main() {
  const result = {}

  for (const subject of MAPPED_SUBJECTS) {
    const url = `https://www.evvelcevap.com/${subject.slug}-ders-ve-calisma-kitabi-cevaplari/`
    console.log(`Fetching ${url}...`)

    try {
      const html = await fetchText(url)
      const bookLinks = extractBookLinks(html, subject.slug)
      console.log(`  Found ${bookLinks.length} book links`)

      const publishersByGrade = {}

      for (const link of bookLinks) {
        const parsed = extractPublisher(link, subject.slug)
        if (parsed && parsed.publisher) {
          if (!publishersByGrade[parsed.grade]) {
            publishersByGrade[parsed.grade] = new Set()
          }
          publishersByGrade[parsed.grade].add(parsed.publisher)
        }
      }

      const gradeMap = {}
      for (const [grade, publishers] of Object.entries(publishersByGrade)) {
        gradeMap[grade] = [...publishers].sort()
        console.log(`    ${grade}.sınıf: ${[...publishers].sort().join(', ')}`)
      }

      result[subject.slug] = gradeMap
    } catch (err) {
      console.error(`  Error: ${err.message}`)
      result[subject.slug] = {}
    }

    await new Promise(r => setTimeout(r, 1500))
  }

  const outPath = path.join(process.cwd(), 'data', 'evvelcevap-publishers.json')
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8')
  console.log(`\nSaved to ${outPath}`)
}

main().catch(console.error)
