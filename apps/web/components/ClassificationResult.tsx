import { Sparkles } from 'lucide-react'

export function ClassificationResult({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-text" role="status">
      <p className="flex items-center gap-2 font-semibold">
        <Sparkles aria-hidden="true" size={18} />
        Clasificacion sugerida
      </p>
      <p className="mt-1 text-muted">{label}</p>
    </div>
  )
}
