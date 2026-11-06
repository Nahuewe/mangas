import { createClient, type Session } from '@supabase/supabase-js'
import type { DiffEntry } from './diff'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BUCKET = 'manga-files'

export interface UploadedFile {
  id: string
  filename: string
  label: string
  storage_path: string
  uploaded_at: string
  fecha_archivo: string
  is_active: boolean
  series_count: number
  tomos_count: number
}

export interface ChangelogRow {
  id: string
  fecha: string
  tipo: string
  descripcion: string
  detalle: string | null
  fuente: 'auto' | 'manual'
  file_id: string | null
  created_at: string
}

// ── Autenticación ────────────────────────────────────────────────────────────

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error('Email o contraseña incorrectos')
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

// ── Lectura ──────────────────────────────────────────────────────────────────

/** Devuelve la versión activa, o `null` si todavía no se subió ninguna. Lanza si la consulta falla. */
export async function getLatestFile(): Promise<UploadedFile | null> {
  const { data, error } = await supabase
    .from('manga_files')
    .select('*')
    .eq('is_active', true)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (data as UploadedFile | null) ?? null
}

export async function getAllFiles(): Promise<UploadedFile[]> {
  const { data, error } = await supabase
    .from('manga_files')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as UploadedFile[]
}

export async function getChangelog(): Promise<ChangelogRow[]> {
  const { data, error } = await supabase
    .from('manga_changelog')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as ChangelogRow[]
}

async function downloadBlob(storagePath: string): Promise<Blob> {
  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath)
  if (error || !data) throw new Error(error?.message ?? 'No se pudo descargar el archivo')
  return data
}

export async function downloadFileBuffer(storagePath: string): Promise<ArrayBuffer> {
  return (await downloadBlob(storagePath)).arrayBuffer()
}

export async function downloadFileToDisk(file: UploadedFile): Promise<void> {
  const blob = await downloadBlob(file.storage_path)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Escritura ────────────────────────────────────────────────────────────────

export interface UploadParams {
  file: File
  label: string
  seriesCount: number
  tomosCount: number
  fechaArchivo: string
  /** Cambios detectados contra la versión anterior; se guardan en el historial. */
  changes: DiffEntry[]
}

/**
 * Sube el archivo y lo deja como versión activa. Si algún paso falla se deshace lo
 * anterior, para no dejar el catálogo sin versión activa ni archivos huérfanos.
 */
export async function uploadMangaFile(params: UploadParams): Promise<UploadedFile> {
  const { file, label, seriesCount, tomosCount, fechaArchivo, changes } = params
  const ext = file.name.split('.').pop()
  const storagePath = `mangas/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: false })
  if (uploadError) throw new Error(uploadError.message)

  const removeStoredFile = () => supabase.storage.from(BUCKET).remove([storagePath])

  // 1) Se inserta la nueva versión (ya activa). La anterior sigue activa hasta el paso 2,
  //    así que si esto falla el catálogo mostrado no cambia.
  const { data, error: insertError } = await supabase
    .from('manga_files')
    .insert({
      filename: file.name,
      label: label.trim() || file.name.replace(/\.[^.]+$/, ''),
      storage_path: storagePath,
      is_active: true,
      series_count: seriesCount,
      tomos_count: tomosCount,
      fecha_archivo: fechaArchivo,
    })
    .select()
    .single()

  if (insertError || !data) {
    await removeStoredFile()
    throw new Error(insertError?.message ?? 'No se pudo registrar el archivo')
  }
  const uploaded = data as UploadedFile

  // 2) Se desactivan las demás versiones.
  const { error: deactivateError } = await supabase
    .from('manga_files')
    .update({ is_active: false })
    .eq('is_active', true)
    .neq('id', uploaded.id)

  if (deactivateError) {
    await supabase.from('manga_files').delete().eq('id', uploaded.id)
    await removeStoredFile()
    throw new Error(deactivateError.message)
  }

  // 3) Historial de cambios. Si falla, la subida ya quedó hecha: se avisa pero no se revierte.
  if (changes.length > 0) {
    const { error: changelogError } = await supabase.from('manga_changelog').insert(
      changes.map((c) => ({
        fecha: fechaArchivo,
        tipo: c.tipo,
        descripcion: c.descripcion,
        detalle: c.detalle,
        fuente: 'auto' as const,
        file_id: uploaded.id,
      }))
    )
    if (changelogError) {
      throw new Error(
        `El archivo se subió, pero no se pudo guardar el historial de cambios: ${changelogError.message}`
      )
    }
  }

  return uploaded
}
