import type { MangaRow } from './config'

export interface Totals {
  series: number
  tomos: number
  valor: number
  sinLeer: number
}

export function computeTotals(mangas: MangaRow[]): Totals {
  let tomos = 0
  let valor = 0
  let sinLeer = 0
  for (const r of mangas) {
    tomos += r.tomos ?? 0
    valor += r.total ?? 0
    if (r.falta && r.falta !== '—') sinLeer++
  }
  return { series: mangas.length, tomos, valor, sinLeer }
}
