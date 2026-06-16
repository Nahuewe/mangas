import type { MangaRow } from '../lib/config'

interface Props {
  mangas: MangaRow[]
  priceMode: 'lista' | 'venta'
  priceRate: number
}

export function Header({ mangas, priceMode, priceRate }: Props) {
  const totalSeries = mangas.length
  const totalTomos = mangas.reduce((a, r) => a + (parseInt(r.tomos) || 0), 0)
  const totalValor = mangas.reduce((a, r) => a + (parseFloat(r.total) || 0), 0)
  const displayValor = priceMode === 'venta' ? totalValor * priceRate : totalValor

  const stats = [
    { label: 'Series', value: totalSeries },
    { label: 'Tomos', value: totalTomos },
    {
      label: priceMode === 'venta' ? 'Valor venta' : 'Valor total',
      value: '$ ' + Math.round(displayValor).toLocaleString('es-AR'),
    },
  ]

  return (
    <header className="header-bg border-b border-[#2a2a38] sticky top-0 z-50 px-4 sm:px-6 py-4">
      <div className="max-w-[1750px] mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <img
            src="/mangaFavicon.png"
            alt="Manga"
            className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]"
          />
          <h1 className="text-xl font-bold tracking-tight text-gradient">
            Colección de Mangas
          </h1>
        </div>

        <div className="hidden sm:flex gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-end gap-0.5">
              <span className="text-base font-bold text-violet-400 leading-none">{s.value}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7878a0]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
