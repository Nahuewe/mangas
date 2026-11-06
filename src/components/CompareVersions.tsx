import { useMemo, useState } from 'react'
import { loadCatalog } from '../lib/catalog'
import { diffCatalogs, type DiffEntry } from '../lib/diff'
import { formatDate } from '../lib/format'
import type { UploadedFile } from '../lib/supabase'
import { ChangeEntry } from './ChangeEntry'
import { Spinner } from './icons'

interface Props {
  files: UploadedFile[]
}

const SELECT_CLASS =
  'bg-bg border border-border rounded text-fg text-xs px-2 py-1.5 outline-none focus:border-violet-500'

export function CompareVersions({ files }: Props) {
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DiffEntry[] | null>(null)

  const sorted = useMemo(
    () => [...files].sort((a, b) => a.fecha_archivo.localeCompare(b.fecha_archivo)),
    [files]
  )

  const sameVersion = fromId !== '' && fromId === toId

  async function handleCompare() {
    const fromFile = files.find((f) => f.id === fromId)
    const toFile = files.find((f) => f.id === toId)
    if (!fromFile || !toFile || sameVersion) return

    setLoading(true)
    setError('')
    setResult(null)
    try {
      const [from, to] = await Promise.all([loadCatalog(fromFile), loadCatalog(toFile)])
      setResult(diffCatalogs(from, to))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al comparar las versiones')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 mb-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-tmuted mb-3">
        Comparar dos versiones
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <VersionSelect label="Desde" value={fromId} onChange={setFromId} files={sorted} />
        <span className="text-tdim text-xs pb-1.5" aria-hidden="true">
          →
        </span>
        <VersionSelect label="Hasta" value={toId} onChange={setToId} files={sorted} />

        <button
          type="button"
          onClick={handleCompare}
          disabled={!fromId || !toId || sameVersion || loading}
          className="px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition flex items-center gap-2"
        >
          {loading ? (
            <>
              <Spinner className="w-3.5 h-3.5" />
              Comparando...
            </>
          ) : (
            'Comparar'
          )}
        </button>
      </div>

      {sameVersion && (
        <p className="text-[11px] text-orange-400 mt-2">Elegí dos versiones distintas.</p>
      )}
      {error && <p className="text-[11px] text-red-400 mt-2">{error}</p>}

      {result && (
        <div className="flex flex-col gap-2 mt-4">
          {result.length === 0 ? (
            <div className="text-center py-6 text-tmuted text-xs">
              No se detectaron diferencias entre esas dos versiones.
            </div>
          ) : (
            result.map((entry, i) => <ChangeEntry key={i} {...entry} tone="inset" />)
          )}
        </div>
      )}
    </div>
  )
}

function VersionSelect({
  label,
  value,
  onChange,
  files,
}: {
  label: string
  value: string
  onChange: (id: string) => void
  files: UploadedFile[]
}) {
  return (
    <label className="flex flex-col gap-1 min-w-[180px]">
      <span className="text-[10px] text-tmuted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT_CLASS}>
        <option value="">Seleccionar versión...</option>
        {files.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label} ({formatDate(f.fecha_archivo)})
          </option>
        ))}
      </select>
    </label>
  )
}
