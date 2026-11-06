export const STATS_ROW_MARKER = 'Estado'

export const COLUMN_KEYS = [
  'estado',
  'editorial',
  'series',
  'tomos',
  'precio',
  'tamaño',
  'total',
  'estadoSerie',
  'autor',
  'dibujante',
  'falta',
] as const

export type ColumnKey = (typeof COLUMN_KEYS)[number]

export const NUMERIC_KEYS = ['tomos', 'precio', 'total'] as const
export type NumericKey = (typeof NUMERIC_KEYS)[number]
export type TextKey = Exclude<ColumnKey, NumericKey>

export function isNumericKey(key: ColumnKey): key is NumericKey {
  return (NUMERIC_KEYS as readonly string[]).includes(key)
}

/** Una fila del catálogo. Los campos numéricos son `null` cuando la celda está vacía. */
export type MangaRow = Record<TextKey, string> & Record<NumericKey, number | null>

export type PriceMode = 'lista' | 'venta'

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  estado: 'Estado',
  editorial: 'Editorial',
  series: 'Serie',
  tomos: 'Tomos',
  precio: 'Precio unit.',
  tamaño: 'Tamaño',
  total: 'Valor total',
  estadoSerie: 'Estado serie',
  autor: 'Autor/a',
  dibujante: 'Dibujante',
  falta: 'Me falta leer',
}

/**
 * Nombres con los que puede aparecer cada columna en el encabezado del Excel
 * (ya normalizados: sin tildes, minúsculas, sin signos).
 */
export const COLUMN_ALIASES: Record<ColumnKey, string[]> = {
  estado: ['estado'],
  editorial: ['editorial'],
  series: ['serie', 'series'],
  tomos: ['tomos'],
  precio: ['precio', 'precio unit', 'precio unitario'],
  tamaño: ['tamano', 'tamaño'],
  total: ['total', 'valor total'],
  estadoSerie: ['estado serie', 'estado de serie', 'estado de la serie'],
  autor: ['autor', 'autora', 'autor a'],
  dibujante: ['dibujante'],
  falta: ['me falta leer', 'falta leer', 'falta'],
}

export const PRECIO_VENTA_RATE = 0.6

export const FILTER_COLUMNS: { label: string; key: TextKey }[] = [
  { label: 'Estado', key: 'estado' },
  { label: 'Editorial', key: 'editorial' },
  { label: 'Tamaño', key: 'tamaño' },
  { label: 'Estado Serie', key: 'estadoSerie' },
]
