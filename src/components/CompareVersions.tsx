import { useState } from 'react'
import type { UploadedFile } from '../lib/supabase'
import { downloadFileBuffer } from '../lib/supabase'
import { parseExcel } from '../lib/parser'
import { diffCatalogs, type DiffEntry } from '../lib/diff'

interface Props {
  files: UploadedFile[]
}

const TIPO_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  aumento:         { label: 'Aumento de precios', color: 'text-orange-400', emoji: '📈' },
  nueva_serie:     { label: 'Nueva serie',         color: 'text-green-400',  emoji: '✨' },
  serie_terminada: { label: 'Serie terminada',     color: 'text-slate-400',  emoji: '✅' },
  serie_iniciada:  { label: 'Serie iniciada',      color: 'text-blue-400',   emoji: '🆕' },
  otro:            { label: 'Otro',                color: 'text-violet-400', emoji: '📝' },
}

export function CompareVersions({ files }: Props) {
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DiffEntry[] | null>(null)

  const sorted = [...files].sort(
    (a, b) => new Date(a.fecha_archivo).getTime() - new Date(b.fecha_archivo).getTime()
  )

  async function handleCompare() {
    if (!fromId || !toId || fromId === toId) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const fromFile = files.find((f) => f.id === fromId)!
      const toFile = files.find((f) => f.id === toId)!

      const [fromBuffer, toBuffer] = await Promise.all([
        downloadFileBuffer(fromFile.storage_path),
        downloadFileBuffer(toFile.storage_path),
      ])

      const from = parseExcel(fromBuffer).mangas
      const to = parseExcel(toBuffer).mangas

      setResult(diffCatalogs(from, to))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al comparar las versiones')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#17171f] border border-[#2a2a38] rounded-lg p-4 mb-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-[#7878a0] mb-3">
        Comparar dos versiones
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[10px] text-[#7878a0]">Desde</label>
          <select
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            className="bg-[#0f0f13] border border-[#2a2a38] rounded text-[#e8e8f0] text-xs px-2 py-1.5 outline-none focus:border-violet-500"
          >
            <option value="">Seleccionar versión...</option>
            {sorted.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label} ({new Date(f.fecha_archivo + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })})
              </option>
            ))}
          </select>
        </div>

        <span className="text-[#4a4a6a] text-xs pb-1.5">→</span>

        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-[10px] text-[#7878a0]">Hasta</label>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="bg-[#0f0f13] border border-[#2a2a38] rounded text-[#e8e8f0] text-xs px-2 py-1.5 outline-none focus:border-violet-500"
          >
            <option value="">Seleccionar versión...</option>
            {sorted.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label} ({new Date(f.fecha_archivo + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCompare}
          disabled={!fromId || !toId || fromId === toId || loading}
          className="px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white loader-spin" />
              Comparando...
            </>
          ) : (
            'Comparar'
          )}
        </button>
      </div>

      {fromId && toId && fromId === toId && (
        <p className="text-[11px] text-orange-400 mt-2">Elegí dos versiones distintas.</p>
      )}
      {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}

      {result && (
        <div className="flex flex-col gap-2 mt-4">
          {result.length === 0 ? (
            <div className="text-center py-6 text-[#7878a0] text-xs">
              No se detectaron diferencias entre esas dos versiones.
            </div>
          ) : (
            result.map((entry, i) => {
              const tipo = TIPO_LABELS[entry.tipo] ?? TIPO_LABELS['otro']
              return (
                <div
                  key={i}
                  className="bg-[#0f0f13] border border-[#2a2a38] rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-2"
                >
                  <div className="flex items-center gap-2 sm:w-36 shrink-0">
                    <span className="text-base">{tipo.emoji}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${tipo.color}`}>
                      {tipo.label}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] text-[#e8e8f0] font-medium">{entry.descripcion}</span>
                    {entry.detalle && (
                      <span className="text-[11px] text-[#7878a0]">{entry.detalle}</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
