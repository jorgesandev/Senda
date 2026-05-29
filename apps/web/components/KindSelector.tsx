'use client'

import { useState } from 'react'
import { Bus, CircleCheck, Footprints, TriangleAlert } from 'lucide-react'
import type { ReportKind } from '@/lib/types'

const KINDS: Array<{ kind: ReportKind; label: string; icon: typeof TriangleAlert }> = [
  { kind: 'barrier', label: 'Barrera', icon: TriangleAlert },
  { kind: 'amenity', label: 'Amenidad', icon: CircleCheck },
  { kind: 'transport', label: 'Transporte', icon: Bus },
  { kind: 'crossing', label: 'Cruce', icon: Footprints }
]

export function KindSelector() {
  const [selected, setSelected] = useState<ReportKind>('barrier')

  return (
    <section className="panel p-4" aria-labelledby="kind-title">
      <h2 id="kind-title" className="mb-3 text-2xl font-bold">
        Tipo de reporte
      </h2>
      <div className="grid gap-2" role="radiogroup" aria-label="Tipo de feature">
        {KINDS.map(({ kind, label, icon: Icon }) => (
          <button
            key={kind}
            type="button"
            className={`touch-target flex items-center gap-3 rounded-md border px-3 py-2 font-semibold ${
              selected === kind ? 'border-brand bg-blue-50 text-brand' : 'border-slate-300 bg-white'
            }`}
            role="radio"
            aria-checked={selected === kind}
            onClick={() => setSelected(kind)}
          >
            <Icon aria-hidden="true" size={20} />
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
