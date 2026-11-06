import { useRef, useState } from 'react'
import type { MangaRow } from '../../lib/config'
import { todayLocalISO } from '../../lib/format'
import { signOut } from '../../lib/supabase'
import { analyzeUpload, commitUpload, isAllowedFile, type UploadAnalysis } from '../../lib/upload'
import { ChangeEntry } from '../ChangeEntry'
import { FileIcon, Spinner, UploadIcon } from '../icons'

interface Props {
  previousMangas: MangaRow[]
  onDone: () => void
  onSignedOut: () => void
}

const INPUT_CLASS =
  'w-full bg-bg border border-border rounded-lg text-fg text-sm px-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-tdim transition'
const LABEL_CLASS = 'text-[10px] font-semibold uppercase tracking-widest text-tmuted'

export function UploadStep({ previousMangas, onDone, onSignedOut }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<UploadAnalysis | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [label, setLabel] = useState('')
  const [fechaArchivo, setFechaArchivo] = useState(todayLocalISO())
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function selectFile(f: File) {
    setError('')
    setAnalysis(null)
    if (!isAllowedFile(f)) {
      setFile(null)
      setError('Formato no soportado. Usá un archivo .xlsx, .xls o .csv.')
      return
    }

    setFile(f)
    setLabel(f.name.replace(/\.[^.]+$/, ''))
    setAnalyzing(true)
    try {
      setAnalysis(await analyzeUpload(f, previousMangas))
    } catch (err) {
      setFile(null)
      setError(err instanceof Error ? err.message : 'No se pudo leer el archivo')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleConfirm() {
    if (!file || !analysis) return
    setUploading(true)
    setError('')
    try {
      await commitUpload({ file, label, fechaArchivo, analysis })
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    onSignedOut()
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-tmuted">
        Antes de subir vas a ver los cambios detectados respecto del catálogo actual.
      </p>

      <div
        role="button"
        tabIndex={0}
        aria-label="Elegir archivo del catálogo"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const dropped = e.dataTransfer.files?.[0]
          if (dropped) selectFile(dropped)
        }}
        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition outline-none focus-visible:border-violet-500 ${
          dragging || file
            ? 'border-violet-500 bg-violet-500/5'
            : 'border-border hover:border-violet-500/50 hover:bg-surface2'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) selectFile(f)
            e.target.value = '' // permite volver a elegir el mismo archivo
          }}
          className="hidden"
        />
        {file ? (
          <div className="flex flex-col items-center gap-1.5">
            <FileIcon className="w-7 h-7 text-violet-400" />
            <span className="text-xs text-violet-400 font-medium">{file.name}</span>
            <span className="text-[10px] text-tmuted">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <UploadIcon className="w-7 h-7 text-tdim" />
            <span className="text-xs text-tmuted">Hacé clic o arrastrá el archivo</span>
            <span className="text-[10px] text-tdim">.xlsx, .xls o .csv</span>
          </div>
        )}
      </div>

      {analyzing && (
        <div className="flex items-center gap-2 text-xs text-tmuted">
          <Spinner className="w-4 h-4" /> Analizando archivo...
        </div>
      )}

      {analysis && (
        <div className="flex flex-col gap-2">
          <span className={LABEL_CLASS}>
            {analysis.seriesCount} series · {analysis.tomosCount} tomos
          </span>
          {previousMangas.length === 0 ? (
            <p className="text-xs text-tmuted">
              Es el primer catálogo: no hay cambios para comparar.
            </p>
          ) : analysis.changes.length === 0 ? (
            <p className="text-xs text-tmuted">
              No se detectaron cambios respecto del catálogo actual.
            </p>
          ) : (
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto scrollbar-thin">
              {analysis.changes.map((c, i) => (
                <ChangeEntry key={i} {...c} tone="inset" />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="upload-label" className={LABEL_CLASS}>
          Nombre de esta versión
        </label>
        <input
          id="upload-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ej: mangas_junio_2026"
          className={INPUT_CLASS}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="upload-fecha" className={LABEL_CLASS}>
          Fecha de actualización del Excel
        </label>
        <input
          id="upload-fecha"
          type="date"
          value={fechaArchivo}
          onChange={(e) => setFechaArchivo(e.target.value)}
          className={INPUT_CLASS}
        />
        <span className="text-[10px] text-tdim">
          Usá la fecha en que realmente actualizaste el catálogo, no la de hoy si subís el archivo
          más tarde.
        </span>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!file || !analysis || uploading}
        className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Spinner className="w-4 h-4" />
            Subiendo...
          </>
        ) : (
          'Confirmar y subir'
        )}
      </button>

      <button
        type="button"
        onClick={handleSignOut}
        className="text-[11px] text-tdim hover:text-tmuted transition self-center"
      >
        Cerrar sesión
      </button>
    </div>
  )
}
