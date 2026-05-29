'use client'

import { PropsWithChildren, useEffect } from 'react'
import { CaseSensitive, Contrast } from 'lucide-react'
import { useSendaStore } from '@/lib/store'

export function A11yProvider({ children }: PropsWithChildren) {
  const prefs = useSendaStore((state) => state.a11yPrefs)

  useEffect(() => {
    document.documentElement.dataset.contrast = prefs.highContrast ? 'high' : 'standard'
    document.documentElement.dataset.textScale = String(prefs.textScale)
  }, [prefs.highContrast, prefs.textScale])

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

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Controles de accesibilidad">
      <button
        type="button"
        className="btn-secondary"
        aria-pressed={prefs.highContrast}
        onClick={() => setHighContrast(!prefs.highContrast)}
      >
        <Contrast aria-hidden="true" size={20} />
        Alto contraste
      </button>
      <label className="inline-flex min-h-12 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 font-semibold">
        <CaseSensitive aria-hidden="true" size={20} />
        <span className="sr-only">Tamano de texto</span>
        <select
          className="bg-transparent"
          value={prefs.textScale}
          aria-label="Tamano de texto"
          onChange={(event) => setTextScale(Number(event.target.value) as 100 | 125 | 150 | 200)}
        >
          <option value={100}>100%</option>
          <option value={125}>125%</option>
          <option value={150}>150%</option>
          <option value={200}>200%</option>
        </select>
      </label>
    </div>
  )
}
