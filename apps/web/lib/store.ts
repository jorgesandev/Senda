'use client'

import { create } from 'zustand'
import { MOCK_FEATURES, requestRoute } from './api'
import { resolveEffect } from './matrix'
import type { A11yPrefs, MapFeature, Profile, ReportKind, RouteResponse, Situational } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6_371_000
  const toRad = Math.PI / 180
  const phi1 = lat1 * toRad
  const phi2 = lat2 * toRad
  const dPhi = (lat2 - lat1) * toRad
  const dLambda = (lng2 - lng1) * toRad
  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

function normalizeLocation(value: string, fallback: { lat: number; lng: number }) {
  const normalized = value.trim()
  if (!normalized || normalized.toLowerCase() === 'mi ubicacion' || normalized.toLowerCase() === 'mi ubicación') {
    return fallback
  }
  return normalized
}

interface SendaState {
  profiles: Profile[]
  situational: Situational[]
  activeRoute: RouteResponse | null
  activeOrigin: string | null
  activeDestination: string | null
  liveFeatures: MapFeature[]
  reportKind: ReportKind
  showRerouteToast: boolean
  a11yPrefs: A11yPrefs
  toggleProfile: (profile: Profile) => void
  toggleSituational: (situational: Situational) => void
  planRoute: (origin: string, destination: string) => Promise<void>
  setActiveRoute: (route: RouteResponse | null) => void
  addLiveFeature: (feature: MapFeature) => void
  setReportKind: (kind: ReportKind) => void
  rerouteIfNeeded: (feature: MapFeature) => Promise<void>
  subscribeToFeatureStream: () => () => void
  setHighContrast: (enabled: boolean) => void
  setTextScale: (scale: A11yPrefs['textScale']) => void
}

export const useSendaStore = create<SendaState>((set, get) => ({
  profiles: ['WHEELCHAIR'],
  situational: [],
  activeRoute: null,
  activeOrigin: null,
  activeDestination: null,
  liveFeatures: MOCK_FEATURES,
  reportKind: 'barrier',
  showRerouteToast: false,
  a11yPrefs: {
    highContrast: false,
    textScale: 100,
    reducedMotion: false
  },

  toggleProfile: (profile) =>
    set((state) => ({
      profiles: state.profiles.includes(profile)
        ? state.profiles.filter((item) => item !== profile)
        : [...state.profiles, profile]
    })),

  toggleSituational: (situational) =>
    set((state) => ({
      situational: state.situational.includes(situational)
        ? state.situational.filter((item) => item !== situational)
        : [...state.situational, situational]
    })),

  planRoute: async (origin, destination) => {
    const profiles: Profile[] = get().profiles.length > 0 ? get().profiles : ['WHEELCHAIR']
    const route = await requestRoute({
      origin: normalizeLocation(origin, { lat: 32.5331, lng: -117.0382 }),
      destination: normalizeLocation(destination, { lat: 32.5225, lng: -117.0191 }),
      profiles
    })
    set({ activeRoute: route, activeOrigin: origin, activeDestination: destination })
  },

  setActiveRoute: (route) => set({ activeRoute: route }),

  setReportKind: (kind) => set({ reportKind: kind }),

  addLiveFeature: (feature) => {
    set((state) => {
      if (state.liveFeatures.some((f) => f.id === feature.id)) return {}
      return { liveFeatures: [feature, ...state.liveFeatures] }
    })
    void get().rerouteIfNeeded(feature)
  },

  rerouteIfNeeded: async (feature) => {
    const { activeRoute, activeOrigin, activeDestination, profiles, showRerouteToast: alreadyShowing } = get()
    if (alreadyShowing) return
    if (!activeRoute || !activeOrigin || !activeDestination) return
    if (feature.kind !== 'barrier' && feature.kind !== 'crossing') return

    const isNear = activeRoute.coords.some(([lng, lat]) =>
      haversineMeters(lat, lng, feature.lat, feature.lng) < 80
    )
    if (!isNear) return

    const effect = resolveEffect(profiles, feature)
    if (effect !== 'B') return

    set({ showRerouteToast: true })
    try {
      const newRoute = await requestRoute({
        origin: normalizeLocation(activeOrigin, { lat: 32.5331, lng: -117.0382 }),
        destination: normalizeLocation(activeDestination, { lat: 32.5225, lng: -117.0191 }),
        profiles: profiles.length > 0 ? profiles : ['WHEELCHAIR']
      })
      set({ activeRoute: newRoute })
    } catch {
      // keep current route on error
    }
    setTimeout(() => set({ showRerouteToast: false }), 5000)
  },

  subscribeToFeatureStream: () => {
    if (typeof window === 'undefined') return () => {}

    let isReady = false
    const initialBatch: MapFeature[] = []
    const es = new EventSource(`${API_BASE_URL}/features/stream`)

    es.addEventListener('initial', (event: Event) => {
      try {
        const feature = JSON.parse((event as MessageEvent).data as string) as MapFeature
        initialBatch.push(feature)
      } catch {
        // ignore parse errors
      }
    })

    es.addEventListener('ready', () => {
      isReady = true
      if (initialBatch.length > 0) {
        set({ liveFeatures: initialBatch })
      }
    })

    es.addEventListener('new_feature', (event: Event) => {
      try {
        const feature = JSON.parse((event as MessageEvent).data as string) as MapFeature
        const alreadyExists = get().liveFeatures.some((f) => f.id === feature.id)
        set((state) => ({
          liveFeatures: alreadyExists
            ? state.liveFeatures.map((f) => (f.id === feature.id ? feature : f))
            : [feature, ...state.liveFeatures]
        }))
        if (!alreadyExists && isReady) void get().rerouteIfNeeded(feature)
      } catch {
        // ignore parse errors
      }
    })

    es.onerror = () => {
      es.close()
    }

    return () => es.close()
  },

  setHighContrast: (enabled) =>
    set((state) => ({
      a11yPrefs: { ...state.a11yPrefs, highContrast: enabled }
    })),

  setTextScale: (scale) =>
    set((state) => ({
      a11yPrefs: { ...state.a11yPrefs, textScale: scale }
    }))
}))
