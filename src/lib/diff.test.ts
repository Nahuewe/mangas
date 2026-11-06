import { describe, expect, it } from 'vitest'
import type { MangaRow } from './config'
import { diffCatalogs } from './diff'

function manga(overrides: Partial<MangaRow> = {}): MangaRow {
  return {
    estado: 'En curso',
    editorial: 'Ivrea',
    series: 'Berserk',
    tomos: 5,
    precio: 1000,
    tamaño: 'B6',
    total: 5000,
    estadoSerie: 'En publicación',
    autor: '',
    dibujante: '',
    falta: '',
    ...overrides,
  }
}

describe('diffCatalogs', () => {
  it('no devuelve cambios si los catálogos son iguales', () => {
    expect(diffCatalogs([manga()], [manga()])).toEqual([])
  })

  it('detecta series nuevas y eliminadas', () => {
    const entries = diffCatalogs([manga({ series: 'A' })], [manga({ series: 'B' })])
    expect(entries.map((e) => e.tipo)).toEqual(['nueva_serie', 'otro'])
    expect(entries[0].detalle).toBe('B')
    expect(entries[1].descripcion).toBe('1 serie eliminada del catálogo')
  })

  it('no confunde mayúsculas, tildes ni espacios con series distintas', () => {
    const entries = diffCatalogs(
      [manga({ series: 'Dragón  Ball' })],
      [manga({ series: 'dragon ball' })]
    )
    expect(entries).toEqual([])
  })

  it('detecta aumentos agrupados por editorial', () => {
    const prev = [manga({ series: 'A' }), manga({ series: 'B', editorial: 'Panini' })]
    const curr = [
      manga({ series: 'A', precio: 1100 }),
      manga({ series: 'B', editorial: 'Panini', precio: 1200 }),
    ]
    const [aumento] = diffCatalogs(prev, curr)
    expect(aumento.tipo).toBe('aumento')
    expect(aumento.descripcion).toContain('2 series con aumento')
    expect(aumento.descripcion).toContain('+15.0%')
    expect(aumento.detalle).toBe('Ivrea (1), Panini (1)')
  })

  it('ignora variaciones de precio menores a $0.5', () => {
    expect(diffCatalogs([manga()], [manga({ precio: 1000.4 })])).toEqual([])
  })

  it('detecta bajas de precio', () => {
    const [baja] = diffCatalogs([manga()], [manga({ precio: 900 })])
    expect(baja.descripcion).toContain('1 serie con baja de precios')
    expect(baja.descripcion).toContain('-10.0%')
  })

  it('detecta series finalizadas y retomadas', () => {
    const fin = diffCatalogs([manga()], [manga({ estadoSerie: 'Finalizado' })])
    expect(fin[0].tipo).toBe('serie_terminada')

    const ret = diffCatalogs([manga({ estadoSerie: 'Finalizado' })], [manga()])
    expect(ret[0].tipo).toBe('serie_iniciada')
  })

  it('informa el cambio de tomos solo si no hubo altas ni bajas', () => {
    const [e] = diffCatalogs([manga()], [manga({ tomos: 7 })])
    expect(e.descripcion).toBe('Colección actualizada: +2 tomos')

    const withNew = diffCatalogs([manga()], [manga({ tomos: 7 }), manga({ series: 'Nueva' })])
    expect(withNew.some((x) => x.descripcion.startsWith('Colección actualizada'))).toBe(false)
  })
})
