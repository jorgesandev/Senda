'use client'

import { Volume2 } from 'lucide-react'
import { createVoiceController } from '@/lib/voice'
import { useSendaStore } from '@/lib/store'

const voice = createVoiceController()

export function StepList({ steps }: { steps: string[] }) {
  const narratorMuted = useSendaStore((s) => s.a11yPrefs.narratorMuted)

  function readAllSteps() {
    if (narratorMuted) return
    const text = steps
      .map((step, i) => `Paso ${i + 1}: ${step}`)
      .join('. ')
    voice.speak(text)
  }

  return (
    <div className="space-y-2">
      {steps.length > 0 && (
        <button
          type="button"
          onClick={readAllSteps}
          disabled={narratorMuted}
          aria-label="Leer indicaciones en voz alta"
          className="btn-secondary w-full text-sm disabled:opacity-40"
        >
          <Volume2 aria-hidden="true" size={17} />
          Leer indicaciones
        </button>
      )}
      <ol className="space-y-2" aria-label="Indicaciones paso a paso">
        {steps.map((step, index) => (
          <li key={`${index}-${step}`} className="flex gap-3 rounded-md bg-surface p-3">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
