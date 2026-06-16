export function estadoClass(v: string): string {
  const map: Record<string, string> = {
    'en curso':   'bg-orange-400/20 text-orange-400',
    'completado': 'bg-green-400/20 text-green-400',
    'droppeado':  'bg-red-400/20 text-red-400',
    'tomo único': 'bg-yellow-400/20 text-yellow-400',
  }
  return map[v.toLowerCase()] ?? 'bg-yellow-400/20 text-yellow-400'
}

export function editorialClass(v: string): string {
  const map: Record<string, string> = {
    'ivrea':              'bg-pink-500 text-white',
    'ivrea (españa)':     'bg-pink-500 text-white',
    'panini':             'bg-green-600 text-white',
    'kemuri':             'bg-orange-500 text-white',
    'distrito manga':     'bg-blue-500 text-white',
    'ovni press':         'bg-purple-700 text-white',
    'planeta cómic':      'bg-blue-700 text-white',
    'utopia':             'bg-sky-600 text-white',
    'merci':              'bg-stone-600 text-white',
    'milky way':          'bg-blue-800 text-white',
    'moztros':            'bg-red-700 text-white',
    'kibook ediciones':   'bg-teal-600 text-white',
    'random comics':      'bg-fuchsia-700 text-white',
    'hotel de las ideas': 'bg-rose-700 text-white',
  }
  return map[v.toLowerCase()] ?? 'bg-stone-600 text-white'
}

export function tamañoClass(v: string): string {
  const map: Record<string, string> = {
    'b6':       'bg-emerald-400/20 text-emerald-400',
    'b6x2':     'bg-lime-400/20 text-lime-400',
    'c6':       'bg-yellow-400/20 text-yellow-400',
    'c6x2':     'bg-orange-400/20 text-orange-400',
    'a5':       'bg-fuchsia-400/20 text-fuchsia-400',
    'a5 color': 'bg-rose-400/20 text-rose-400',
  }
  return map[v.toLowerCase()] ?? 'bg-emerald-400/20 text-emerald-400'
}

export function serieClass(v: string): string {
  const lower = v.toLowerCase()
  return lower.includes('publicación') || lower.includes('publicacion')
    ? 'bg-indigo-400/20 text-indigo-400'
    : 'bg-slate-400/20 text-slate-400'
}
