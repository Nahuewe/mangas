import { useCallback, useState } from 'react'
import { useCatalog } from '../hooks/useCatalog'
import { useCatalogFilters } from '../hooks/useCatalogFilters'
import { PRECIO_VENTA_RATE, type PriceMode } from '../lib/config'
import { ChangelogSection } from './ChangelogSection'
import { FiltersPanel } from './FiltersPanel'
import { Header } from './Header'
import { Spinner } from './icons'
import { MangaTable } from './MangaTable'
import { StatsSection } from './StatsSection'
import { Toolbar } from './Toolbar'
import { UploadModal } from './UploadModal'

const PRIMARY_BTN =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition'

export function MangaApp() {
  const { mangas, status, error, reload } = useCatalog()
  const filters = useCatalogFilters(mangas)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [changelogOpen, setChangelogOpen] = useState(false)
  const [priceMode, setPriceMode] = useState<PriceMode>('lista')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [changelogRefreshKey, setChangelogRefreshKey] = useState(0)

  const closeUpload = useCallback(() => setUploadOpen(false), [])
  const handleUploadSuccess = useCallback(() => {
    setChangelogRefreshKey((k) => k + 1)
    reload()
  }, [reload])

  const uploadModal = uploadOpen && (
    <UploadModal previousMangas={mangas} onClose={closeUpload} onSuccess={handleUploadSuccess} />
  )

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-bg flex items-center justify-center">
        <Spinner className="w-12 h-12" />
      </div>
    )
  }

  if (status === 'empty' || status === 'error') {
    return (
      <div className="fixed inset-0 bg-bg flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-4xl">{status === 'empty' ? '📭' : '⚠️'}</div>
        <p className="text-tmuted text-sm text-center max-w-sm">
          {status === 'empty'
            ? 'No hay ningún catálogo subido aún. Subí el primer Excel para comenzar.'
            : 'No se pudo cargar el catálogo. Revisá tu conexión y la configuración de Supabase.'}
        </p>
        {status === 'error' && error && (
          <p className="text-[11px] text-tdim text-center max-w-sm">{error}</p>
        )}
        <div className="flex gap-2">
          {status === 'error' && (
            <button type="button" onClick={reload} className={PRIMARY_BTN}>
              Reintentar
            </button>
          )}
          <button type="button" onClick={() => setUploadOpen(true)} className={PRIMARY_BTN}>
            Subir {status === 'empty' ? 'primer ' : ''}catálogo
          </button>
        </div>
        {uploadModal}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header mangas={mangas} priceMode={priceMode} priceRate={PRECIO_VENTA_RATE} />

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 py-5 pb-16">
        <Toolbar
          search={filters.search}
          onSearchChange={filters.setSearch}
          autocompleteOptions={filters.autocompleteOptions}
          filtersOpen={filtersOpen}
          onToggleFilters={() => setFiltersOpen((o) => !o)}
          activeFilterCount={filters.activeFilterCount}
          priceMode={priceMode}
          onTogglePriceMode={() => setPriceMode((m) => (m === 'lista' ? 'venta' : 'lista'))}
          onUploadClick={() => setUploadOpen(true)}
        />

        <FiltersPanel
          open={filtersOpen}
          options={filters.filterOptions}
          activeFilters={filters.activeFilters}
          onToggle={filters.toggleFilter}
          onClear={filters.clearFilters}
        />

        <MangaTable
          data={filters.rows}
          priceMode={priceMode}
          priceRate={PRECIO_VENTA_RATE}
          sort={filters.sort}
          onSort={filters.toggleSort}
        />

        <StatsSection mangas={mangas} open={statsOpen} onToggle={() => setStatsOpen((o) => !o)} />

        <ChangelogSection
          open={changelogOpen}
          onToggle={() => setChangelogOpen((o) => !o)}
          refreshKey={changelogRefreshKey}
        />
      </main>

      {uploadModal}
    </div>
  )
}
