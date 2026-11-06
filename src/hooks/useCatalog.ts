import { useCallback, useEffect, useState } from 'react'
import { loadCatalog } from '../lib/catalog'
import type { MangaRow } from '../lib/config'
import { getLatestFile } from '../lib/supabase'

export type CatalogStatus = 'loading' | 'ready' | 'empty' | 'error'

export function useCatalog() {
  const [mangas, setMangas] = useState<MangaRow[]>([])
  const [status, setStatus] = useState<CatalogStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const file = await getLatestFile()
      if (!file) {
        setMangas([])
        setStatus('empty')
        return
      }
      setMangas(await loadCatalog(file))
      setStatus('ready')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { mangas, status, error, reload }
}
