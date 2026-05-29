import Link from 'next/link'
import { ArrowLeft, MapPin, ShieldCheck } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { FeatureMarker } from '@/components/FeatureMarker'
import { getFeatureById } from '@/lib/api'

export default async function FeaturePage({ params }: { params: { id: string } }) {
  const feature = await getFeatureById(params.id)

  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />
      <section className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-8">
        <Link href="/map" className="btn-secondary" aria-label="Volver al mapa">
          <ArrowLeft aria-hidden="true" size={20} />
          Volver
        </Link>
        <article className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">{feature.kind}</p>
              <h1 className="text-3xl font-bold">{feature.subtipo.replaceAll('_', ' ')}</h1>
              <p className="flex items-center gap-2 text-muted">
                <MapPin aria-hidden="true" size={18} />
                {feature.lat.toFixed(4)}, {feature.lng.toFixed(4)}
              </p>
            </div>
            <FeatureMarker feature={feature} />
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-surface p-4">
              <dt className="text-sm text-muted">Estado</dt>
              <dd className="font-semibold">{feature.status}</dd>
            </div>
            <div className="rounded-md bg-surface p-4">
              <dt className="text-sm text-muted">Confianza</dt>
              <dd className="font-semibold">{Math.round(feature.confidence * 100)}%</dd>
            </div>
            <div className="rounded-md bg-surface p-4">
              <dt className="text-sm text-muted">Votos</dt>
              <dd className="font-semibold">{feature.upvotes}</dd>
            </div>
          </dl>
          <button className="btn-primary mt-6" type="button">
            <ShieldCheck aria-hidden="true" size={20} />
            Sigue ahi
          </button>
        </article>
      </section>
    </main>
  )
}
