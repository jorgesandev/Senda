import Link from 'next/link'
import {
  ArrowRight,
  Eye,
  Map,
  Mic,
  Shield,
  Smartphone,
  Users,
  Vibrate,
  Waves,
  Zap,
} from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { ProfileSelector } from '@/components/ProfileSelector'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <AppHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-20">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Senda Tijuana
            </p>
            <h1 className="max-w-xl text-4xl font-bold leading-tight md:text-5xl">
              Rutas peatonales accesibles con perfil combinado.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              Senda es una app map-first que calcula la mejor ruta peatonal segun{' '}
              <strong>tus necesidades funcionales</strong>, no tu diagnostico. Silla de
              ruedas, ceguera, movilidad reducida: combinamos perfiles con la regla del
              peor caso para que cada tramo sea seguro.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/map" className="btn-primary" aria-label="Ir al mapa">
                Ir al mapa
                <ArrowRight aria-hidden="true" size={20} />
              </Link>
              <a
                href="https://github.com/jorgesandev/Senda"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                aria-label="Ver repositorio en GitHub"
              >
                Ver en GitHub
              </a>
            </div>
          </div>
          <ProfileSelector />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-3 md:px-8">
          {[
            { value: '6', label: 'Perfiles funcionales', icon: Users },
            { value: 'P0', label: 'MVP ganador asegurado', icon: Shield },
            { value: '100%', label: 'Operable sin ver la pantalla', icon: Eye },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-brand/10 text-brand">
                <s.icon aria-hidden="true" size={24} />
              </span>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* El problema */}
      <section className="mx-auto max-w-5xl space-y-6 px-4 py-12 md:px-8 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
          El problema
        </p>
        <h2 className="max-w-2xl text-3xl font-bold leading-tight">
          Tijuana no esta disenada para todas las personas.
        </h2>
        <p className="max-w-3xl text-lg leading-8 text-muted">
          Banquetas rotas, escalones sin rampas, cruces sin podotactil ni audio. Para
          alguien en silla de ruedas, un tramo roto es un callejon sin salida. Para una
          persona ciega, la ausencia de guia podotactil convierte una cuadra en un
          laberinto. Los ruteadores tradicionales ignoran estas condiciones. Senda las
          enfrenta con datos vivos de la comunidad.
        </p>
      </section>

      {/* Quienes somos */}
      <section className="border-t border-slate-200 bg-surface">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-12 md:px-8 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Quienes somos
          </p>
          <h2 className="max-w-2xl text-3xl font-bold leading-tight">
            Construido por el equipo Entropyc para HackFox 2026.
          </h2>
          <p className="max-w-3xl text-lg leading-8 text-muted">
            Track{' '}
            <strong className="text-text">Tijuana Sin Barreras</strong>. Somos dos
            personas combinando desarrollo de software e investigacion de campo para
            resolver un problema real que afecta todos los dias a miles de tijuanenses.
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel md:max-w-sm">
              <p className="font-semibold">Jorge Sandoval</p>
              <p className="text-sm text-muted">Desarrollo full-stack</p>
              <a
                href="https://jorgesandoval.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand underline"
              >
                jorgesandoval.dev
              </a>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel md:max-w-sm">
              <p className="font-semibold">Bernardo Morales</p>
              <p className="text-sm text-muted">Co-ideacion e investigacion de campo</p>
              <a
                href="https://bernardmora.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-brand underline"
              >
                bernardmora.github.io
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* TIPO vs EFECTO */}
      <section className="mx-auto max-w-5xl space-y-6 px-4 py-12 md:px-8 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
          El principio
        </p>
        <h2 className="max-w-2xl text-3xl font-bold leading-tight">
          Separamos el TIPO del EFECTO.
        </h2>
        <p className="max-w-3xl text-lg leading-8 text-muted">
          Una barrera tiene atributos fisicos objetivos (superficie rota, rampa faltante,
          escalon). Un perfil funcional define sensibilidades (silla de ruedas, ceguera,
          movilidad reducida). El motor de ruteo evalua cada segmento como{' '}
          <strong className="text-text">funcion de (perfil x barrera)</strong>. Nunca
          escribimos <code className="rounded bg-surface px-1 py-0.5 text-sm">if profile == &quot;WHEELCHAIR&quot;</code>:
          agregar un perfil es una columna, agregar un tipo de barrera es un renglon.
        </p>
      </section>

      {/* Diferenciadores */}
      <section className="border-t border-slate-200 bg-surface">
        <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 md:px-8 md:py-20">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Diferenciadores
            </p>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight">
              Accesibilidad total: se opera sin ver y sin tocar.
            </h2>
            <p className="max-w-3xl text-lg leading-8 text-muted">
              Los demas equipos haran un ruteador para silla de ruedas que una persona
              ciega no puede ni abrir. Senda se construye para cada persona.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                icon: Mic,
                title: 'Control por voz',
                desc: 'Comandos en espanol para planear rutas, reportar barreras y navegar sin usar las manos ni los ojos.',
              },
              {
                icon: Waves,
                title: 'Narrador TTS',
                desc: 'SpeechSynthesis lee toda la interfaz y las indicaciones paso a paso. Boton "Leer ruta" siempre a la mano.',
              },
              {
                icon: Vibrate,
                title: 'Haptica de precaucion',
                desc: 'Vibracion intermitente al acercarse a una barrera, pulso largo al detectar bloqueo. Sirve a sordera, ceguera y parkinson.',
              },
              {
                icon: Eye,
                title: 'Auto-preferencias',
                desc: 'Detecta alto contraste, reduced-motion y lector de pantalla. Se adapta automaticamente sin configuracion manual.',
              },
              {
                icon: Smartphone,
                title: 'Operable sin pantalla',
                desc: 'Ojos cerrados. Solo voz, vibracion y TTS. El juez lo prueba en vivo.',
              },
              {
                icon: Zap,
                title: 'Citizen Loop en vivo',
                desc: 'Un reporte ciudadano recalcula las rutas activas al instante. El mapa se cura a si mismo.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-panel"
              >
                <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                  <f.icon aria-hidden="true" size={22} />
                </span>
                <div className="space-y-1">
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matriz de impacto */}
      <section className="mx-auto max-w-5xl space-y-6 px-4 py-12 md:px-8 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
          Matriz de impacto
        </p>
        <h2 className="max-w-2xl text-3xl font-bold leading-tight">
          Configuracion, no codigo.
        </h2>
        <p className="max-w-3xl text-lg leading-8 text-muted">
          Para cada barrera, definimos si <strong className="text-sevHigh">bloquea (B)</strong>,{' '}
          <strong className="text-sevMed">dificulta (D)</strong>,{' '}
          <strong className="text-sevLow">molesta levemente (L)</strong> o es neutra, por
          perfil. Bloqueos se traducen a evitacion inmediata en el motor Valhalla. Cada
          ruta se calcula con el <strong className="text-text">peor caso</strong> entre
          los perfiles seleccionados.
        </p>
        <Link href="/map" className="btn-primary" aria-label="Probar el mapa">
          Probar el mapa
          <ArrowRight aria-hidden="true" size={20} />
        </Link>
      </section>

      {/* Flujo */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 md:px-8 md:py-20">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Como funciona
            </p>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight">
              Del reporte ciudadano al re-ruteo inmediato.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Eliges tus perfiles',
                desc: 'Selecciona uno o varios perfiles funcionales. La ruta se adapta con la regla del peor caso.',
              },
              {
                step: '02',
                title: 'Senda calcula la ruta',
                desc: 'El motor consulta Valhalla con las barreras activas como exclusiones. Recibes distancia, ETA y pasos.',
              },
              {
                step: '03',
                title: 'La comunidad reporta',
                desc: 'Cualquier persona reporta una barrera con foto. Si esta en tu ruta, Senda recalcula al instante.',
              },
            ].map((f) => (
              <div
                key={f.step}
                className="rounded-lg border border-slate-200 p-5 shadow-panel"
              >
                <p className="text-3xl font-bold text-brand/30">{f.step}</p>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reportes: tres destinos */}
      <section className="bg-surface">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 md:px-8 md:py-20">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Impacto
            </p>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight">
              Un reporte tiene tres destinos.
            </h2>
            <p className="max-w-3xl text-lg leading-8 text-muted">
              La misma informacion sirve a tres audiencias: la comunidad evade la barrera
              al instante, el gobierno recibe un mapa de priorizacion, y los negocios
              obtienen una insignia de accesibilidad verificada.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Comunidad (inmediato)',
                desc: 'Valhalla esquiva la barrera al instante. Ciudadano a ciudadano.',
              },
              {
                title: 'Gobierno (agregado)',
                desc: 'Mapa de calor y tablero de priorizacion: que reparacion desbloquea mas trayectos.',
              },
              {
                title: 'Negocios (stretch)',
                desc: 'Insignia "Accesible Verificado". Inclusion es buen negocio.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel"
              >
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 md:px-8 md:py-20">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Stack
            </p>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight">
              Tecnologia abierta, sin lock-in.
            </h2>
          </div>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            {[
              ['Frontend', 'Next.js 14, TypeScript, Tailwind, Zustand, Google Maps JS'],
              ['Accesibilidad', 'Web Speech API, speechSynthesis, Vibration API, ARIA'],
              ['Backend', 'FastAPI, pydantic v2, Python 3.12'],
              ['Ruteo', 'Valhalla 3.5.1 con OpenStreetMap Tijuana'],
              ['Datos', 'Firestore (capa viva) + in-memory store'],
              ['Deploy', 'Cloud Run (API + Valhalla), Vercel (web)'],
            ].map(([label, desc]) => (
              <div key={label} className="flex flex-col gap-1 rounded-lg border border-slate-200 p-4">
                <p className="font-semibold">{label}</p>
                <p className="text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-surface">
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-12 md:px-8 md:py-20">
          <h2 className="max-w-2xl text-3xl font-bold leading-tight">
            Tijuana sin barreras empieza aqui.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-muted">
            Codigo abierto bajo licencia MIT. Construido por y para la comunidad.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/map" className="btn-primary" aria-label="Abrir el mapa">
              Abrir el mapa
              <ArrowRight aria-hidden="true" size={20} />
            </Link>
            <a
              href="https://github.com/jorgesandev/Senda"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              aria-label="Ver repositorio en GitHub"
            >
              Ver en GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted md:px-8">
          <p>Senda — Equipo Entropyc, HackFox 2026.</p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/jorgesandev/Senda"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              GitHub
            </a>
            <Link href="/map" className="underline">
              Mapa
            </Link>
            <Link href="/report" className="underline">
              Reportar
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
