'use client'

import { Bus, CircleCheck, Footprints, TriangleAlert } from 'lucide-react'
import { useSendaStore } from '@/lib/store'
import type { ReportKind } from '@/lib/types'

const KINDS: Array<{ kind: ReportKind; label: string; description: string; icon: typeof TriangleAlert }> = [
  { kind: 'barrier', label: 'Barrera', description: 'Obstáculo, escalón, rampa deficiente…', icon: TriangleAlert },
  { kind: 'amenity', label: 'Amenidad', description: 'Rampa buena, baño accesible, banca…', icon: CircleCheck },
  { kind: 'transport', label: 'Transporte', description: 'Parada de camión, accesibilidad…', icon: Bus },
  { kind: 'crossing', label: 'Cruce', description: 'Semáforo, cruce peatonal…', icon: Footprints }
]

export function KindSelector() {
  const reportKind = useSendaStore((state) => state.reportKind)
  const setReportKind = useSendaStore((state) => state.setReportKind)

  return (
    <section className="panel p-4" aria-labelledby="kind-title">
      <h2 id="kind-title" className="mb-3 text-2xl font-bold">
        Tipo de reporte
      </h2>
      <div className="grid gap-2" role="radiogroup" aria-label="Tipo de feature">
        {KINDS.map(({ kind, label, description, icon: Icon }) => (
          <button
            key={kind}
            type="button"
            className={`touch-target flex items-start gap-3 rounded-md border px-3 py-2 text-left font-semibold transition-colors ${
              reportKind === kind ? 'border-brand bg-blue-50 text-brand' : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
            role="radio"
            aria-checked={reportKind === kind}
            onClick={() => setReportKind(kind)}
          >
            <Icon aria-hidden="true" size={20} className="mt-0.5 shrink-0" />
            <span>
              <span className="block">{label}</span>
              <span className="block text-xs font-normal text-muted">{description}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
