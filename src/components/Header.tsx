import { useMemo } from 'react'
import type { MangaRow, PriceMode } from '../lib/config'
import { formatMoney } from '../lib/format'
import { computeTotals } from '../lib/stats'

interface Props {
  mangas: MangaRow[]
  priceMode: PriceMode
  priceRate: number
}

export function Header({ mangas, priceMode, priceRate }: Props) {
  const totals = useMemo(() => computeTotals(mangas), [mangas])
  const displayValor = priceMode === 'venta' ? totals.valor * priceRate : totals.valor

  const stats = [
    { label: 'Series', value: totals.series },
    { label: 'Tomos', value: totals.tomos },
    {
      label: priceMode === 'venta' ? 'Valor venta' : 'Valor total',
      value: formatMoney(Math.round(displayValor)),
    },
  ]

  return (
    <header className="header-bg border-b border-border sticky top-0 z-50 px-4 sm:px-6 py-4">
      <div className="max-w-[1750px] mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <img
            src="/mangaFavicon.png"
            alt="Manga"
            className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
          />
          <h1 className="text-xl font-bold tracking-tight text-gradient">Colección de Mangas</h1>
        </div>

        <div className="hidden sm:flex gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-end gap-0.5">
              <span className="text-base font-bold text-violet-400 leading-none">{s.value}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-tmuted">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
