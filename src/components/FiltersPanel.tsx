interface FilterOption {
  label: string
  key: string
  values: string[]
}

interface Props {
  open: boolean
  options: FilterOption[]
  activeFilters: Record<string, Set<string>>
  onToggle: (col: string, val: string) => void
  onClear: () => void
}

export function FiltersPanel({ open, options, activeFilters, onToggle, onClear }: Props) {
  if (!open) return null

  return (
    <div className="bg-[#17171f] border border-[#2a2a38] rounded-lg p-4 mb-2">
      <div className="flex flex-wrap gap-6 mb-3">
        {options.map(({ label, key, values }) => (
          <div key={key} className="flex flex-col gap-1.5 min-w-[140px]">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7878a0]">
              {label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {values.map((val) => {
                const selected = activeFilters[key]?.has(val)
                return (
                  <button
                    key={val}
                    onClick={() => onToggle(key, val)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer select-none ${
                      selected
                        ? 'bg-violet-500 border-violet-500 text-white'
                        : 'bg-[#1e1e28] border-[#2a2a38] text-[#7878a0] hover:border-violet-500 hover:text-[#e8e8f0]'
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
        onClick={onClear}
        className="text-[11px] font-medium text-[#7878a0] border border-[#2a2a38] rounded px-3 py-1 hover:text-red-400 hover:border-red-400 transition"
      >
        Limpiar filtros
      </button>
    </div>
  )
}
