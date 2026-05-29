'use client'

import { Camera } from 'lucide-react'

export function CameraCapture({ onImage }: { onImage: (file: File | null) => void }) {
  return (
    <label className="grid gap-2 font-semibold">
      Foto
      <span className="flex min-h-12 items-center gap-2 rounded-md border border-slate-300 bg-white px-3">
        <Camera aria-hidden="true" size={20} className="text-muted" />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="min-h-12 flex-1 text-sm"
          onChange={(event) => onImage(event.target.files?.[0] ?? null)}
        />
      </span>
    </label>
  )
}
