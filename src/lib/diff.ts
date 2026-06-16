import type { MangaRow } from './config'

export interface DiffEntry {
  tipo: string
  descripcion: string
  detalle: string
}

export function diffCatalogs(previous: MangaRow[], current: MangaRow[]): DiffEntry[] {
  const entries: DiffEntry[] = []
  const prevMap = new Map(previous.map((r) => [r.series, r]))
  const currMap = new Map(current.map((r) => [r.series, r]))

  const newSeries: string[] = []
  const removedSeries: string[] = []
  const priceChanges: { series: string; old: number; new: number; pct: number }[] = []
  const finishedSeries: string[] = []
  const startedSeries: string[] = []

  for (const [series, curr] of currMap) {
    if (!prevMap.has(series)) {
      newSeries.push(series)
    } else {
      const prev = prevMap.get(series)!

      const oldPrice = parseFloat(prev.precio) || 0
      const newPrice = parseFloat(curr.precio) || 0
      if (oldPrice > 0 && Math.abs(newPrice - oldPrice) > 0.5) {
        const pct = ((newPrice - oldPrice) / oldPrice) * 100
        priceChanges.push({ series, old: oldPrice, new: newPrice, pct })
      }

      const wasPublishing =
        prev.estadoSerie?.toLowerCase().includes('publicación') ||
        prev.estadoSerie?.toLowerCase().includes('publicacion')
      const isFinished =
        curr.estadoSerie?.toLowerCase() === 'finalizado'
      if (wasPublishing && isFinished) {
        finishedSeries.push(series)
      }

      const wasFinished = prev.estadoSerie?.toLowerCase() === 'finalizado'
      const isPublishing =
        curr.estadoSerie?.toLowerCase().includes('publicación') ||
        curr.estadoSerie?.toLowerCase().includes('publicacion')
      if (wasFinished && isPublishing) {
        startedSeries.push(series)
      }
    }
  }

  for (const [series] of prevMap) {
    if (!currMap.has(series)) {
      removedSeries.push(series)
    }
  }

  if (newSeries.length > 0) {
    entries.push({
      tipo: 'nueva_serie',
      descripcion: `${newSeries.length} serie${newSeries.length > 1 ? 's' : ''} nueva${newSeries.length > 1 ? 's' : ''} agregada${newSeries.length > 1 ? 's' : ''}`,
      detalle: newSeries.join(', '),
    })
  }

  if (removedSeries.length > 0) {
    entries.push({
      tipo: 'otro',
      descripcion: `${removedSeries.length} serie${removedSeries.length > 1 ? 's' : ''} eliminada${removedSeries.length > 1 ? 's' : ''} del catálogo`,
      detalle: removedSeries.join(', '),
    })
  }

  if (finishedSeries.length > 0) {
    entries.push({
      tipo: 'serie_terminada',
      descripcion: `${finishedSeries.length} serie${finishedSeries.length > 1 ? 's' : ''} finalizada${finishedSeries.length > 1 ? 's' : ''}`,
      detalle: finishedSeries.join(', '),
    })
  }

  if (startedSeries.length > 0) {
    entries.push({
      tipo: 'serie_iniciada',
      descripcion: `${startedSeries.length} serie${startedSeries.length > 1 ? 's' : ''} retomada${startedSeries.length > 1 ? 's' : ''} / en publicación`,
      detalle: startedSeries.join(', '),
    })
  }

  if (priceChanges.length > 0) {
    const increases = priceChanges.filter((c) => c.pct > 0)
    const decreases = priceChanges.filter((c) => c.pct < 0)

    if (increases.length > 0) {
      const avgPct = increases.reduce((a, c) => a + c.pct, 0) / increases.length
      const byEditorial = groupByEditorial(increases.map((c) => c.series), current)

      const editorialSummary = Object.entries(byEditorial)
        .map(([ed, series]) => `${ed} (${series.length})`)
        .join(', ')

      entries.push({
        tipo: 'aumento',
        descripcion: `${increases.length} serie${increases.length > 1 ? 's' : ''} con aumento de precios · promedio +${avgPct.toFixed(1)}%`,
        detalle: editorialSummary || increases.map((c) => `${c.series}: +${c.pct.toFixed(1)}%`).slice(0, 8).join(', '),
      })
    }

    if (decreases.length > 0) {
      const avgPct = Math.abs(decreases.reduce((a, c) => a + c.pct, 0) / decreases.length)
      entries.push({
        tipo: 'otro',
        descripcion: `${decreases.length} serie${decreases.length > 1 ? 's' : ''} con baja de precios · promedio -${avgPct.toFixed(1)}%`,
        detalle: decreases.map((c) => `${c.series}: ${c.pct.toFixed(1)}%`).slice(0, 8).join(', '),
      })
    }
  }

  const prevTomos = previous.reduce((a, r) => a + (parseInt(r.tomos) || 0), 0)
  const currTomos = current.reduce((a, r) => a + (parseInt(r.tomos) || 0), 0)
  const tomoDiff = currTomos - prevTomos
  if (Math.abs(tomoDiff) > 0 && newSeries.length === 0 && removedSeries.length === 0) {
    entries.push({
      tipo: 'otro',
      descripcion: `Colección actualizada: ${tomoDiff > 0 ? '+' : ''}${tomoDiff} tomo${Math.abs(tomoDiff) !== 1 ? 's' : ''}`,
      detalle: `Total: ${currTomos} tomos en ${current.length} series`,
    })
  }

  return entries
}

function groupByEditorial(
  seriesList: string[],
  catalog: MangaRow[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const series of seriesList) {
    const row = catalog.find((r) => r.series === series)
    const ed = row?.editorial || 'Sin editorial'
    if (!result[ed]) result[ed] = []
    result[ed].push(series)
  }
  return result
}
