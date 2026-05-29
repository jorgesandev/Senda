'use client'

import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { Fab } from '@/components/Fab'
import { HapticController } from '@/components/HapticController'
import { LiveRerouteToast } from '@/components/LiveRerouteToast'
import { MapView } from '@/components/MapView'
import { RoutePlanner } from '@/components/RoutePlanner'
import { RouteResultCard } from '@/components/RouteResultCard'
import { VoiceController } from '@/components/VoiceController'
import { useSendaStore } from '@/lib/store'

export default function MapPage() {
  const activeRoute = useSendaStore((state) => state.activeRoute)
  const showRerouteToast = useSendaStore((state) => state.showRerouteToast)
  const mapState = activeRoute ? 'routed' : 'idle'

  return (
    <main className="h-[100dvh] overflow-hidden bg-bg text-text">
      {/* Alertas hápticas + visuales (fondo, siempre activo) */}
      <HapticController />

      <div className="hidden lg:block">
        <AppHeader />
      </div>

      <section className="relative h-full lg:h-[calc(100dvh-74px)] lg:p-4">
        <MapView state={mapState} />

        {/* Planeador de ruta (top) */}
        <div className="absolute inset-x-3 top-3 z-30 lg:left-6 lg:right-auto lg:top-6 lg:w-[390px]">
          <RoutePlanner />
        </div>

        {/* Resultado de ruta (bottom) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-16 z-30 lg:pointer-events-auto lg:bottom-auto lg:left-6 lg:right-auto lg:top-[342px] lg:w-[390px]">
          <div className="pointer-events-auto">
            {activeRoute ? <RouteResultCard route={activeRoute} /> : null}
          </div>
        </div>

        <LiveRerouteToast visible={showRerouteToast} />

        {/* FAB reportar (derecha) */}
        <Fab href="/report" label="Reportar" />

        {/* Botón de voz flotante — accesible con ojos cerrados */}
        <div className="absolute bottom-24 right-20 z-30 md:bottom-16 md:right-[5.5rem]">
          <VoiceController showPanel={false} />
        </div>
      </section>

      <BottomNav />
    </main>
  )
}
