import { formatDate } from '../lib/format'
import { getTipoLabel } from '../lib/labels'

interface Props {
  tipo: string
  descripcion: string
  detalle?: string | null
  /** Fecha ISO; si no se pasa, no se muestra. */
  fecha?: string
  auto?: boolean
  /** Fondo de la tarjeta, según dónde se use. */
  tone?: 'surface' | 'inset'
}

export function ChangeEntry({ tipo, descripcion, detalle, fecha, auto, tone = 'surface' }: Props) {
  const { label, color, emoji } = getTipoLabel(tipo)

  return (
    <div
      className={`${
        tone === 'surface' ? 'bg-surface' : 'bg-bg'
      } border border-border rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-2`}
    >
      <div className="flex items-center gap-2 sm:w-36 shrink-0">
        <span className="text-base">{emoji}</span>
        <div className="flex flex-col">
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${color}`}>
            {label}
          </span>
          {fecha && <span className="text-[10px] text-tdim">{formatDate(fecha)}</span>}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-fg font-medium">{descripcion}</span>
          {auto && (
            <span className="text-[9px] uppercase tracking-wider text-tdim border border-border rounded px-1.5 py-0.5">
              auto
            </span>
          )}
        </div>
        {detalle && <span className="text-[11px] text-tmuted">{detalle}</span>}
      </div>
    </div>
  )
}
