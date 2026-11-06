import type { MangaRow } from './config'
import type { ChangeType } from './labels'
import { plural } from './format'
import { isFinished, isPublishing } from './status'
import { normalizeText } from './text'
import { computeTotals } from './stats'

export interface DiffEntry {
  tipo: ChangeType
  descripcion: string
  detalle: string
}

interface PriceChange {
  series: string
  pct: number
  editorial: string
}

/** Indexa por nombre normalizado, así "Berserk " y "berserk" cuentan como la misma serie. */
function indexBySeries(rows: MangaRow[]): Map<string, MangaRow> {
  return new Map(rows.map((r) => [normalizeText(r.series), r]))
}

export function diffCatalogs(previous: MangaRow[], current: MangaRow[]): DiffEntry[] {
  const prevMap = indexBySeries(previous)
  const currMap = indexBySeries(current)

  const newSeries: string[] = []
  const removedSeries: string[] = []
  const finishedSeries: string[] = []
  const startedSeries: string[] = []
  const priceChanges: PriceChange[] = []

  for (const [key, curr] of currMap) {
    const prev = prevMap.get(key)
    if (!prev) {
      newSeries.push(curr.series)
      continue
    }

    const oldPrice = prev.precio ?? 0
    const newPrice = curr.precio ?? 0
    if (oldPrice > 0 && Math.abs(newPrice - oldPrice) > 0.5) {
      priceChanges.push({
        series: curr.series,
        pct: ((newPrice - oldPrice) / oldPrice) * 100,
        editorial: curr.editorial || 'Sin editorial',
      })
    }

    if (isPublishing(prev.estadoSerie) && isFinished(curr.estadoSerie))
      finishedSeries.push(curr.series)
    if (isFinished(prev.estadoSerie) && isPublishing(curr.estadoSerie))
      startedSeries.push(curr.series)
  }

  for (const [key, prev] of prevMap) {
    if (!currMap.has(key)) removedSeries.push(prev.series)
  }

  const entries: DiffEntry[] = []

  if (newSeries.length > 0) {
    entries.push({
      tipo: 'nueva_serie',
      descripcion: plural(newSeries.length, 'serie nueva agregada', 'series nuevas agregadas'),
      detalle: newSeries.join(', '),
    })
  }

  if (removedSeries.length > 0) {
    entries.push({
      tipo: 'otro',
      descripcion:
        plural(removedSeries.length, 'serie eliminada', 'series eliminadas') + ' del catálogo',
      detalle: removedSeries.join(', '),
    })
  }

  if (finishedSeries.length > 0) {
    entries.push({
      tipo: 'serie_terminada',
      descripcion: plural(finishedSeries.length, 'serie finalizada', 'series finalizadas'),
      detalle: finishedSeries.join(', '),
    })
  }

  if (startedSeries.length > 0) {
    entries.push({
      tipo: 'serie_iniciada',
      descripcion:
        plural(startedSeries.length, 'serie retomada', 'series retomadas') + ' / en publicación',
      detalle: startedSeries.join(', '),
    })
  }

  const increases = priceChanges.filter((c) => c.pct > 0)
  const decreases = priceChanges.filter((c) => c.pct < 0)

  if (increases.length > 0) {
    const avgPct = increases.reduce((a, c) => a + c.pct, 0) / increases.length
    const perEditorial = new Map<string, number>()
    for (const c of increases)
      perEditorial.set(c.editorial, (perEditorial.get(c.editorial) ?? 0) + 1)

    entries.push({
      tipo: 'aumento',
      descripcion: `${plural(increases.length, 'serie con aumento', 'series con aumento')} de precios · promedio +${avgPct.toFixed(1)}%`,
      detalle: [...perEditorial].map(([ed, n]) => `${ed} (${n})`).join(', '),
    })
  }

  if (decreases.length > 0) {
    const avgPct = Math.abs(decreases.reduce((a, c) => a + c.pct, 0) / decreases.length)
    entries.push({
      tipo: 'otro',
      descripcion: `${plural(decreases.length, 'serie con baja', 'series con baja')} de precios · promedio -${avgPct.toFixed(1)}%`,
      detalle: decreases
        .slice(0, 8)
        .map((c) => `${c.series}: ${c.pct.toFixed(1)}%`)
        .join(', '),
    })
  }

  const prevTotals = computeTotals(previous)
  const currTotals = computeTotals(current)
  const tomoDiff = currTotals.tomos - prevTotals.tomos
  if (tomoDiff !== 0 && newSeries.length === 0 && removedSeries.length === 0) {
    entries.push({
      tipo: 'otro',
      descripcion: `Colección actualizada: ${tomoDiff > 0 ? '+' : ''}${plural(tomoDiff, 'tomo', 'tomos')}`,
      detalle: `Total: ${currTotals.tomos} tomos en ${current.length} series`,
    })
  }

  return entries
}
