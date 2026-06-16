import { useState, useEffect } from 'react'
import { getChangelog, getAllFiles, downloadFileToDisk, type ChangelogRow, type UploadedFile } from '../lib/supabase'
import { CompareVersions } from './CompareVersions'

interface Props {
  open: boolean
  onToggle: () => void
  refreshKey: number
}

type Tab = 'cambios' | 'versiones'

const TIPO_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  aumento:         { label: 'Aumento de precios', color: 'text-orange-400', emoji: '📈' },
  nueva_serie:     { label: 'Nueva serie',         color: 'text-green-400',  emoji: '✨' },
  serie_terminada: { label: 'Serie terminada',     color: 'text-slate-400',  emoji: '✅' },
  serie_iniciada:  { label: 'Serie iniciada',      color: 'text-blue-400',   emoji: '🆕' },
  otro:            { label: 'Otro',                color: 'text-violet-400', emoji: '📝' },
}

export function ChangelogSection({ open, onToggle, refreshKey }: Props) {
  const [tab, setTab] = useState<Tab>('cambios')
  const [entries, setEntries] = useState<ChangelogRow[]>([])
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) loadAll()
  }, [open, refreshKey])

  async function loadAll() {
    setLoading(true)
    const [changelogData, filesData] = await Promise.all([getChangelog(), getAllFiles()])
    setEntries(changelogData)
    setFiles(filesData)
    setLoading(false)
  }

  return (
    <div className="mt-3">
      <div className="flex justify-center">
        <button
          onClick={onToggle}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a38] bg-[#17171f] text-[#e8e8f0] text-xs font-semibold hover:bg-violet-500/10 hover:border-violet-500 hover:text-violet-400 transition w-full justify-center"
        >
          <HistoryIcon className="w-3.5 h-3.5" />
          {open ? 'Ocultar historial' : 'Historial de cambios'}
        </button>
      </div>

      {open && (
        <div className="mt-3">
          <div className="flex gap-2 mb-3">
            <TabButton active={tab === 'cambios'} onClick={() => setTab('cambios')}>
              Cambios detectados
            </TabButton>
            <TabButton active={tab === 'versiones'} onClick={() => setTab('versiones')}>
              Versiones subidas
            </TabButton>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-[#2a2a38] border-t-violet-500 loader-spin" />
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
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
        active
          ? 'bg-violet-500/15 border-violet-500 text-violet-400'
          : 'bg-[#17171f] border-[#2a2a38] text-[#7878a0] hover:text-[#e8e8f0]'
      }`}
    >
      {children}
    </button>
  )
}

function ChangelogList({ entries }: { entries: ChangelogRow[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-[#7878a0] text-xs">
        Todavía no se detectaron cambios. Subí una segunda versión del catálogo para empezar a ver el historial.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => {
        const tipo = TIPO_LABELS[entry.tipo] ?? TIPO_LABELS['otro']
        return (
          <div
            key={entry.id}
            className="bg-[#17171f] border border-[#2a2a38] rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-2"
          >
            <div className="flex items-center gap-2 sm:w-36 shrink-0">
              <span className="text-base">{tipo.emoji}</span>
              <div className="flex flex-col">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${tipo.color}`}>
                  {tipo.label}
                </span>
                <span className="text-[10px] text-[#4a4a6a]">
                  {new Date(entry.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-[#e8e8f0] font-medium">{entry.descripcion}</span>
                {entry.fuente === 'auto' && (
                  <span className="text-[9px] uppercase tracking-wider text-[#4a4a6a] border border-[#2a2a38] rounded px-1.5 py-0.5">
                    auto
                  </span>
                )}
              </div>
              {entry.detalle && (
                <span className="text-[11px] text-[#7878a0]">{entry.detalle}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function FilesList({ files }: { files: UploadedFile[] }) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  async function handleDownload(file: UploadedFile) {
    setDownloadingId(file.id)
    try {
      await downloadFileToDisk(file)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloadingId(null)
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-[#7878a0] text-xs">
        No hay versiones registradas todavía.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {files.map((f) => (
        <div
          key={f.id}
          className="bg-[#17171f] border border-[#2a2a38] rounded-lg px-4 py-3 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <FileIcon className="w-4 h-4 text-violet-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[12px] text-[#e8e8f0] font-medium">{f.label}</span>
              <span className="text-[10px] text-[#4a4a6a]">
                {new Date(f.fecha_archivo + 'T12:00:00').toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
                {' · subido '}
                {new Date(f.uploaded_at).toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-[#7878a0]">{f.series_count} series · {f.tomos_count} tomos</span>
            {f.is_active && (
              <span className="text-[9px] uppercase tracking-wider bg-violet-500/15 text-violet-400 rounded px-2 py-1 font-semibold">
                Activo
              </span>
            )}
            <button
              onClick={() => handleDownload(f)}
              disabled={downloadingId === f.id}
              title="Descargar este archivo"
              className="text-[#7878a0] hover:text-violet-400 transition disabled:opacity-40 p-1"
            >
              {downloadingId === f.id ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#2a2a38] border-t-violet-500 loader-spin" />
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

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
    </svg>
  )
}
function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}
