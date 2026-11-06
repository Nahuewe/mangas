import { useMemo } from 'react'
import type { SortState } from '../hooks/useCatalogFilters'
import { editorialClass, estadoClass, serieClass, tamañoClass } from '../lib/badges'
import {
  COLUMN_KEYS,
  COLUMN_LABELS,
  type ColumnKey,
  type MangaRow,
  type PriceMode,
} from '../lib/config'
import { formatMoney } from '../lib/format'
import { ArrowDownIcon, ArrowUpIcon } from './icons'

interface Props {
  data: MangaRow[]
  priceMode: PriceMode
  priceRate: number
  sort: SortState | null
  onSort: (key: ColumnKey) => void
}

export function MangaTable({ data, priceMode, priceRate, sort, onSort }: Props) {
  // Clave estable por serie (con sufijo si el nombre se repite), para que ordenar no recree filas.
  const keyed = useMemo(() => {
    const seen = new Map<string, number>()
    return data.map((row) => {
      const n = seen.get(row.series) ?? 0
      seen.set(row.series, n + 1)
      return { row, key: n === 0 ? row.series : `${row.series}#${n}` }
    })
  }, [data])

  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-tmuted">
        <div className="text-4xl mb-3">¯\_(ツ)_/¯</div>
        <p className="text-lg font-medium">Ese manga no lo tengo</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface scrollbar-thin">
      <table className="w-full border-collapse">
        <thead className="bg-thead sticky z-10">
          <tr>
            {COLUMN_KEYS.map((key) => {
              const sorted = sort?.key === key ? sort.dir : null
              return (
                <th
                  key={key}
                  scope="col"
                  aria-sort={
                    sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                  }
                  className="border-b border-border p-0"
                >
                  <button
                    type="button"
                    onClick={() => onSort(key)}
                    title={`Ordenar por ${COLUMN_LABELS[key]}`}
                    className={`w-full px-3 py-2.5 inline-flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition hover:text-violet-300 ${
                      sorted ? 'text-violet-300' : 'text-violet-400'
                    }`}
                  >
                    {COLUMN_LABELS[key]}
                    <span className="w-3 h-3 inline-block">
                      {sorted === 'asc' && <ArrowUpIcon className="w-3 h-3" />}
                      {sorted === 'desc' && <ArrowDownIcon className="w-3 h-3" />}
                    </span>
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {keyed.map(({ row, key }) => (
            <tr
              key={key}
              className="border-b border-bordersoft last:border-b-0 hover:bg-violet-500/[0.05] transition-colors"
            >
              {COLUMN_KEYS.map((col) => (
                <td key={col} className={cellClass(col)}>
                  <CellContent row={row} colKey={col} priceMode={priceMode} priceRate={priceRate} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function cellClass(key: ColumnKey): string {
  const base = 'px-3 py-2 text-[11px] align-middle'
  if (key === 'series') return `${base} text-left font-medium text-fg min-w-[180px] max-w-[240px]`
  if (key === 'autor' || key === 'dibujante') return `${base} text-center text-tmuted`
  if (key === 'falta') return `${base} text-left text-tmuted min-w-[160px]`
  if (key === 'tomos') return `${base} text-center font-semibold text-tmuted`
  if (key === 'precio' || key === 'total')
    return `${base} text-center font-semibold tabular-nums whitespace-nowrap`
  return `${base} text-center`
}

interface CellProps {
  row: MangaRow
  colKey: ColumnKey
  priceMode: PriceMode
  priceRate: number
}

function CellContent({ row, colKey, priceMode, priceRate }: CellProps) {
  const value = row[colKey]
  if (value === null || value === '') return <span className="text-tdim">—</span>

  switch (colKey) {
    case 'estado':
      return <Badge cls={estadoClass(row.estado)}>{row.estado}</Badge>
    case 'editorial':
      return <Badge cls={editorialClass(row.editorial)}>{row.editorial}</Badge>
    case 'tamaño':
      return <Badge cls={tamañoClass(row.tamaño)}>{row.tamaño}</Badge>
    case 'estadoSerie':
      return <Badge cls={serieClass(row.estadoSerie)}>{row.estadoSerie}</Badge>
    case 'precio':
    case 'total': {
      const n = value as number
      return priceMode === 'venta' ? (
        <span className="text-gradient-price font-bold">
          {formatMoney(Math.round(n * priceRate))}
        </span>
      ) : (
        <span>{formatMoney(n)}</span>
      )
    }
    default:
      return <span>{value}</span>
  }
}

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${cls}`}
    >
      {children}
    </span>
  )
}
