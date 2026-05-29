import Link from 'next/link'
import { Home, Landmark, Map, PlusCircle } from 'lucide-react'

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden" aria-label="Navegacion inferior">
      <div className="grid grid-cols-4">
        <Link href="/" className="touch-target flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold">
          <Home aria-hidden="true" size={20} />
          Inicio
        </Link>
        <Link href="/map" className="touch-target flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold">
          <Map aria-hidden="true" size={20} />
          Mapa
        </Link>
        <Link href="/report" className="touch-target flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold">
          <PlusCircle aria-hidden="true" size={20} />
          Reportar
        </Link>
        <Link href="/gov" className="touch-target flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold">
          <Landmark aria-hidden="true" size={20} />
          Gobierno
        </Link>
      </div>
    </nav>
  )
}
