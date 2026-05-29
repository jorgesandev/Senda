'use client'

import { useEffect } from 'react'
import { useSendaStore } from '@/lib/store'

export function StoreInitializer() {
  const subscribeToFeatureStream = useSendaStore((s) => s.subscribeToFeatureStream)
  const loadPrefsFromStorage = useSendaStore((s) => s.loadPrefsFromStorage)

  useEffect(() => {
    // Carga prefs persistidas + auto-preferencias del SO
    loadPrefsFromStorage()
    // Suscripción SSE para capa viva
    const cleanup = subscribeToFeatureStream()
    return cleanup
  }, [subscribeToFeatureStream, loadPrefsFromStorage])

  return null
}
