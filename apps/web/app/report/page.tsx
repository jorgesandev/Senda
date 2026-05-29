import { AppHeader } from '@/components/AppHeader'
import { KindSelector } from '@/components/KindSelector'
import { ReportSheet } from '@/components/ReportSheet'

export default function ReportPage() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />
      <section className="mx-auto grid max-w-5xl gap-5 px-4 py-6 md:grid-cols-[320px_minmax(0,1fr)] md:px-8">
        <KindSelector />
        <ReportSheet />
      </section>
    </main>
  )
}
