import { useState, useEffect, useMemo, useCallback } from 'react'
import { parseExcel } from '../lib/parser'
import { FILTER_COLUMNS, PRECIO_VENTA_RATE } from '../lib/config'
import type { MangaRow } from '../lib/config'
import { getLatestFile, downloadFileBuffer } from '../lib/supabase'
import { Header } from './Header'
import { Toolbar } from './Toolbar'
import { FiltersPanel } from './FiltersPanel'
import { MangaTable } from './MangaTable'
import { StatsSection } from './StatsSection'
import { UploadModal } from './UploadModal'
import { ChangelogSection } from './ChangelogSection'

export function MangaApp() {
  const [mangas, setMangas] = useState<MangaRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priceMode, setPriceMode] = useState<'lista' | 'venta'>('lista')
  const [statsOpen, setStatsOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [changelogRefreshKey, setChangelogRefreshKey] = useState(0)

  async function loadLatestMangas() {
    setLoading(true)
    setLoadError(null)
    try {
      const file = await getLatestFile()
      if (!file) {
        setLoadError('No hay ningún catálogo subido aún. Subí el primer Excel para comenzar.')
        setLoading(false)
        return
      }

      const buffer = await downloadFileBuffer(file.storage_path)
      const { mangas: parsed } = parseExcel(buffer)
      setMangas(parsed)
    } catch (err) {
      console.error(err)
      setLoadError('Error al cargar el catálogo. Revisá la configuración de Supabase.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLatestMangas()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return mangas.filter((row) => {
      const matchSearch = !q || Object.values(row).some((v) => v.toLowerCase().includes(q))
      const matchFilters = Object.entries(activeFilters).every(([col, vals]) => {
        if (vals.size === 0) return true
        return vals.has(row[col as keyof MangaRow])
      })
      return matchSearch && matchFilters
    })
  }, [mangas, search, activeFilters])

  const filterOptions = useMemo(() => {
    return FILTER_COLUMNS.map(({ label, key }) => ({
      label,
      key,
      values: [...new Set(mangas.map((r) => r[key]).filter(Boolean))].sort(),
    }))
  }, [mangas])

  const activeFilterCount = useMemo(
    () => Object.values(activeFilters).reduce((a, s) => a + s.size, 0),
    [activeFilters]
  )

  const toggleFilter = useCallback((col: string, val: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev }
      const set = new Set(next[col] ?? [])
      set.has(val) ? set.delete(val) : set.add(val)
      next[col] = set
      return next
    })
  }, [])

  const clearFilters = useCallback(() => setActiveFilters({}), [])

  const autocompleteOptions = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return []
    return [...new Set(mangas.map((r) => r.series))]
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 8)
  }, [mangas, search])

  function handleUploadClick() {
    setUploadOpen(true)
  }

  function handleUploadSuccess() {
    setChangelogRefreshKey((k) => k + 1)
    loadLatestMangas()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-bg flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#2a2a38] border-t-violet-500 loader-spin" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-4xl">📭</div>
        <p className="text-[#7878a0] text-sm text-center max-w-sm">{loadError}</p>
        <button
          onClick={handleUploadClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"
        >
          Subir primer catálogo
        </button>
        {uploadOpen && (
          <UploadModal
            previousMangas={mangas}
            onClose={() => setUploadOpen(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header mangas={mangas} priceMode={priceMode} priceRate={PRECIO_VENTA_RATE} />

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 py-5 pb-16">
        <Toolbar
          search={search}
          onSearchChange={setSearch}
          onClearSearch={() => setSearch('')}
          autocompleteOptions={autocompleteOptions}
          onAutocompleteSelect={(v) => setSearch(v)}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((o) => !o)}
          activeFilterCount={activeFilterCount}
          priceMode={priceMode}
          onTogglePriceMode={() => setPriceMode((m) => (m === 'lista' ? 'venta' : 'lista'))}
          onUploadClick={handleUploadClick}
        />

        <FiltersPanel
          open={filtersOpen}
          options={filterOptions}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          onClear={clearFilters}
        />

        <MangaTable data={filtered} priceMode={priceMode} priceRate={PRECIO_VENTA_RATE} />

        <StatsSection mangas={mangas} open={statsOpen} onToggle={() => setStatsOpen((o) => !o)} />

        <ChangelogSection
          open={changelogOpen}
          onToggle={() => setChangelogOpen((o) => !o)}
          refreshKey={changelogRefreshKey}
        />
      </main>

      {uploadOpen && (
        <UploadModal
          previousMangas={mangas}
          onClose={() => setUploadOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}
