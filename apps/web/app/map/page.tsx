'use client'

import { Fab } from '@/components/Fab'
import { HapticController } from '@/components/HapticController'
import { LiveRerouteToast } from '@/components/LiveRerouteToast'
import { MapView } from '@/components/MapView'
import { RoutePlanner } from '@/components/RoutePlanner'
import { RouteResultCard } from '@/components/RouteResultCard'
import { useSendaStore } from '@/lib/store'

export default function MapPage() {
  const activeRoute = useSendaStore((state) => state.activeRoute)
  const showRerouteToast = useSendaStore((state) => state.showRerouteToast)
  const mapState = activeRoute ? 'routed' : 'idle'

  return (
    <main className="h-[100dvh] overflow-hidden bg-map text-text">
      <HapticController />

      <section className="relative h-full">
        <MapView state={mapState} />

        <div className="absolute inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-40 mx-auto max-w-[560px] md:left-4 md:right-auto md:mx-0 md:w-[520px]">
          <RoutePlanner />
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30 md:left-4 md:right-auto md:w-[420px]">
          <div className="pointer-events-auto max-h-[42dvh] overflow-hidden rounded-t-2xl md:max-h-[50dvh] md:rounded-lg">
            {activeRoute ? <RouteResultCard route={activeRoute} /> : null}
          </div>
        </div>

        <LiveRerouteToast visible={showRerouteToast} />

        <Fab href="/report" label="Reportar" />
      </section>
    </main>
  )
}
