import { MapPin } from 'lucide-react'

export function LocationInput({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="grid gap-2 font-semibold">
      {label}
      <span className="flex min-h-12 items-center gap-2 rounded-md border border-slate-300 bg-white px-3">
        <MapPin aria-hidden="true" size={20} className="text-muted" />
        <input
          className="min-h-12 flex-1 bg-transparent text-base outline-none"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  )
}
