import { useCallback, useEffect, useState } from 'react'
import { formatDate } from '../lib/format'
import {
  downloadFileToDisk,
  getAllFiles,
  getChangelog,
  type ChangelogRow,
  type UploadedFile,
} from '../lib/supabase'
import { ChangeEntry } from './ChangeEntry'
import { CompareVersions } from './CompareVersions'
import { DownloadIcon, FileIcon, HistoryIcon, Spinner } from './icons'

interface Props {
  open: boolean
  onToggle: () => void
  refreshKey: number
}

type Tab = 'cambios' | 'versiones'

export function ChangelogSection({ open, onToggle, refreshKey }: Props) {
  const [tab, setTab] = useState<Tab>('cambios')
  const [entries, setEntries] = useState<ChangelogRow[]>([])
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [changelogData, filesData] = await Promise.all([getChangelog(), getAllFiles()])
      setEntries(changelogData)
      setFiles(filesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el historial')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) loadAll()
  }, [open, refreshKey, loadAll])

  return (
    <div className="mt-3">
      <div className="flex justify-center">
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface text-fg text-xs font-semibold hover:bg-violet-500/10 hover:border-violet-500 hover:text-violet-400 transition w-full justify-center"
        >
          <HistoryIcon className="w-3.5 h-3.5" />
          {open ? 'Ocultar historial' : 'Historial de cambios'}
        </button>
      </div>

      {open && (
        <div className="mt-3">
          <div role="tablist" className="flex gap-2 mb-3">
            <TabButton active={tab === 'cambios'} onClick={() => setTab('cambios')}>
              Cambios detectados
            </TabButton>
            <TabButton active={tab === 'versiones'} onClick={() => setTab('versiones')}>
              Versiones subidas
            </TabButton>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-xs">
              <p className="text-red-400 mb-3">{error}</p>
              <button
                type="button"
                onClick={loadAll}
                className="px-3 py-1.5 rounded border border-border text-fg hover:border-violet-500 hover:text-violet-400 transition"
              >
                Reintentar
              </button>
            </div>
          ) : tab === 'cambios' ? (
            <ChangelogList entries={entries} />
          ) : (
            <>
              {files.length >= 2 && <CompareVersions files={files} />}
              <FilesList files={files} />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
        active
          ? 'bg-violet-500/15 border-violet-500 text-violet-400'
          : 'bg-surface border-border text-tmuted hover:text-fg'
      }`}
    >
      {children}
    </button>
  )
}

function ChangelogList({ entries }: { entries: ChangelogRow[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-tmuted text-xs">
        Todavía no se detectaron cambios. Subí una segunda versión del catálogo para empezar a ver
        el historial.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <ChangeEntry
          key={entry.id}
          tipo={entry.tipo}
          descripcion={entry.descripcion}
          detalle={entry.detalle}
          fecha={entry.fecha}
          auto={entry.fuente === 'auto'}
        />
      ))}
    </div>
  )
}

function FilesList({ files }: { files: UploadedFile[] }) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleDownload(file: UploadedFile) {
    setDownloadingId(file.id)
    setError('')
    try {
      await downloadFileToDisk(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo descargar el archivo')
    } finally {
      setDownloadingId(null)
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-tmuted text-xs">
        No hay versiones registradas todavía.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-xs text-red-400">{error}</p>}
      {files.map((f) => (
        <div
          key={f.id}
          className="bg-surface border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <FileIcon className="w-4 h-4 text-violet-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[12px] text-fg font-medium">{f.label}</span>
              <span className="text-[10px] text-tdim">
                {formatDate(f.fecha_archivo)} · subido {formatDate(f.uploaded_at)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-tmuted">
              {f.series_count} series · {f.tomos_count} tomos
            </span>
            {f.is_active && (
              <span className="text-[9px] uppercase tracking-wider bg-violet-500/15 text-violet-400 rounded px-2 py-1 font-semibold">
                Activo
              </span>
            )}
            <button
              type="button"
              onClick={() => handleDownload(f)}
              disabled={downloadingId === f.id}
              title="Descargar este archivo"
              aria-label={`Descargar ${f.label}`}
              className="text-tmuted hover:text-violet-400 transition disabled:opacity-40 p-1"
            >
              {downloadingId === f.id ? (
                <Spinner className="w-3.5 h-3.5" />
              ) : (
                <DownloadIcon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
