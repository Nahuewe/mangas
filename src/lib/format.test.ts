import { describe, expect, it } from 'vitest'
import { formatMoney, plural, todayLocalISO } from './format'

describe('plural', () => {
  it('usa singular solo para 1 y -1', () => {
    expect(plural(1, 'tomo', 'tomos')).toBe('1 tomo')
    expect(plural(-1, 'tomo', 'tomos')).toBe('-1 tomo')
    expect(plural(0, 'tomo', 'tomos')).toBe('0 tomos')
    expect(plural(3, 'tomo', 'tomos')).toBe('3 tomos')
  })
})

describe('formatMoney', () => {
  it('formatea con separador de miles argentino', () => {
    expect(formatMoney(12500)).toBe('$ 12.500')
  })
})

describe('todayLocalISO', () => {
  it('usa la fecha local, no UTC', () => {
    expect(todayLocalISO(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
