export type ChangeType = 'aumento' | 'nueva_serie' | 'serie_terminada' | 'serie_iniciada' | 'otro'

export const TIPO_LABELS: Record<ChangeType, { label: string; color: string; emoji: string }> = {
  aumento: { label: 'Aumento de precios', color: 'text-orange-400', emoji: '📈' },
  nueva_serie: { label: 'Nueva serie', color: 'text-green-400', emoji: '✨' },
  serie_terminada: { label: 'Serie terminada', color: 'text-slate-400', emoji: '✅' },
  serie_iniciada: { label: 'Serie iniciada', color: 'text-blue-400', emoji: '🆕' },
  otro: { label: 'Otro', color: 'text-violet-400', emoji: '📝' },
}

export function getTipoLabel(tipo: string) {
  return TIPO_LABELS[tipo as ChangeType] ?? TIPO_LABELS.otro
}
