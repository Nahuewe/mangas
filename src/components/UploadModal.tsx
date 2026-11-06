import { useEffect, useState } from 'react'
import type { MangaRow } from '../lib/config'
import { getSession } from '../lib/supabase'
import { XIcon } from './icons'
import { AuthStep } from './upload/AuthStep'
import { UploadStep } from './upload/UploadStep'

interface Props {
  previousMangas: MangaRow[]
  onClose: () => void
  onSuccess: () => void
}

type Step = 'checking' | 'auth' | 'upload'

export function UploadModal({ previousMangas, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('checking')

  // Si ya hay una sesión iniciada se salta el login.
  useEffect(() => {
    let cancelled = false
    getSession()
      .then((s) => !cancelled && setStep(s ? 'upload' : 'auth'))
      .catch(() => !cancelled && setStep('auth'))
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        className="bg-surface border border-border rounded-xl w-full max-w-md p-6 shadow-2xl my-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="upload-title" className="text-sm font-bold text-fg uppercase tracking-widest">
            {step === 'upload' ? 'Subir catálogo' : 'Acceso restringido'}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="text-tmuted hover:text-red-400 transition"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {step === 'auth' && <AuthStep onSuccess={() => setStep('upload')} />}
        {step === 'upload' && (
          <UploadStep
            previousMangas={previousMangas}
            onSignedOut={() => setStep('auth')}
            onDone={() => {
              onSuccess()
              onClose()
            }}
          />
        )}
      </div>
    </div>
  )
}
