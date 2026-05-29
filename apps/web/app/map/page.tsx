'use client'

import { useState } from 'react'
import { HapticController } from '@/components/HapticController'
import { LiveRerouteToast } from '@/components/LiveRerouteToast'
import { MapFloatingControls } from '@/components/MapFloatingControls'
import { MapReportSheet } from '@/components/MapReportSheet'
import { MapView } from '@/components/MapView'
import { RoutePlanner } from '@/components/RoutePlanner'
import { RouteResultCard } from '@/components/RouteResultCard'
import { useSendaStore } from '@/lib/store'

export default function MapPage() {
  const activeRoute = useSendaStore((state) => state.activeRoute)
  const showRerouteToast = useSendaStore((state) => state.showRerouteToast)
  const [reportOpen, setReportOpen] = useState(false)
  const mapState = activeRoute ? 'routed' : 'idle'

  return (
    <main className="h-[100dvh] overflow-hidden bg-map text-text">
      <HapticController />

      <section className="relative h-full">
        <MapView state={mapState} />

        <div className="absolute inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-40 mx-auto max-w-[560px] md:left-4 md:right-auto md:mx-0 md:w-[520px]">
          <RoutePlanner />
        </div>

        <div className="absolute right-3 top-[calc(env(safe-area-inset-top)+13rem)] z-20 md:right-4 md:top-4">
          <MapFloatingControls onReportClick={() => setReportOpen(true)} />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 md:inset-x-auto md:bottom-4 md:left-4 md:w-[430px]">
          <div className="pointer-events-auto">
            {activeRoute ? <RouteResultCard route={activeRoute} /> : null}
          </div>
        </div>

        <LiveRerouteToast visible={showRerouteToast} />
        <MapReportSheet open={reportOpen} onClose={() => setReportOpen(false)} />
      </section>
    </main>
  )
}
