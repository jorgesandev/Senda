import Link from 'next/link'
import { Plus } from 'lucide-react'

export function Fab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="absolute bottom-4 right-4 inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-brand px-4 font-bold text-white shadow-panel"
      aria-label={label}
    >
      <Plus aria-hidden="true" size={24} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )
}
