'use client'

import { useState } from 'react'
import { Vibrate } from 'lucide-react'
import { vibratePattern, type HapticKind } from '@/lib/haptics'

export function HapticController() {
  const [lastPattern, setLastPattern] = useState<number[]>([])

  function trigger(kind: HapticKind) {
    const result = vibratePattern(kind)
    setLastPattern(result.pattern)
  }

  return (
    <section className="panel space-y-3 p-4" aria-labelledby="haptic-title">
      <h2 id="haptic-title" className="text-xl font-bold">
        Haptica
      </h2>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => trigger('caution')}>
          <Vibrate aria-hidden="true" size={20} />
          Precaucion
        </button>
        <button type="button" className="btn-secondary" onClick={() => trigger('block')}>
          <Vibrate aria-hidden="true" size={20} />
          Bloqueo
        </button>
      </div>
      <p className="text-sm text-muted">Patron mock: {lastPattern.join(', ') || 'sin activar'}</p>
    </section>
  )
}
