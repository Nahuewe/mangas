/** Minúsculas, sin tildes y con espacios colapsados: sirve para comparar y buscar. */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Igual que `normalizeText` pero además reemplaza signos por espacios (para encabezados). */
export function normalizeHeader(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9ñ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
