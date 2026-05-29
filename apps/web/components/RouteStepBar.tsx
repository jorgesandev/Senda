'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Navigation, X } from 'lucide-react'
import { useSendaStore } from '@/lib/store'

export function RouteStepBar() {
  const activeRoute = useSendaStore((state) => state.activeRoute)
  const clearActiveRoute = useSendaStore((state) => state.clearActiveRoute)
  const [stepIndex, setStepIndex] = useState(0)

  if (!activeRoute || activeRoute.steps.length === 0) return null

  const total = activeRoute.steps.length
  const step = activeRoute.steps[stepIndex]

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-white/80 bg-white/95 p-1.5 shadow-[0_14px_40px_rgba(15,23,42,0.24)] backdrop-blur"
      aria-label="Indicación actual"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-white">
        <Navigation aria-hidden="true" size={16} />
      </span>
      <button
        type="button"
        className="touch-target grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface disabled:opacity-30"
        aria-label="Paso anterior"
        disabled={stepIndex === 0}
        onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
      >
        <ChevronLeft aria-hidden="true" size={18} />
      </button>
      <div className="min-w-0 flex-1 px-1">
        <p className="text-xs font-semibold text-muted">
          Paso {stepIndex + 1} de {total}
        </p>
        <p className="truncate text-sm font-bold text-text">{step}</p>
      </div>
      <button
        type="button"
        className="touch-target grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface disabled:opacity-30"
        aria-label="Siguiente paso"
        disabled={stepIndex === total - 1}
        onClick={() => setStepIndex((i) => Math.min(total - 1, i + 1))}
      >
        <ChevronRight aria-hidden="true" size={18} />
      </button>
      <button
        type="button"
        className="touch-target grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-red-100 hover:text-red-700"
        aria-label="Cancelar viaje"
        onClick={clearActiveRoute}
      >
        <X aria-hidden="true" size={18} />
      </button>
    </div>
  )
}
