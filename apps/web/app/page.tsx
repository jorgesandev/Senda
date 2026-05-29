import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { ProfileSelector } from '@/components/ProfileSelector'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />
      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-12">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Senda Tijuana</p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-5xl">
            Rutas peatonales accesibles con perfil combinado.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted">
            Elige tus perfiles funcionales. Senda usa el peor caso para cuidar cada tramo y prepara el mapa vivo para reportes ciudadanos.
          </p>
          <Link href="/map" className="btn-primary" aria-label="Continuar al mapa de Senda">
            Continuar al mapa
            <ArrowRight aria-hidden="true" size={20} />
          </Link>
        </div>
        <ProfileSelector />
      </section>
    </main>
  )
}
