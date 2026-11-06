import { isPublishing } from './status'
import { normalizeText } from './text'

function pick(map: Record<string, string>, value: string, fallback: string): string {
  return map[normalizeText(value)] ?? fallback
}

export function estadoClass(v: string): string {
  return pick(
    {
      'en curso': 'bg-orange-400/20 text-orange-400',
      completado: 'bg-green-400/20 text-green-400',
      droppeado: 'bg-red-400/20 text-red-400',
      'tomo unico': 'bg-yellow-400/20 text-yellow-400',
    },
    v,
    'bg-yellow-400/20 text-yellow-400'
  )
}

export function editorialClass(v: string): string {
  return pick(
    {
      ivrea: 'bg-pink-500 text-white',
      'ivrea (espana)': 'bg-pink-500 text-white',
      panini: 'bg-green-600 text-white',
      kemuri: 'bg-orange-500 text-white',
      'distrito manga': 'bg-blue-500 text-white',
      'ovni press': 'bg-purple-700 text-white',
      'planeta comic': 'bg-blue-700 text-white',
      utopia: 'bg-sky-600 text-white',
      merci: 'bg-stone-600 text-white',
      'milky way': 'bg-blue-800 text-white',
      moztros: 'bg-red-700 text-white',
      'kibook ediciones': 'bg-teal-600 text-white',
      'random comics': 'bg-fuchsia-700 text-white',
      'hotel de las ideas': 'bg-rose-700 text-white',
    },
    v,
    'bg-stone-600 text-white'
  )
}

export function tamañoClass(v: string): string {
  return pick(
    {
      b6: 'bg-emerald-400/20 text-emerald-400',
      b6x2: 'bg-lime-400/20 text-lime-400',
      c6: 'bg-yellow-400/20 text-yellow-400',
      c6x2: 'bg-orange-400/20 text-orange-400',
      a5: 'bg-fuchsia-400/20 text-fuchsia-400',
      'a5 color': 'bg-rose-400/20 text-rose-400',
    },
    v,
    'bg-emerald-400/20 text-emerald-400'
  )
}

export function serieClass(v: string): string {
  return isPublishing(v) ? 'bg-indigo-400/20 text-indigo-400' : 'bg-slate-400/20 text-slate-400'
}
