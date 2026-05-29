'use client'

import { Compass } from 'lucide-react'
import { getCompassReading } from '@/lib/compass'

export function CompassGuide() {
  const reading = getCompassReading()

  return (
    <section className="panel flex items-center justify-between gap-4 p-4" aria-label="Guia por brujula">
      <div>
        <h2 className="text-xl font-bold">Brujula</h2>
        <p className="text-sm text-muted">Apunta a {reading.headingDeg} grados.</p>
      </div>
      <Compass aria-hidden="true" size={36} className="text-brand" />
    </section>
  )
}
