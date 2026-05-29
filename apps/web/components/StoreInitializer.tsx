'use client'

import { useEffect } from 'react'
import { useSendaStore } from '@/lib/store'

export function StoreInitializer() {
  const subscribeToFeatureStream = useSendaStore((s) => s.subscribeToFeatureStream)

  useEffect(() => {
    const cleanup = subscribeToFeatureStream()
    return cleanup
  }, [subscribeToFeatureStream])

  return null
}
