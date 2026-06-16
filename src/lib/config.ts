export const STATS_ROW_MARKER = 'Estado';

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
] as const;

export type ColumnKey = (typeof COLUMN_KEYS)[number];

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  estado:      'Estado',
  editorial:   'Editorial',
  series:      'Serie',
  tomos:       'Tomos',
  precio:      'Precio unit.',
  tamaño:      'Tamaño',
  total:       'Valor total',
  estadoSerie: 'Estado serie',
  autor:       'Autor/a',
  dibujante:   'Dibujante',
  falta:       'Me falta leer',
};

export const PRECIO_VENTA_RATE = 0.6;

export const FILTER_COLUMNS: { label: string; key: ColumnKey }[] = [
  { label: 'Estado',       key: 'estado' },
  { label: 'Editorial',    key: 'editorial' },
  { label: 'Tamaño',       key: 'tamaño' },
  { label: 'Estado Serie', key: 'estadoSerie' },
];

export type MangaRow = Record<ColumnKey, string>;

export const UPLOAD_PASSWORD = import.meta.env.VITE_PASSWORD as string
