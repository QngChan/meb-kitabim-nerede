export interface Kategori {
  id: number
  baslik: string
  slug: string
  icon_url: string | null
  ust_id: number | null
  sira: number
}

export interface Sinif {
  id: number
  baslik: string
  slug: string
  sira: number
}

export interface Ders {
  id: number
  baslik: string
  slug: string
  kategori_id: number
  icon_url: string | null
  sinif_ids: string
}

export interface Unite {
  id: number
  baslik: string
  sira: number
  kapak_url: string | null
  ders_id: number
  sinif_id: number | null
}

export interface Kazanim {
  id: number
  baslik: string
  unite_id: number
}

export interface Dosya {
  id: number
  unite_id: number
  tur: 'pdf' | 'zip' | 'interactive'
  url: string
  cache_durumu: 'none' | 'cached' | 'downloading'
  boyut: number | null
}
