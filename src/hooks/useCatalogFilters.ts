import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import {
  COLUMN_KEYS,
  FILTER_COLUMNS,
  isNumericKey,
  type ColumnKey,
  type MangaRow,
  type TextKey,
} from '../lib/config'
import { normalizeText } from '../lib/text'

export type ActiveFilters = Partial<Record<TextKey, Set<string>>>
export interface SortState {
  key: ColumnKey
  dir: 'asc' | 'desc'
}

// ── Estado en la URL (?q=berserk&editorial=Ivrea&sort=precio&dir=desc) ──────

function readUrl(): { search: string; filters: ActiveFilters; sort: SortState | null } {
  const params = new URLSearchParams(window.location.search)
  const filters: ActiveFilters = {}
  for (const { key } of FILTER_COLUMNS) {
    const values = params.getAll(key)
    if (values.length) filters[key] = new Set(values)
  }
  const sortKey = params.get('sort') as ColumnKey | null
  const sort =
    sortKey && COLUMN_KEYS.includes(sortKey)
      ? { key: sortKey, dir: params.get('dir') === 'desc' ? ('desc' as const) : ('asc' as const) }
      : null
  return { search: params.get('q') ?? '', filters, sort }
}

function writeUrl(search: string, filters: ActiveFilters, sort: SortState | null) {
  const params = new URLSearchParams()
  if (search) params.set('q', search)
  for (const { key } of FILTER_COLUMNS) filters[key]?.forEach((v) => params.append(key, v))
  if (sort) {
    params.set('sort', sort.key)
    params.set('dir', sort.dir)
  }
  const qs = params.toString()
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
}

// ── Orden ────────────────────────────────────────────────────────────────────

function compareRows(a: MangaRow, b: MangaRow, key: ColumnKey): number {
  const av = a[key]
  const bv = b[key]
  // Los vacíos van siempre al final, en cualquier sentido.
  const aEmpty = av === null || av === ''
  const bEmpty = bv === null || bv === ''
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1
  if (isNumericKey(key)) return (av as number) - (bv as number)
  return String(av).localeCompare(String(bv), 'es', { numeric: true, sensitivity: 'base' })
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCatalogFilters(mangas: MangaRow[]) {
  const [initial] = useState(readUrl)
  const [search, setSearch] = useState(initial.search)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(initial.filters)
  const [sort, setSort] = useState<SortState | null>(initial.sort)

  useEffect(() => writeUrl(search, activeFilters, sort), [search, activeFilters, sort])

  // La búsqueda se calcula con el valor "diferido" para que escribir no se trabe con catálogos grandes.
  const deferredSearch = useDeferredValue(search)

  const searchable = useMemo(
    () => mangas.map((row) => ({ row, haystack: normalizeText(Object.values(row).join(' ')) })),
    [mangas]
  )

  const rows = useMemo(() => {
    const q = normalizeText(deferredSearch)
    const filtered = searchable
      .filter(({ row, haystack }) => {
        if (q && !haystack.includes(q)) return false
        return FILTER_COLUMNS.every(({ key }) => {
          const selected = activeFilters[key]
          return !selected || selected.size === 0 || selected.has(row[key])
        })
      })
      .map(({ row }) => row)

    if (!sort) return filtered
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      const emptyA = av === null || av === ''
      const emptyB = bv === null || bv === ''
      if (emptyA || emptyB) return compareRows(a, b, sort.key) // vacíos al final siempre
      return compareRows(a, b, sort.key) * factor
    })
  }, [searchable, deferredSearch, activeFilters, sort])

  const filterOptions = useMemo(
    () =>
      FILTER_COLUMNS.map(({ label, key }) => ({
        label,
        key,
        values: [...new Set(mangas.map((r) => r[key]).filter(Boolean))].sort((a, b) =>
          a.localeCompare(b, 'es')
        ),
      })),
    [mangas]
  )

  const activeFilterCount = useMemo(
    () => Object.values(activeFilters).reduce((n, set) => n + (set?.size ?? 0), 0),
    [activeFilters]
  )

  const seriesNames = useMemo(() => [...new Set(mangas.map((r) => r.series))], [mangas])
  const autocompleteOptions = useMemo(() => {
    const q = normalizeText(search)
    if (!q) return []
    return seriesNames.filter((s) => normalizeText(s).includes(q)).slice(0, 8)
  }, [seriesNames, search])

  const toggleFilter = useCallback((key: TextKey, value: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev[key])
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return { ...prev, [key]: next }
    })
  }, [])

  const clearFilters = useCallback(() => setActiveFilters({}), [])

  /** Alterna asc → desc → sin orden al hacer clic repetido en la misma columna. */
  const toggleSort = useCallback((key: ColumnKey) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }, [])

  return {
    rows,
    search,
    setSearch,
    activeFilters,
    activeFilterCount,
    filterOptions,
    autocompleteOptions,
    toggleFilter,
    clearFilters,
    sort,
    toggleSort,
  }
}
