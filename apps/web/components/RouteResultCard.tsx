'use client'

import { useEffect, useRef } from 'react'
import { Clock, Route, Volume2 } from 'lucide-react'
import { FeatureMarker } from './FeatureMarker'
import { StepList } from './StepList'
import { createVoiceController } from '@/lib/voice'
import { useSendaStore } from '@/lib/store'
import type { RouteResponse } from '@/lib/types'

const voice = createVoiceController()

function buildRouteSummary(route: RouteResponse): string {
  const dist =
    route.distance_m >= 1000
      ? `${(route.distance_m / 1000).toFixed(1)} kilómetros`
      : `${Math.round(route.distance_m)} metros`
  const evitadas = route.features_evitadas.length
  const barriers =
    evitadas > 0
      ? `Evitando ${evitadas} barrera${evitadas !== 1 ? 's' : ''}.`
      : 'Sin barreras en esta ruta.'
  const firstStep = route.steps[0] ? ` Primera indicación: ${route.steps[0]}.` : ''
  return `Ruta encontrada. ${dist}, ${route.eta_min} minutos. ${barriers}${firstStep}`
}

export function RouteResultCard({ route }: { route: RouteResponse }) {
  const narratorMuted = useSendaStore((s) => s.a11yPrefs.narratorMuted)
  const prevRouteRef = useRef<RouteResponse | null>(null)

  // Narración automática cuando llega una ruta nueva (o cambia)
  useEffect(() => {
    if (route !== prevRouteRef.current && !narratorMuted) {
      voice.speak(buildRouteSummary(route))
    }
    prevRouteRef.current = route
  }, [route, narratorMuted])

  return (
    <section
      className="space-y-3 rounded-t-2xl bg-white p-4 shadow-[0_-12px_35px_rgba(15,23,42,0.22)] md:rounded-lg md:border md:border-slate-200 md:shadow-panel"
      aria-labelledby="route-result-title"
    >
      <div className="mx-auto h-1.5 w-11 rounded-full bg-slate-300 md:hidden" aria-hidden="true" />

      <div className="flex items-center justify-between gap-2">
        <h2 id="route-result-title" className="flex items-center gap-2 text-xl font-bold">
          <Route aria-hidden="true" size={22} />
          Ruta activa
        </h2>
        <button
          type="button"
          onClick={() => voice.speak(buildRouteSummary(route))}
          disabled={narratorMuted}
          aria-label="Leer resumen de la ruta"
          className="btn-secondary px-3 text-sm disabled:opacity-40"
        >
          <Volume2 aria-hidden="true" size={17} />
          Leer ruta
        </button>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-surface p-3">
          <dt className="text-sm text-muted">Distancia</dt>
          <dd className="font-semibold">{Math.round(route.distance_m)} m</dd>
        </div>
        <div className="rounded-md bg-surface p-3">
          <dt className="flex items-center gap-1 text-sm text-muted">
            <Clock aria-hidden="true" size={16} />
            ETA
          </dt>
          <dd className="font-semibold">{route.eta_min} min</dd>
        </div>
      </dl>

      {route.features_evitadas.length > 0 ? (
        <div className="space-y-1">
          <p className="text-sm font-bold text-sevHigh" aria-live="polite">
            {route.features_evitadas.length} barrera{route.features_evitadas.length !== 1 ? 's' : ''} evitada{route.features_evitadas.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Barreras evitadas">
            {route.features_evitadas.map((f) => (
              <div key={f.id} role="listitem">
                <FeatureMarker feature={f} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">Sin barreras evitadas en esta ruta</p>
      )}

      {route.features_aprovechadas.length > 0 ? (
        <div className="space-y-1">
          <p className="text-sm font-bold text-ok">
            {route.features_aprovechadas.length} amenidad{route.features_aprovechadas.length !== 1 ? 'es' : ''} en ruta
          </p>
          <div className="flex flex-wrap gap-2" role="list" aria-label="Amenidades en ruta">
            {route.features_aprovechadas.map((f) => (
              <div key={f.id} role="listitem">
                <FeatureMarker feature={f} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="max-h-44 overflow-auto pr-1 md:max-h-64">
        <StepList steps={route.steps} />
      </div>
    </section>
  )
}
