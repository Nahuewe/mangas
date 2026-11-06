import { normalizeText } from './text'

/** "En publicación" (con o sin tilde, con cualquier variante de texto). */
export function isPublishing(estadoSerie: string | undefined): boolean {
  return normalizeText(estadoSerie ?? '').includes('publicacion')
}

export function isFinished(estadoSerie: string | undefined): boolean {
  return normalizeText(estadoSerie ?? '') === 'finalizado'
}
