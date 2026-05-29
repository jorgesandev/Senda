'use client'

import { AppHeader } from '@/components/AppHeader'
import { BottomNav } from '@/components/BottomNav'
import { CompassGuide } from '@/components/CompassGuide'
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
  const mapState = activeRoute ? 'routed' : 'idle'

  return (
    <main className="min-h-screen bg-bg pb-20 text-text">
      <AppHeader />
      <section className="grid gap-4 px-4 py-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-6">
        <div className="space-y-4">
          <RoutePlanner />
          <VoiceController />
          <HapticController />
          <CompassGuide />
          {activeRoute ? <RouteResultCard route={activeRoute} /> : null}
        </div>
        <div className="relative min-h-[540px]">
          <MapView state={mapState} />
          <LiveRerouteToast visible={Boolean(activeRoute)} />
          <Fab href="/report" label="Reportar" />
        </div>
      </section>
      <BottomNav />
    </main>
  )
}
