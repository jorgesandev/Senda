import { LoaderCircle } from 'lucide-react'

export function LoadingState({ label = 'Cargando' }: { label?: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-3 rounded-md bg-surface p-4 text-muted" role="status">
      <LoaderCircle aria-hidden="true" size={22} className="animate-spin" />
      {label}
    </div>
  )
}
