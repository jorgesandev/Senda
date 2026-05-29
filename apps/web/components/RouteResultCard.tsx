import { Clock, Route } from 'lucide-react'
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
      <div className="grid gap-2 text-sm">
        <p>
          <strong>{route.features_evitadas.length}</strong> barrera evitada
        </p>
        <p>
          <strong>{route.features_aprovechadas.length}</strong> amenidad aprovechada
        </p>
      </div>
      <div className="max-h-44 overflow-auto pr-1 md:max-h-64">
        <StepList steps={route.steps} />
      </div>
    </section>
  )
}
