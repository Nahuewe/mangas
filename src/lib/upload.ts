import type { MangaRow } from './config'
import { diffCatalogs, type DiffEntry } from './diff'
import { parseExcel } from './parser'
import { computeTotals } from './stats'
import { uploadMangaFile } from './supabase'

export interface UploadAnalysis {
  mangas: MangaRow[]
  seriesCount: number
  tomosCount: number
  changes: DiffEntry[]
}

const ALLOWED_EXTENSIONS = ['xlsx', 'xls', 'csv']

export function isAllowedFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return ALLOWED_EXTENSIONS.includes(ext)
}

/** Lee el archivo y calcula qué cambió respecto del catálogo actual, sin subir nada. */
export async function analyzeUpload(
  file: File,
  previousMangas: MangaRow[]
): Promise<UploadAnalysis> {
  const { mangas } = await parseExcel(await file.arrayBuffer())
  if (mangas.length === 0) {
    throw new Error('No se encontraron series en el archivo. Revisá que tenga el formato esperado.')
  }

  const totals = computeTotals(mangas)
  return {
    mangas,
    seriesCount: totals.series,
    tomosCount: totals.tomos,
    changes: previousMangas.length > 0 ? diffCatalogs(previousMangas, mangas) : [],
  }
}

export interface CommitInput {
  file: File
  label: string
  fechaArchivo: string
  analysis: UploadAnalysis
}

export function commitUpload({ file, label, fechaArchivo, analysis }: CommitInput) {
  return uploadMangaFile({
    file,
    label,
    fechaArchivo,
    seriesCount: analysis.seriesCount,
    tomosCount: analysis.tomosCount,
    changes: analysis.changes,
  })
}
