'use client'

import { PropsWithChildren, useEffect } from 'react'
import { CaseSensitive, Contrast, Volume2, VolumeX, Vibrate } from 'lucide-react'
import { useSendaStore } from '@/lib/store'
import { createVoiceController } from '@/lib/voice'

const voice = createVoiceController()

export function A11yProvider({ children }: PropsWithChildren) {
  const prefs = useSendaStore((state) => state.a11yPrefs)

  useEffect(() => {
    document.documentElement.dataset.contrast = prefs.highContrast ? 'high' : 'standard'
    document.documentElement.dataset.textScale = String(prefs.textScale)
  }, [prefs.highContrast, prefs.textScale])

  // Sincroniza el narrador del voice singleton con el store
  useEffect(() => {
    voice.setMuted(prefs.narratorMuted)
  }, [prefs.narratorMuted])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    }
  }, [])

  return <>{children}</>
}

export function AccessibilityControls() {
  const prefs = useSendaStore((state) => state.a11yPrefs)
  const setHighContrast = useSendaStore((state) => state.setHighContrast)
  const setTextScale = useSendaStore((state) => state.setTextScale)
  const setNarratorMuted = useSendaStore((state) => state.setNarratorMuted)
  const setVibrateOnly = useSendaStore((state) => state.setVibrateOnly)

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Controles de accesibilidad">
      {/* Alto contraste */}
      <button
        type="button"
        className="btn-secondary"
        aria-pressed={prefs.highContrast}
        aria-label={prefs.highContrast ? 'Desactivar alto contraste' : 'Activar alto contraste'}
        onClick={() => setHighContrast(!prefs.highContrast)}
      >
        <Contrast aria-hidden="true" size={20} />
        <span className="sr-only sm:not-sr-only">Alto contraste</span>
      </button>

      {/* Tamaño de texto */}
      <label className="inline-flex min-h-12 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 font-semibold">
        <CaseSensitive aria-hidden="true" size={20} />
        <span className="sr-only">Tamaño de texto</span>
        <select
          className="bg-transparent"
          value={prefs.textScale}
          aria-label="Tamaño de texto"
          onChange={(e) => setTextScale(Number(e.target.value) as 100 | 125 | 150 | 200)}
        >
          <option value={100}>100%</option>
          <option value={125}>125%</option>
          <option value={150}>150%</option>
          <option value={200}>200%</option>
        </select>
      </label>

      {/* Silenciar narrador */}
      <button
        type="button"
        className="btn-secondary"
        aria-pressed={prefs.narratorMuted}
        aria-label={prefs.narratorMuted ? 'Activar narrador de voz' : 'Silenciar narrador de voz'}
        onClick={() => setNarratorMuted(!prefs.narratorMuted)}
        title={prefs.narratorMuted ? 'Narrador silenciado' : 'Narrador activo'}
      >
        {prefs.narratorMuted ? (
          <VolumeX aria-hidden="true" size={20} />
        ) : (
          <Volume2 aria-hidden="true" size={20} />
        )}
        <span className="sr-only sm:not-sr-only">Narrador</span>
      </button>

      {/* Solo vibración (DEAF_HOH) */}
      <button
        type="button"
        className={`btn-secondary ${prefs.vibrateOnly ? 'border-brand bg-blue-50 text-brand' : ''}`}
        aria-pressed={prefs.vibrateOnly}
        aria-label={prefs.vibrateOnly ? 'Desactivar modo solo vibración' : 'Activar modo solo vibración — sin audio, visual + háptica'}
        onClick={() => setVibrateOnly(!prefs.vibrateOnly)}
        title="Solo vibración (DEAF/HOH)"
      >
        <Vibrate aria-hidden="true" size={20} />
        <span className="sr-only sm:not-sr-only">Solo vibración</span>
      </button>
    </div>
  )
}
