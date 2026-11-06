const LOCALE = 'es-AR'

/** Fecha ISO `YYYY-MM-DD` o timestamp → `06 nov 2026`. */
export function formatDate(value: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00') : new Date(value)
  return date.toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Fecha de hoy en hora local (no UTC) con formato `YYYY-MM-DD`. */
export function todayLocalISO(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatMoney(value: number): string {
  return '$ ' + value.toLocaleString(LOCALE)
}

/** `plural(1, 'serie', 'series')` → `1 serie`; `plural(3, ...)` → `3 series`. */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${Math.abs(n) === 1 ? one : many}`
}
