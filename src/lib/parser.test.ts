import { describe, expect, it } from 'vitest'
import { parseNumber, resolveColumns, rowsToMangas } from './parser'

const HEADER = [
  'Estado',
  'Editorial',
  'Serie',
  'Tomos',
  'Precio unit.',
  'Tamaño',
  'Valor total',
  'Estado serie',
  'Autor/a',
  'Dibujante',
  'Me falta leer',
]

describe('parseNumber', () => {
  it('acepta números, textos con $ y formato es-AR', () => {
    expect(parseNumber(4500)).toBe(4500)
    expect(parseNumber('$ 4500')).toBe(4500)
    expect(parseNumber('4.500')).toBe(4500)
    expect(parseNumber('4.500,50')).toBe(4500.5)
    expect(parseNumber('12,5')).toBe(12.5)
  })

  it('devuelve null para vacíos y texto no numérico', () => {
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('—')).toBeNull()
    expect(parseNumber('abc')).toBeNull()
    expect(parseNumber(undefined)).toBeNull()
  })
})

describe('rowsToMangas', () => {
  const row = [
    'En curso',
    'Ivrea',
    'Berserk',
    5,
    12000,
    'B6',
    60000,
    'En publicación',
    'Miura',
    'Miura',
    '—',
  ]

  it('mapea las columnas por el encabezado', () => {
    const [m] = rowsToMangas([HEADER, row])
    expect(m).toMatchObject({
      series: 'Berserk',
      editorial: 'Ivrea',
      tomos: 5,
      precio: 12000,
      total: 60000,
    })
  })

  it('sigue funcionando si cambia el orden de las columnas', () => {
    const swapped = [HEADER[2], HEADER[1], ...HEADER.filter((_, i) => i !== 1 && i !== 2)]
    const swappedRow = [row[2], row[1], ...row.filter((_, i) => i !== 1 && i !== 2)]
    const [m] = rowsToMangas([swapped, swappedRow])
    expect(m).toMatchObject({ series: 'Berserk', editorial: 'Ivrea', tomos: 5 })
  })

  it('usa el orden fijo si el encabezado no se reconoce', () => {
    const [m] = rowsToMangas([HEADER.map((_, i) => `col${i}`), row])
    expect(m.series).toBe('Berserk')
  })

  it('ignora filas vacías y corta en la fila de estadísticas', () => {
    const rows = [HEADER, row, Array(11).fill(''), ['Estado', 'x'], row]
    expect(rowsToMangas(rows)).toHaveLength(1)
  })

  it('descarta filas sin nombre de serie', () => {
    const noName = [...row]
    noName[2] = ''
    expect(rowsToMangas([HEADER, noName])).toHaveLength(0)
  })

  it('deja null en las celdas numéricas vacías', () => {
    const r = [...row]
    r[4] = ''
    expect(rowsToMangas([HEADER, r])[0].precio).toBeNull()
  })
})

describe('resolveColumns', () => {
  it('reconoce encabezados con tildes y signos distintos', () => {
    const cols = resolveColumns([...HEADER].map((h) => h.toUpperCase()))
    expect(cols.series).toBe(2)
    expect(cols.autor).toBe(8)
  })
})
