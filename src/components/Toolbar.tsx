import { useEffect, useId, useState } from 'react'
import type { PriceMode } from '../lib/config'
import { FilterIcon, PriceIcon, SearchIcon, UploadIcon, XIcon } from './icons'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  autocompleteOptions: string[]
  filtersOpen: boolean
  onToggleFilters: () => void
  activeFilterCount: number
  priceMode: PriceMode
  onTogglePriceMode: () => void
  onUploadClick: () => void
}

const BTN_BASE =
  'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition'
const BTN_IDLE = 'bg-surface border-border text-fg'

export function Toolbar({
  search,
  onSearchChange,
  autocompleteOptions,
  filtersOpen,
  onToggleFilters,
  activeFilterCount,
  priceMode,
  onTogglePriceMode,
  onUploadClick,
}: Props) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const expanded = open && autocompleteOptions.length > 0

  useEffect(() => setActive(-1), [autocompleteOptions])

  function select(value: string) {
    onSearchChange(value)
    setOpen(false)
    setActive(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setOpen(true)
        setActive((i) => (i + 1) % Math.max(autocompleteOptions.length, 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive((i) => (i <= 0 ? autocompleteOptions.length - 1 : i - 1))
        break
      case 'Enter':
        if (expanded && autocompleteOptions.length > 0) {
          e.preventDefault()
          select(autocompleteOptions[active >= 0 ? active : 0])
        }
        break
      case 'Escape':
        if (expanded) setOpen(false)
        else onSearchChange('')
        break
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-2">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-tmuted pointer-events-none" />
        <input
          type="text"
          role="combobox"
          aria-label="Buscar manga"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar manga..."
          autoComplete="off"
          className="w-full bg-surface border border-border rounded-lg text-fg text-sm pl-8 pr-8 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-tdim transition"
        />
        {search && (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-tdim hover:text-red-400 transition p-0.5"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        )}

        {expanded && (
          <ul
            id={listId}
            role="listbox"
            className="absolute top-[calc(100%+4px)] left-0 right-0 bg-surface2 border border-border rounded-lg max-h-64 overflow-y-auto z-50 shadow-xl"
          >
            {autocompleteOptions.map((opt, i) => (
              <li
                key={opt}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // mousedown (y no click) para seleccionar antes de que el input pierda el foco
                onMouseDown={(e) => {
                  e.preventDefault()
                  select(opt)
                }}
                className={`px-3 py-2 text-xs cursor-pointer border-b border-bordersoft last:border-b-0 transition ${
                  i === active
                    ? 'bg-violet-500/15 text-violet-400'
                    : 'text-fg hover:bg-violet-500/15 hover:text-violet-400'
                }`}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={onToggleFilters}
          className={`${BTN_BASE} ${
            filtersOpen || activeFilterCount > 0
              ? 'bg-violet-500/15 border-violet-500 text-violet-400'
              : `${BTN_IDLE} hover:border-violet-500 hover:text-violet-400`
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
          type="button"
          aria-pressed={priceMode === 'venta'}
          onClick={onTogglePriceMode}
          className={`${BTN_BASE} ${
            priceMode === 'venta'
              ? 'bg-emerald-400/10 border-emerald-400 text-emerald-400'
              : `${BTN_IDLE} hover:bg-emerald-400/10 hover:border-emerald-400 hover:text-emerald-400`
          }`}
        >
          <PriceIcon className="w-3.5 h-3.5" />
          {priceMode === 'venta' ? 'Precio de Lista' : 'Precio de Venta'}
        </button>

        <button
          type="button"
          onClick={onUploadClick}
          className={`${BTN_BASE} ${BTN_IDLE} hover:bg-violet-500/10 hover:border-violet-500 hover:text-violet-400`}
        >
          <UploadIcon className="w-3.5 h-3.5" />
          Actualizar catálogo
        </button>
      </div>
    </div>
  )
}
