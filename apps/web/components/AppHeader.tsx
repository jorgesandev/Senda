import Link from 'next/link'
import { Map, ShieldCheck } from 'lucide-react'
import { AccessibilityControls } from './AccessibilityControls'

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="touch-target inline-flex items-center gap-3 font-bold" aria-label="Inicio de Senda">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white">
            <Map aria-hidden="true" size={22} />
          </span>
          <span className="text-xl">Senda</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Navegacion principal">
          <Link href="/map" className="btn-secondary">
            Mapa
          </Link>
          <Link href="/report" className="btn-secondary">
            Reportar
          </Link>
          <Link href="/gov" className="btn-secondary">
            <ShieldCheck aria-hidden="true" size={19} />
            Gobierno
          </Link>
        </nav>
        <AccessibilityControls />
      </div>
    </header>
  )
}
