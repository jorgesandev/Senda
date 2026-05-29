'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, XOctagon } from 'lucide-react'
import { vibratePattern, type HapticKind } from '@/lib/haptics'
import { useSendaStore } from '@/lib/store'

interface VisualAlert {
  kind: HapticKind
  message: string
}

const ALERT_META: Record<HapticKind, { label: string; classes: string; Icon: typeof AlertTriangle }> = {
  caution: {
    label: 'Precaución: barrera cercana',
    classes: 'bg-amber-50 border-amber-400 text-amber-800',
    Icon: AlertTriangle
  },
  block: {
    label: 'Ruta bloqueada: calculando desvío',
    classes: 'bg-red-50 border-red-400 text-red-800',
    Icon: XOctagon
  }
}

const CAUTION_DISTANCE_M = 40

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000
  const toRad = Math.PI / 180
  const a =
    Math.sin(((lat2 - lat1) * toRad) / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(((lng2 - lng1) * toRad) / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function HapticController() {
  const showRerouteToast = useSendaStore((s) => s.showRerouteToast)
  const activeRoute = useSendaStore((s) => s.activeRoute)
  const liveFeatures = useSendaStore((s) => s.liveFeatures)
  const profiles = useSendaStore((s) => s.profiles)

  const [alert, setAlert] = useState<VisualAlert | null>(null)
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevRerouteRef = useRef(false)
  // Ref para que el GPS callback siempre vea las features más recientes
  const liveFeaturesRef = useRef(liveFeatures)
  useEffect(() => { liveFeaturesRef.current = liveFeatures }, [liveFeatures])

  const showAlert = useCallback((kind: HapticKind) => {
    vibratePattern(kind)
    setAlert({ kind, message: ALERT_META[kind].label })
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
    alertTimerRef.current = setTimeout(() => setAlert(null), 3500)
  }, [])

  // Bloqueo: haptic cuando se activa el re-ruteo (nueva barrera en la ruta)
  useEffect(() => {
    if (showRerouteToast && !prevRerouteRef.current) {
      showAlert('block')
    }
    prevRerouteRef.current = showRerouteToast
  }, [showRerouteToast, showAlert])

  // Precaución por proximidad GPS (requiere ruta activa + permiso de ubicación)
  useEffect(() => {
    if (!activeRoute || typeof navigator === 'undefined' || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const nearBarrier = liveFeaturesRef.current.find((f) => {
          if (f.kind !== 'barrier' && f.kind !== 'crossing') return false
          if (haversineMeters(lat, lng, f.lat, f.lng) > CAUTION_DISTANCE_M) return false
          // Confirma que la barrera está en el corredor de la ruta activa
          return activeRoute.coords.some(([clng, clat]) =>
            haversineMeters(clat, clng, f.lat, f.lng) < 60
          )
        })
        if (nearBarrier) showAlert('caution')
      },
      () => {
        // GPS denegado o no disponible — ignorar silenciosamente
      },
      { enableHighAccuracy: true, maximumAge: 3000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [activeRoute, profiles, showAlert])

  useEffect(() => {
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current)
    }
  }, [])

  if (!alert) return null

  const meta = ALERT_META[alert.kind]
  const { Icon } = meta

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex items-center gap-3 border-b-2 px-4 py-3 font-semibold ${meta.classes}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <Icon aria-hidden="true" size={22} className="shrink-0" />
      <span>{alert.message}</span>
    </div>
  )
}
