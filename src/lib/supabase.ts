import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export async function getLatestFile(): Promise<UploadedFile | null> {
  const { data, error } = await supabase
    .from('manga_files')
    .select('*')
    .eq('is_active', true)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data as UploadedFile
}

export async function getAllFiles(): Promise<UploadedFile[]> {
  const { data, error } = await supabase
    .from('manga_files')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (error) return []
  return (data ?? []) as UploadedFile[]
}

export async function uploadMangaFile(
  file: File,
  label: string,
  seriesCount: number,
  tomosCount: number,
  fechaArchivo: string
): Promise<UploadedFile> {
  const timestamp = Date.now()
  const ext = file.name.split('.').pop()
  const storagePath = `mangas/${timestamp}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('manga-files')
    .upload(storagePath, file, { upsert: false })

  if (uploadError) throw new Error(uploadError.message)

  await supabase
    .from('manga_files')
    .update({ is_active: false })
    .eq('is_active', true)

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

  if (insertError) throw new Error(insertError.message)
  return data as UploadedFile
}

export async function downloadFileBuffer(storagePath: string): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage
    .from('manga-files')
    .download(storagePath)

  if (error || !data) throw new Error(error?.message ?? 'Download failed')
  return data.arrayBuffer()
}

export async function downloadFileToDisk(file: UploadedFile): Promise<void> {
  const { data, error } = await supabase.storage
    .from('manga-files')
    .download(file.storage_path)

  if (error || !data) throw new Error(error?.message ?? 'Download failed')

  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = file.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function getChangelog(): Promise<ChangelogRow[]> {
  const { data, error } = await supabase
    .from('manga_changelog')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []) as ChangelogRow[]
}

export async function addChangelogEntry(entry: {
  fecha: string
  tipo: string
  descripcion: string
  detalle?: string
  fuente?: 'auto' | 'manual'
  file_id?: string
}): Promise<void> {
  await supabase.from('manga_changelog').insert({
    ...entry,
    fuente: entry.fuente ?? 'manual',
    file_id: entry.file_id ?? null,
  })
}

export async function addChangelogEntries(
  entries: {
    fecha: string
    tipo: string
    descripcion: string
    detalle?: string
    fuente: 'auto'
    file_id: string
  }[]
): Promise<void> {
  if (!entries.length) return
  await supabase.from('manga_changelog').insert(entries)
}
