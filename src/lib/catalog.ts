import type { MangaRow } from './config'
import { parseExcel } from './parser'
import { downloadFileBuffer, type UploadedFile } from './supabase'

/**
 * Cada archivo subido es inmutable (su ruta lleva un timestamp), así que el catálogo ya
 * parseado se puede guardar en el navegador y evitar descargar y leer el Excel en cada visita.
 */
const CACHE_PREFIX = 'mangas:catalog:v1:'

function readCache(path: string): MangaRow[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + path)
    return raw ? (JSON.parse(raw) as MangaRow[]) : null
  } catch {
    return null
  }
}

function writeCache(path: string, mangas: MangaRow[]): void {
  try {
    // Se conserva solo la entrada más reciente para no llenar el almacenamiento.
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k?.startsWith(CACHE_PREFIX) && k !== CACHE_PREFIX + path) localStorage.removeItem(k)
    }
    localStorage.setItem(CACHE_PREFIX + path, JSON.stringify(mangas))
  } catch {
    // Almacenamiento lleno o bloqueado: simplemente no se cachea.
  }
}

export async function loadCatalog(file: UploadedFile): Promise<MangaRow[]> {
  const cached = readCache(file.storage_path)
  if (cached) return cached

  const buffer = await downloadFileBuffer(file.storage_path)
  const { mangas } = await parseExcel(buffer)
  writeCache(file.storage_path, mangas)
  return mangas
}
