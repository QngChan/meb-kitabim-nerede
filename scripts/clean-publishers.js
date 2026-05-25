import fs from 'fs'

const raw = JSON.parse(fs.readFileSync('data/evvelcevap-publishers.json', 'utf-8'))

const YEAR_PATTERNS = [/^\d{4}-\d{4}$/]

for (const [subject, grades] of Object.entries(raw)) {
  for (const [grade, publishers] of Object.entries(grades)) {
    raw[subject][grade] = publishers
      .filter(p => !YEAR_PATTERNS.some(r => r.test(p)))
      .map(p => p.replace(/-$/, ''))
      .filter(p => p.length > 0)
  }
}

fs.writeFileSync('data/evvelcevap-publishers.json', JSON.stringify(raw, null, 2), 'utf-8')
console.log('Cleaned')
