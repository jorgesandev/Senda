'use client'

import { create } from 'zustand'
import { MOCK_FEATURES, requestRoute } from './api'
import { detectPreferences } from './preferences'
import { resolveEffect } from './matrix'
import type { A11yPrefs, MapFeature, Profile, ReportKind, RouteResponse, Situational } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'
const PREFS_KEY = 'senda_a11y_prefs'

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

function isCurrentLocationLabel(value: string) {
  const normalized = value.trim().toLowerCase()
  return normalized === 'mi ubicacion' || normalized === 'mi ubicación'
}

function getBrowserLocation(fallback: { lat: number; lng: number }): Promise<{ lat: number; lng: number }> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(fallback)
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        window.dispatchEvent(new CustomEvent('senda:center-map', { detail: location }))
        resolve(location)
      },
      () => resolve(fallback),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 3000 }
    )
  })
}

async function resolveLocation(value: string, fallback: { lat: number; lng: number }) {
  const normalized = value.trim()
  if (!normalized) return fallback
  if (isCurrentLocationLabel(value)) {
    return getBrowserLocation(fallback)
  }
  return normalized
}

function loadStoredPrefs(): Partial<A11yPrefs> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Partial<A11yPrefs>
  } catch {
    return {}
  }
}

function persistPrefs(prefs: A11yPrefs) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // quota exceeded or private mode — ignore
  }
}

const DEFAULT_PREFS: A11yPrefs = {
  highContrast: false,
  textScale: 100,
  reducedMotion: false,
  vibrateOnly: false,
  narratorMuted: false
}

interface SendaState {
  profiles: Profile[]
  situational: Situational[]
  activeRoute: RouteResponse | null
  activeOrigin: string | null
  activeDestination: string | null
  previewRoute: RouteResponse | null
  previewOrigin: string | null
  previewDestination: string | null
  hasStartedRoute: boolean
  liveFeatures: MapFeature[]
  reportKind: ReportKind
  showRerouteToast: boolean
  a11yPrefs: A11yPrefs
  toggleProfile: (profile: Profile) => void
  toggleSituational: (situational: Situational) => void
  planRoute: (origin: string, destination: string) => Promise<void>
  calculatePreview: (origin: string, destination: string) => Promise<void>
  commitRoute: () => void
  clearPreview: () => void
  setActiveRoute: (route: RouteResponse | null) => void
  clearActiveRoute: () => void
  addLiveFeature: (feature: MapFeature) => void
  setReportKind: (kind: ReportKind) => void
  rerouteIfNeeded: (feature: MapFeature) => Promise<void>
  subscribeToFeatureStream: () => () => void
  setHighContrast: (enabled: boolean) => void
  setTextScale: (scale: A11yPrefs['textScale']) => void
  setNarratorMuted: (muted: boolean) => void
  setVibrateOnly: (enabled: boolean) => void
  loadPrefsFromStorage: () => void
}

export const useSendaStore = create<SendaState>((set, get) => ({
  profiles: ['WHEELCHAIR'],
  situational: [],
  activeRoute: null,
  activeOrigin: null,
  activeDestination: null,
  previewRoute: null,
  previewOrigin: null,
  previewDestination: null,
  hasStartedRoute: false,
  liveFeatures: MOCK_FEATURES,
  reportKind: 'barrier',
  showRerouteToast: false,
  a11yPrefs: DEFAULT_PREFS,

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
      origin: await resolveLocation(origin, { lat: 32.5331, lng: -117.0382 }),
      destination: await resolveLocation(destination, { lat: 32.5225, lng: -117.0191 }),
      profiles
    })
    set({ activeRoute: route, activeOrigin: origin, activeDestination: destination, hasStartedRoute: true })
  },

  calculatePreview: async (origin, destination) => {
    const profiles: Profile[] = get().profiles.length > 0 ? get().profiles : ['WHEELCHAIR']
    const route = await requestRoute({
      origin: await resolveLocation(origin, { lat: 32.5331, lng: -117.0382 }),
      destination: await resolveLocation(destination, { lat: 32.5225, lng: -117.0191 }),
      profiles
    })
    set({ previewRoute: route, previewOrigin: origin, previewDestination: destination, hasStartedRoute: false })
  },

  commitRoute: () => {
    const { previewRoute, previewOrigin, previewDestination } = get()
    if (!previewRoute) return
    set({
      activeRoute: previewRoute,
      activeOrigin: previewOrigin,
      activeDestination: previewDestination,
      hasStartedRoute: true
    })
  },

  clearPreview: () => {
    set({ previewRoute: null, previewOrigin: null, previewDestination: null, hasStartedRoute: false })
  },

  setActiveRoute: (route) => set({ activeRoute: route }),

  clearActiveRoute: () => set({ activeRoute: null, activeOrigin: null, activeDestination: null, previewRoute: null, previewOrigin: null, previewDestination: null, hasStartedRoute: false }),

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
        origin: await resolveLocation(activeOrigin, { lat: 32.5331, lng: -117.0382 }),
        destination: await resolveLocation(activeDestination, { lat: 32.5225, lng: -117.0191 }),
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
    set((state) => {
      const prefs = { ...state.a11yPrefs, highContrast: enabled }
      persistPrefs(prefs)
      return { a11yPrefs: prefs }
    }),

  setTextScale: (scale) =>
    set((state) => {
      const prefs = { ...state.a11yPrefs, textScale: scale }
      persistPrefs(prefs)
      return { a11yPrefs: prefs }
    }),

  setNarratorMuted: (muted) =>
    set((state) => {
      const prefs = { ...state.a11yPrefs, narratorMuted: muted }
      persistPrefs(prefs)
      return { a11yPrefs: prefs }
    }),

  // vibrateOnly implica silenciar el narrador automáticamente
  setVibrateOnly: (enabled) =>
    set((state) => {
      const prefs = { ...state.a11yPrefs, vibrateOnly: enabled, narratorMuted: enabled ? true : state.a11yPrefs.narratorMuted }
      persistPrefs(prefs)
      return { a11yPrefs: prefs }
    }),

  loadPrefsFromStorage: () => {
    const stored = loadStoredPrefs()
    const detected = detectPreferences()
    const prefs: A11yPrefs = {
      highContrast:   stored.highContrast   ?? detected.prefersContrast,
      textScale:      stored.textScale      ?? 100,
      reducedMotion:  stored.reducedMotion  ?? detected.prefersReducedMotion,
      vibrateOnly:    stored.vibrateOnly    ?? false,
      narratorMuted:  stored.narratorMuted  ?? false
    }
    // vibrateOnly implica narrador silenciado
    if (prefs.vibrateOnly) prefs.narratorMuted = true
    set({ a11yPrefs: prefs })
  }
}))
