import { useState, useRef } from 'react'
import { UPLOAD_PASSWORD } from '../lib/config'
import { uploadMangaFile, addChangelogEntries } from '../lib/supabase'
import { parseExcel } from '../lib/parser'
import { diffCatalogs } from '../lib/diff'
import type { MangaRow } from '../lib/config'

interface Props {
  previousMangas: MangaRow[]
  onClose: () => void
  onSuccess: () => void
}

type Step = 'auth' | 'upload'

export function UploadModal({ previousMangas, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('auth')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [label, setLabel] = useState('')
  const [fechaArchivo, setFechaArchivo] = useState(new Date().toISOString().slice(0, 10))
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [showPassword, setShowPassword] = useState(false)

  function handleAuth() {
    if (password === UPLOAD_PASSWORD) {
      setStep('upload')
      setAuthError('')
    } else {
      setAuthError('Contraseña incorrecta')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    if (!label) {
      const nameWithoutExt = f.name.replace(/\.[^.]+$/, '')
      setLabel(nameWithoutExt)
    }
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const buffer = await file.arrayBuffer()
      const { mangas: newMangas } = parseExcel(buffer)

      const seriesCount = newMangas.length
      const tomosCount = newMangas.reduce((a, r) => a + (parseInt(r.tomos) || 0), 0)

      const uploaded = await uploadMangaFile(file, label, seriesCount, tomosCount, fechaArchivo)

      if (previousMangas.length > 0 && uploaded) {
        const diffs = diffCatalogs(previousMangas, newMangas)
        if (diffs.length > 0) {
          await addChangelogEntries(
            diffs.map((d) => ({
              fecha: fechaArchivo,
              tipo: d.tipo,
              descripcion: d.descripcion,
              detalle: d.detalle,
              fuente: 'auto' as const,
              file_id: uploaded.id,
            }))
          )
        }
      }

      onSuccess()
      onClose()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir el archivo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#17171f] border border-[#2a2a38] rounded-xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-[#e8e8f0] uppercase tracking-widest">
            {step === 'auth' ? 'Acceso restringido' : 'Subir catálogo'}
          </h2>
          <button onClick={onClose} className="text-[#7878a0] hover:text-red-400 transition">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {step === 'auth' ? (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-[#7878a0]">
              Ingresá la contraseña para poder actualizar el catálogo.
            </p>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="Contraseña"
                className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-lg text-[#e8e8f0] text-sm px-3 py-2 pr-10 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-[#4a4a6a] transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7878a0] hover:text-violet-400 transition"
              >
                {showPassword ? (
                  <EyeOffIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            {authError && <p className="text-xs text-red-400">{authError}</p>}
            <button
              onClick={handleAuth}
              className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition"
            >
              Ingresar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-[#7878a0]">
              Los cambios respecto al catálogo anterior se detectarán automáticamente.
            </p>

            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition ${file
                  ? 'border-violet-500 bg-violet-500/5'
                  : 'border-[#2a2a38] hover:border-violet-500/50 hover:bg-[#1e1e28]'
                }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex flex-col items-center gap-1.5">
                  <FileIcon className="w-7 h-7 text-violet-400" />
                  <span className="text-xs text-violet-400 font-medium">{file.name}</span>
                  <span className="text-[10px] text-[#7878a0]">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <UploadIcon className="w-7 h-7 text-[#4a4a6a]" />
                  <span className="text-xs text-[#7878a0]">Hacé clic o arrastrá el archivo</span>
                  <span className="text-[10px] text-[#4a4a6a]">.xlsx, .xls o .csv</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#7878a0]">
                Nombre de esta versión
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ej: mangas_junio_2026"
                className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-lg text-[#e8e8f0] text-sm px-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-[#4a4a6a] transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-[#7878a0]">
                Fecha de actualización del Excel
              </label>
              <input
                type="date"
                value={fechaArchivo}
                onChange={(e) => setFechaArchivo(e.target.value)}
                className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-lg text-[#e8e8f0] text-sm px-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              />
              <span className="text-[10px] text-[#4a4a6a]">
                Usá la fecha en que realmente actualizaste el catálogo, no la de hoy si subís el archivo más tarde.
              </span>
            </div>

            {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white loader-spin" />
                  Analizando y subiendo...
                </>
              ) : (
                'Subir y actualizar'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.8 21.8 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-3.17 4.36" />
      <path d="M1 1l22 22" />
    </svg>
  )
}
