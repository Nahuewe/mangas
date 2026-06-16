import { useRef, useState } from 'react'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  onClearSearch: () => void
  autocompleteOptions: string[]
  onAutocompleteSelect: (v: string) => void
  filtersOpen: boolean
  onToggleFilters: () => void
  activeFilterCount: number
  priceMode: 'lista' | 'venta'
  onTogglePriceMode: () => void
  onUploadClick: () => void
}

export function Toolbar({
  search, onSearchChange, onClearSearch,
  autocompleteOptions, onAutocompleteSelect,
  filtersOpen, onToggleFilters, activeFilterCount,
  priceMode, onTogglePriceMode, onUploadClick,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { onClearSearch() }
    if (e.key === 'Enter' && autocompleteOptions[0]) {
      onAutocompleteSelect(autocompleteOptions[0])
      setShowSuggestions(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-2">
      <div ref={wrapperRef} className="relative flex-1 min-w-[200px] max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7878a0] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value)
            setShowSuggestions(true)
          }}
          onBlur={() => { setTimeout(() => setShowSuggestions(false), 150) }}
          onFocus={() => { if (autocompleteOptions.length > 0) setShowSuggestions(true) }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar manga..."
          autoComplete="off"
          className="w-full bg-[#17171f] border border-[#2a2a38] rounded-lg text-[#e8e8f0] text-sm pl-8 pr-8 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-[#4a4a6a] transition"
        />
        {search && (
          <button
            onClick={onClearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4a4a6a] hover:text-red-400 transition p-0.5"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        )}

        {showSuggestions && autocompleteOptions.length > 0 && (
          <ul className="absolute top-[calc(100%+4px)] left-0 right-0 bg-[#1e1e28] border border-[#2a2a38] rounded-lg max-h-64 overflow-y-auto z-50 shadow-xl">
            {autocompleteOptions.map((opt) => (
              <li
                key={opt}
                onClick={() => { onAutocompleteSelect(opt); setShowSuggestions(false) }}
                className="px-3 py-2 text-xs text-[#e8e8f0] cursor-pointer border-b border-[#222230] last:border-b-0 hover:bg-violet-500/15 hover:text-violet-400 transition"
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onToggleFilters}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition ${
            filtersOpen || activeFilterCount > 0
              ? 'bg-violet-500/15 border-violet-500 text-violet-400'
              : 'bg-[#17171f] border-[#2a2a38] text-[#e8e8f0] hover:border-violet-500 hover:text-violet-400'
          }`}
        >
          <FilterIcon className="w-3.5 h-3.5" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="bg-violet-500 text-white rounded-full text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {activeFilterCount}
            </span>
          )}
        </button>

        <button
          onClick={onTogglePriceMode}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition ${
            priceMode === 'venta'
              ? 'bg-emerald-400/10 border-emerald-400 text-emerald-400'
              : 'bg-[#17171f] border-[#2a2a38] text-[#e8e8f0] hover:bg-emerald-400/10 hover:border-emerald-400 hover:text-emerald-400'
          }`}
        >
          <PriceIcon className="w-3.5 h-3.5" />
          {priceMode === 'venta' ? 'Precio de Lista' : 'Precio de Venta'}
        </button>

        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#2a2a38] bg-[#17171f] text-[#e8e8f0] text-xs font-semibold hover:bg-violet-500/10 hover:border-violet-500 hover:text-violet-400 transition"
        >
          <UploadIcon className="w-3.5 h-3.5" />
          Actualizar catálogo
        </button>
      </div>
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  )
}
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </svg>
  )
}
function PriceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
