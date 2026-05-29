'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Clock, ListChecks, MapPinned, Route, ShieldAlert, Volume2 } from 'lucide-react'
import { FeatureMarker } from './FeatureMarker'
import { StepList } from './StepList'
import { createVoiceController } from '@/lib/voice'
import { useSendaStore } from '@/lib/store'
import type { RouteResponse } from '@/lib/types'

const voice = createVoiceController()

type RouteTab = 'summary' | 'steps' | 'features'

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

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
}

export function RouteResultCard({ route }: { route: RouteResponse }) {
  const narratorMuted = useSendaStore((s) => s.a11yPrefs.narratorMuted)
  const prevRouteRef = useRef<RouteResponse | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<RouteTab>('summary')

  useEffect(() => {
    if (route !== prevRouteRef.current && !narratorMuted) {
      voice.speak(buildRouteSummary(route))
    }
    prevRouteRef.current = route
  }, [route, narratorMuted])

  const avoidedCount = route.features_evitadas.length
  const amenityCount = route.features_aprovechadas.length
  const firstStep = route.steps[0]

  function tabButton(tab: RouteTab, label: string, Icon: typeof Route) {
    const selected = activeTab === tab
    return (
      <button
        type="button"
        role="tab"
        aria-selected={selected}
        className={`touch-target inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold transition ${
          selected ? 'bg-brand text-white' : 'bg-surface text-text hover:bg-slate-200'
        }`}
        onClick={() => {
          setActiveTab(tab)
          setExpanded(true)
        }}
      >
        <Icon aria-hidden="true" size={17} />
        {label}
      </button>
    )
  }

  return (
    <section
      className="flex max-h-[72dvh] flex-col rounded-t-3xl border border-white/80 bg-white shadow-[0_-18px_48px_rgba(15,23,42,0.28)] md:max-h-[min(620px,calc(100dvh-2rem))] md:rounded-2xl md:border-slate-200"
      aria-labelledby="route-result-title"
      aria-expanded={expanded}
    >
      <div className="shrink-0 space-y-3 p-4 pb-3">
        <button
          type="button"
          className="mx-auto block h-8 w-16 rounded-full md:hidden"
          aria-label={expanded ? 'Contraer detalles de ruta' : 'Expandir detalles de ruta'}
          aria-expanded={expanded}
          onClick={() => setExpanded((open) => !open)}
        >
          <span className="mx-auto block h-1.5 w-11 rounded-full bg-slate-300" aria-hidden="true" />
        </button>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="route-result-title" className="flex items-center gap-2 text-lg font-bold">
              <Route aria-hidden="true" size={21} />
              Ruta activa
            </h2>
            <p className="mt-1 truncate text-sm font-semibold text-muted">
              {formatDistance(route.distance_m)} · {route.eta_min} min · {avoidedCount} barrera{avoidedCount !== 1 ? 's' : ''} evitada{avoidedCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => voice.speak(buildRouteSummary(route))}
              disabled={narratorMuted}
              aria-label="Leer resumen de la ruta"
              className="touch-target inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-3 text-sm font-bold text-text transition hover:bg-surface disabled:opacity-40"
            >
              <Volume2 aria-hidden="true" size={17} />
              <span className="hidden sm:inline">Leer</span>
            </button>
            <button
              type="button"
              className="touch-target grid h-12 w-12 place-items-center rounded-full border border-slate-300 bg-white text-text transition hover:bg-surface"
              aria-label={expanded ? 'Contraer detalles de ruta' : 'Expandir detalles de ruta'}
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? <ChevronDown aria-hidden="true" size={21} /> : <ChevronUp aria-hidden="true" size={21} />}
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-surface p-3">
            <dt className="text-xs font-semibold text-muted">Distancia</dt>
            <dd className="font-bold">{formatDistance(route.distance_m)}</dd>
          </div>
          <div className="rounded-2xl bg-surface p-3">
            <dt className="flex items-center gap-1 text-xs font-semibold text-muted">
              <Clock aria-hidden="true" size={15} />
              ETA
            </dt>
            <dd className="font-bold">{route.eta_min} min</dd>
          </div>
          <div className="rounded-2xl bg-red-50 p-3">
            <dt className="text-xs font-semibold text-red-700">Evitadas</dt>
            <dd className="font-bold text-red-700">{avoidedCount}</dd>
          </div>
        </dl>

        {expanded ? (
          <div className="flex gap-2" role="tablist" aria-label="Detalle de ruta">
            {tabButton('summary', 'Resumen', MapPinned)}
            {tabButton('steps', 'Pasos', ListChecks)}
            {tabButton('features', 'Barreras', ShieldAlert)}
          </div>
        ) : null}
      </div>

      {expanded ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          {activeTab === 'summary' ? (
            <div className="space-y-3 pb-2">
              <div className="rounded-2xl bg-surface p-3">
                <p className="text-sm font-bold text-text">Siguiente indicación</p>
                <p className="mt-1 text-sm leading-6 text-muted">{firstStep ?? 'Sin indicaciones disponibles.'}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
                  <p className="text-sm font-bold text-red-700" aria-live="polite">
                    {avoidedCount} barrera{avoidedCount !== 1 ? 's' : ''} evitada{avoidedCount !== 1 ? 's' : ''}
                  </p>
                  <p className="mt-1 text-sm text-red-700">La matriz eligió el peor caso para tus perfiles activos.</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-sm font-bold text-emerald-700">
                    {amenityCount} amenidad{amenityCount !== 1 ? 'es' : ''} en ruta
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">Puntos positivos detectados cerca del recorrido.</p>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'steps' ? (
            <div className="pb-2">
              <StepList steps={route.steps} />
            </div>
          ) : null}

          {activeTab === 'features' ? (
            <div className="space-y-4 pb-2">
              <div className="space-y-2">
                <p className="text-sm font-bold text-sevHigh" aria-live="polite">
                  Barreras evitadas
                </p>
                {route.features_evitadas.length > 0 ? (
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Barreras evitadas">
                    {route.features_evitadas.map((f) => (
                      <div key={f.id} role="listitem">
                        <FeatureMarker feature={f} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">Sin barreras evitadas en esta ruta</p>
                )}
              </div>

              {route.features_aprovechadas.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-ok">
                    Amenidades aprovechadas
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
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
