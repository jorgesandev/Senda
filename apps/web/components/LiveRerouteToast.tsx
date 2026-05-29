import { RefreshCw } from 'lucide-react'

export function LiveRerouteToast({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <div className="absolute right-4 top-4 flex max-w-sm items-center gap-3 rounded-md bg-white p-3 text-text shadow-panel" role="status">
      <RefreshCw aria-hidden="true" size={20} className="text-brand" />
      <span className="font-semibold">Ruta reflow mock por capa viva.</span>
    </div>
  )
}
