import { useMemo } from 'react'
import type { MangaRow } from '../lib/config'
import { formatMoney } from '../lib/format'
import { groupCount } from '../lib/parser'
import { computeTotals } from '../lib/stats'
import { ChartIcon } from './icons'

interface Props {
  mangas: MangaRow[]
  open: boolean
  onToggle: () => void
}

export function StatsSection({ mangas, open, onToggle }: Props) {
  const stats = useMemo(
    () => ({
      totals: computeTotals(mangas),
      byEstado: groupCount(mangas, 'estado'),
      byEditorial: groupCount(mangas, 'editorial'),
      byTamaño: groupCount(mangas, 'tamaño'),
      byEstadoSerie: groupCount(mangas, 'estadoSerie'),
    }),
    [mangas]
  )

  return (
    <div className="mt-3">
      <div className="flex justify-center">
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-fg text-xs font-semibold hover:bg-violet-500/10 hover:border-violet-500 hover:text-violet-400 transition w-full justify-center"
        >
          <ChartIcon className="w-3.5 h-3.5" />
          {open ? 'Ocultar Estadísticas' : 'Mostrar Estadísticas'}
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 mt-3">
          <StatCardHighlight
            title="Colección"
            big={stats.totals.series}
            bigLabel="series en total"
            sub={stats.totals.tomos}
            subLabel="tomos"
          />
          <StatCardHighlight
            title="Valor"
            big={formatMoney(Math.round(stats.totals.valor))}
            bigLabel="valor total colección"
            sub={stats.totals.sinLeer}
            subLabel="series sin terminar de leer"
          />
          <StatCardRows title="Estado de lectura" entries={stats.byEstado} />
          <StatCardRows title="Por editorial" entries={stats.byEditorial} />
          <StatCardRows title="Por tamaño" entries={stats.byTamaño} />
          <StatCardRows title="Estado de serie" entries={stats.byEstadoSerie} />
        </div>
      )}
    </div>
  )
}

function StatCardHighlight({
  title,
  big,
  bigLabel,
  sub,
  subLabel,
}: {
  title: string
  big: string | number
  bigLabel: string
  sub: string | number
  subLabel: string
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-tmuted mb-3">
        {title}
      </div>
      <div className="flex flex-col gap-1 mb-4">
        <span className="text-3xl font-bold text-violet-400 leading-none">{big}</span>
        <span className="text-[11px] text-tmuted">{bigLabel}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xl font-bold text-fg leading-none">{sub}</span>
        <span className="text-[11px] text-tmuted">{subLabel}</span>
      </div>
    </div>
  )
}

function StatCardRows({ title, entries }: { title: string; entries: [string, number][] }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-tmuted mb-3">
        {title}
      </div>
      <div className="flex flex-col">
        {entries.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between items-center py-1.5 border-b border-bordersoft last:border-b-0 text-[12px]"
          >
            <span className="text-tmuted">{k}</span>
            <span className="font-bold text-fg">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
