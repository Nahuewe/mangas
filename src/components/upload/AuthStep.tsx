import { useState } from 'react'
import { signIn } from '../../lib/supabase'
import { Spinner } from '../icons'
import { EyeIcon, EyeOffIcon } from '../icons'

const INPUT_CLASS =
  'w-full bg-bg border border-border rounded-lg text-fg text-sm px-3 py-2 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-tdim transition'

export function AuthStep({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-xs text-tmuted">Iniciá sesión para poder actualizar el catálogo.</p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        aria-label="Email"
        autoComplete="username"
        required
        autoFocus
        className={INPUT_CLASS}
      />

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          aria-label="Contraseña"
          autoComplete="current-password"
          required
          className={`${INPUT_CLASS} pr-10`}
        />
        <button
          type="button"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setShowPassword((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-tmuted hover:text-violet-400 transition"
        >
          {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
      >
        {busy && <Spinner className="w-4 h-4" />}
        Ingresar
      </button>
    </form>
  )
}
