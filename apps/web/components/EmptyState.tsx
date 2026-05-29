import { Inbox } from 'lucide-react'

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
      <Inbox aria-hidden="true" size={30} className="mx-auto text-muted" />
      <h2 className="mt-3 text-xl font-bold">{title}</h2>
      <p className="mt-1 text-muted">{detail}</p>
    </div>
  )
}
