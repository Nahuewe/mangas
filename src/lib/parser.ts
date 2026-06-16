import * as XLSX from 'xlsx'
import { COLUMN_KEYS, STATS_ROW_MARKER } from './config'
import type { ColumnKey, MangaRow } from './config'

export interface ParsedData {
  mangas: MangaRow[]
}

export function parseExcel(buffer: ArrayBuffer): ParsedData {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })

  const mangas: MangaRow[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as string[]
    if (!row || row.every((c) => c === '')) continue
    if (String(row[0]).trim() === STATS_ROW_MARKER) break

    const obj = {} as MangaRow
    COLUMN_KEYS.forEach((key, idx) => {
      obj[key] = String(row[idx] ?? '').trim()
    })

    if (obj.series) mangas.push(obj)
  }

  return { mangas }
}

export function formatPrice(value: string): string {
  const n = parseFloat(value)
  return isNaN(n) ? value : '$ ' + n.toLocaleString('es-AR')
}

export function groupCount(data: MangaRow[], key: ColumnKey): [string, number][] {
  const counts: Record<string, number> = {}
  data.forEach((r) => {
    const v = r[key] || 'Sin dato'
    counts[v] = (counts[v] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}
