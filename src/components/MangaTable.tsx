import { COLUMN_KEYS, COLUMN_LABELS } from '../lib/config'
import type { MangaRow, ColumnKey } from '../lib/config'
import { formatPrice } from '../lib/parser'
import { estadoClass, editorialClass, tamañoClass, serieClass } from '../lib/badges'

interface Props {
  data: MangaRow[]
  priceMode: 'lista' | 'venta'
  priceRate: number
}

export function MangaTable({ data, priceMode, priceRate }: Props) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16 text-[#7878a0]">
        <div className="text-4xl mb-3">¯\_(ツ)_/¯</div>
        <p className="text-lg font-medium">Ese manga no lo tengo</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#2a2a38] bg-[#17171f] scrollbar-thin">
      <table className="w-full border-collapse">
        <thead className="bg-[#1a1528] sticky z-10">
          <tr>
            {COLUMN_KEYS.map((key) => (
              <th
                key={key}
                className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-widest text-violet-400 border-b border-[#2a2a38] whitespace-nowrap"
              >
                {COLUMN_LABELS[key]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[#222230] last:border-b-0 hover:bg-violet-500/[0.05] transition-colors"
            >
              {COLUMN_KEYS.map((key) => (
                <td key={key} className={cellClass(key)}>
                  <CellContent colKey={key} value={row[key]} priceMode={priceMode} priceRate={priceRate} />
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
  if (key === 'series') return `${base} text-left font-medium text-[#e8e8f0] min-w-[180px] max-w-[240px]`
  if (key === 'autor' || key === 'dibujante') return `${base} text-center text-[#7878a0]`
  if (key === 'falta') return `${base} text-left text-[#7878a0] min-w-[160px]`
  if (key === 'tomos') return `${base} text-center font-semibold text-[#7878a0]`
  if (key === 'precio' || key === 'total') return `${base} text-center font-semibold tabular-nums whitespace-nowrap`
  return `${base} text-center`
}

interface CellProps {
  colKey: ColumnKey
  value: string
  priceMode: 'lista' | 'venta'
  priceRate: number
}

function CellContent({ colKey, value, priceMode, priceRate }: CellProps) {
  if (!value || value === '') {
    return <span className="text-[#4a4a6a]">—</span>
  }

  switch (colKey) {
    case 'estado':
      return <Badge cls={estadoClass(value)}>{value}</Badge>
    case 'editorial':
      return <Badge cls={editorialClass(value)}>{value}</Badge>
    case 'tamaño':
      return <Badge cls={tamañoClass(value)}>{value}</Badge>
    case 'estadoSerie':
      return <Badge cls={serieClass(value)}>{value}</Badge>
    case 'precio': {
      const n = parseFloat(value)
      if (isNaN(n)) return <span>{value}</span>
      if (priceMode === 'venta') {
        return <span className="text-gradient-price font-bold">$ {Math.round(n * priceRate).toLocaleString('es-AR')}</span>
      }
      return <span>{formatPrice(value)}</span>
    }
    case 'total': {
      const n = parseFloat(value)
      if (isNaN(n)) return <span>{value}</span>
      if (priceMode === 'venta') {
        return <span className="text-gradient-price font-bold">$ {Math.round(n * priceRate).toLocaleString('es-AR')}</span>
      }
      return <span>{formatPrice(value)}</span>
    }
    default:
      return <span>{value}</span>
  }
}

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${cls}`}>
      {children}
    </span>
  )
}
