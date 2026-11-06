import {
  COLUMN_ALIASES,
  COLUMN_KEYS,
  STATS_ROW_MARKER,
  isNumericKey,
  type ColumnKey,
  type MangaRow,
} from './config'
import { normalizeHeader } from './text'

export interface ParsedData {
  mangas: MangaRow[]
}

/** Convierte una celda en número. Acepta `4500`, `"$ 4.500"`, `"4.500,50"` y `"4500.5"`. */
export function parseNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (value === null || value === undefined) return null
  const text = String(value).replace(/[$\s]/g, '')
  if (text === '' || text === '—') return null

  const normalized = /^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(text)
    ? text.replace(/\./g, '').replace(',', '.') // formato es-AR
    : text.replace(',', '.')

  const n = parseFloat(normalized)
  return Number.isNaN(n) ? null : n
}

/**
 * Busca la posición de cada columna por el texto del encabezado.
 * Si falta alguna, usa el orden fijo de `COLUMN_KEYS` como respaldo.
 */
export function resolveColumns(headerRow: unknown[]): Record<ColumnKey, number> {
  const header = headerRow.map((c) => normalizeHeader(String(c ?? '')))
  const found = {} as Record<ColumnKey, number>
  let allFound = true

  for (const key of COLUMN_KEYS) {
    const idx = header.findIndex((h) => COLUMN_ALIASES[key].includes(h))
    if (idx === -1) allFound = false
    found[key] = idx
  }

  if (allFound) return found

  const positional = {} as Record<ColumnKey, number>
  COLUMN_KEYS.forEach((key, idx) => (positional[key] = idx))
  return positional
}

/** Convierte las filas crudas de la hoja (la primera es el encabezado) en mangas. */
export function rowsToMangas(rows: unknown[][]): MangaRow[] {
  if (rows.length === 0) return []

  const columns = resolveColumns(rows[0] ?? [])
  const mangas: MangaRow[] = []

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every((c) => c === '' || c === null || c === undefined)) continue
    if (String(row[0] ?? '').trim() === STATS_ROW_MARKER) break

    const obj = {} as Record<ColumnKey, string | number | null>
    for (const key of COLUMN_KEYS) {
      const cell = row[columns[key]]
      obj[key] = isNumericKey(key) ? parseNumber(cell) : String(cell ?? '').trim()
    }

    if (obj.series) mangas.push(obj as MangaRow)
  }

  return mangas
}

/** Lee un archivo Excel/CSV. SheetJS se carga recién acá para no pesar en el bundle inicial. */
export async function parseExcel(buffer: ArrayBuffer): Promise<ParsedData> {
  const XLSX = await import('xlsx')
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })
  return { mangas: rowsToMangas(rows) }
}

export function groupCount(
  data: MangaRow[],
  key: Exclude<ColumnKey, 'tomos' | 'precio' | 'total'>
) {
  const counts = new Map<string, number>()
  for (const r of data) {
    const v = r[key] || 'Sin dato'
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}
