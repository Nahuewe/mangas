import { useMemo } from 'react'
import type { MangaRow, ColumnKey } from '../lib/config'
import { groupCount } from '../lib/parser'

interface Props {
  mangas: MangaRow[]
  open: boolean
  onToggle: () => void
}

export function StatsSection({ mangas, open, onToggle }: Props) {
  const stats = useMemo(() => {
    const totalSeries = mangas.length
    const totalTomos = mangas.reduce((a, r) => a + (parseInt(r.tomos) || 0), 0)
    const totalValor = mangas.reduce((a, r) => a + (parseFloat(r.total) || 0), 0)
    const sinLeer = mangas.filter((r) => r.falta && r.falta !== '—' && r.falta !== '').length

    return {
      totalSeries,
      totalTomos,
      totalValor,
      sinLeer,
      byEstado: groupCount(mangas, 'estado' as ColumnKey),
      byEditorial: groupCount(mangas, 'editorial' as ColumnKey),
      byTamaño: groupCount(mangas, 'tamaño' as ColumnKey),
      byEstadoSerie: groupCount(mangas, 'estadoSerie' as ColumnKey),
    }
  }, [mangas])

  return (
    <div className="mt-3">
      <div className="flex justify-center">
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a38] bg-[#17171f] text-[#e8e8f0] text-xs font-semibold hover:bg-violet-500/10 hover:border-violet-500 hover:text-violet-400 transition w-full justify-center"
        >
          <ChartIcon className="w-3.5 h-3.5" />
          {open ? 'Ocultar Estadísticas' : 'Mostrar Estadísticas'}
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 mt-3">
          <StatCardHighlight
            title="Colección"
            big={stats.totalSeries}
            bigLabel="series en total"
            sub={stats.totalTomos}
            subLabel="tomos"
          />
          <StatCardHighlight
            title="Valor"
            big={'$ ' + Math.round(stats.totalValor).toLocaleString('es-AR')}
            bigLabel="valor total colección"
            sub={stats.sinLeer}
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
  title, big, bigLabel, sub, subLabel,
}: {
  title: string
  big: string | number
  bigLabel: string
  sub: string | number
  subLabel: string
}) {
  return (
    <div className="bg-[#17171f] border border-[#2a2a38] rounded-lg p-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#7878a0] mb-3">{title}</div>
      <div className="flex flex-col gap-1 mb-4">
        <span className="text-3xl font-bold text-violet-400 leading-none">{big}</span>
        <span className="text-[11px] text-[#7878a0]">{bigLabel}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xl font-bold text-[#e8e8f0] leading-none">{sub}</span>
        <span className="text-[11px] text-[#7878a0]">{subLabel}</span>
      </div>
    </div>
  )
}

function StatCardRows({ title, entries }: { title: string; entries: [string, number][] }) {
  return (
    <div className="bg-[#17171f] border border-[#2a2a38] rounded-lg p-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#7878a0] mb-3">{title}</div>
      <div className="flex flex-col">
        {entries.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between items-center py-1.5 border-b border-[#222230] last:border-b-0 text-[12px]"
          >
            <span className="text-[#7878a0]">{k}</span>
            <span className="font-bold text-[#e8e8f0]">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  )
}
