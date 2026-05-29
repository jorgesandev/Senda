import { AppHeader } from '@/components/AppHeader'
import { ExportButton } from '@/components/ExportButton'
import { GovHeatmap } from '@/components/GovHeatmap'
import { PrioritizationTable } from '@/components/PrioritizationTable'

export default function GovPage() {
  return (
    <main className="min-h-screen bg-surface text-text">
      <AppHeader />
      <section className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">Gobierno</p>
            <h1 className="text-3xl font-bold">Priorizacion de reparaciones</h1>
          </div>
          <ExportButton />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1fr_520px]">
          <GovHeatmap />
          <PrioritizationTable />
        </div>
      </section>
    </main>
  )
}
