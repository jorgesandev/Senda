import { Clock, Route } from 'lucide-react'
import { FeatureMarker } from './FeatureMarker'
import { StepList } from './StepList'
import type { RouteResponse } from '@/lib/types'

export function RouteResultCard({ route }: { route: RouteResponse }) {
  return (
    <section className="space-y-3 rounded-t-2xl bg-white p-4 shadow-[0_-12px_35px_rgba(15,23,42,0.22)] md:rounded-lg md:border md:border-slate-200 md:shadow-panel" aria-labelledby="route-result-title">
      <div className="mx-auto h-1.5 w-11 rounded-full bg-slate-300 md:hidden" aria-hidden="true" />
      <h2 id="route-result-title" className="flex items-center gap-2 text-xl font-bold">
        <Route aria-hidden="true" size={22} />
        Ruta activa
      </h2>
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
          <p className="text-sm font-bold text-sevHigh">
            {route.features_evitadas.length} barrera{route.features_evitadas.length !== 1 ? 's' : ''} evitada{route.features_evitadas.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {route.features_evitadas.map((f) => (
              <FeatureMarker key={f.id} feature={f} />
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
          <div className="flex flex-wrap gap-2">
            {route.features_aprovechadas.map((f) => (
              <FeatureMarker key={f.id} feature={f} />
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
