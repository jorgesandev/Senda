'use client'

import { RefreshCw } from 'lucide-react'

export function LiveRerouteToast({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <div
      className="absolute left-3 right-3 top-[302px] z-30 flex items-center gap-3 rounded-md bg-white p-3 text-text shadow-panel md:left-auto md:right-4 md:top-4 md:max-w-sm"
      role="status"
      aria-live="assertive"
      aria-atomic="true"
    >
      <RefreshCw aria-hidden="true" size={20} className="animate-spin text-brand" />
      <div>
        <p className="font-semibold text-brand">Nueva barrera detectada</p>
        <p className="text-sm text-muted">Recalculando ruta alternativa…</p>
      </div>
    </div>
  )
}
