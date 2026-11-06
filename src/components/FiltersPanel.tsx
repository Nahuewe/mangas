import type { TextKey } from '../lib/config'
import type { ActiveFilters } from '../hooks/useCatalogFilters'

interface FilterOption {
  label: string
  key: TextKey
  values: string[]
}

interface Props {
  open: boolean
  options: FilterOption[]
  activeFilters: ActiveFilters
  onToggle: (key: TextKey, value: string) => void
  onClear: () => void
}

export function FiltersPanel({ open, options, activeFilters, onToggle, onClear }: Props) {
  if (!open) return null

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-2">
      <div className="flex flex-wrap gap-6 mb-3">
        {options.map(({ label, key, values }) => (
          <div
            key={key}
            role="group"
            aria-label={label}
            className="flex flex-col gap-1.5 min-w-[140px]"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-tmuted">
              {label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {values.map((val) => {
                const selected = activeFilters[key]?.has(val) ?? false
                return (
                  <button
                    key={val}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onToggle(key, val)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer select-none ${
                      selected
                        ? 'bg-violet-500 border-violet-500 text-white'
                        : 'bg-surface2 border-border text-tmuted hover:border-violet-500 hover:text-fg'
                    }`}
                  >
                    {val}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="text-[11px] font-medium text-tmuted border border-border rounded px-3 py-1 hover:text-red-400 hover:border-red-400 transition"
      >
        Limpiar filtros
      </button>
    </div>
  )
}
