import Link from 'next/link'
import { Plus } from 'lucide-react'

export function Fab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="absolute bottom-24 right-4 inline-flex h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-brand px-4 font-bold text-white shadow-[0_10px_28px_rgba(37,99,235,0.38)] md:bottom-4"
      aria-label={label}
    >
      <Plus aria-hidden="true" size={24} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  )
}
