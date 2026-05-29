'use client'

import { create } from 'zustand'
import { MOCK_FEATURES, requestRoute } from './api'
import type { A11yPrefs, MapFeature, Profile, RouteResponse, Situational } from './types'

interface SendaState {
  profiles: Profile[]
  situational: Situational[]
  activeRoute: RouteResponse | null
  liveFeatures: MapFeature[]
  a11yPrefs: A11yPrefs
  toggleProfile: (profile: Profile) => void
  toggleSituational: (situational: Situational) => void
  planRoute: (origin: string, destination: string) => Promise<void>
  setActiveRoute: (route: RouteResponse | null) => void
  addLiveFeature: (feature: MapFeature) => void
  setHighContrast: (enabled: boolean) => void
  setTextScale: (scale: A11yPrefs['textScale']) => void
}

export const useSendaStore = create<SendaState>((set, get) => ({
  profiles: ['WHEELCHAIR'],
  situational: [],
  activeRoute: null,
  liveFeatures: MOCK_FEATURES,
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
    set({ activeRoute: route })
  },
  setActiveRoute: (route) => set({ activeRoute: route }),
  addLiveFeature: (feature) => set((state) => ({ liveFeatures: [feature, ...state.liveFeatures] })),
  setHighContrast: (enabled) =>
    set((state) => ({
      a11yPrefs: { ...state.a11yPrefs, highContrast: enabled }
    })),
  setTextScale: (scale) =>
    set((state) => ({
      a11yPrefs: { ...state.a11yPrefs, textScale: scale }
    }))
}))

function normalizeLocation(value: string, fallback: { lat: number; lng: number }) {
  const normalized = value.trim()
  if (!normalized || normalized.toLowerCase() === 'mi ubicacion' || normalized.toLowerCase() === 'mi ubicación') {
    return fallback
  }
  return normalized
}
