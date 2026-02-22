<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:8686'

const siteUrl = 'https://tumeta.app'
const whatsappNumber = '573132458975'
const contactPhone = '313 245 8975'

useHead({
  title: 'Tu Meta · Plataforma de inscripciones para carreras y eventos deportivos',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'robots', content: 'index, follow' },
  ],
  link: [
    { rel: 'canonical', href: siteUrl },
  ],
})
useSeoMeta({
  title: 'Tu Meta · Plataforma de inscripciones para carreras y eventos deportivos',
  description: 'Plataforma de inscripciones para carreras, maratones y retos deportivos. Sin costos fijos: solo 7% de comisión por inscripción. Gestiona categorías, pagos y participantes en un solo lugar.',
  ogTitle: 'Tu Meta · Inscripciones para eventos deportivos',
  ogDescription: 'Plataforma de inscripciones para carreras y maratones. 7% de comisión. Sin cuotas mensuales. Contacto: 313 245 8975.',
  ogType: 'website',
  ogUrl: siteUrl,
  ogImage: `${siteUrl}/images/hero-b2b.webp`,
  ogLocale: 'es_CO',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Tu Meta · Inscripciones para eventos deportivos',
  twitterDescription: 'Plataforma de inscripciones para carreras y maratones. 7% de comisión. Sin cuotas mensuales.',
})

// Fetch eventos activos para la sección de eventos destacados
// server: false evita hydration mismatch cuando la API no es accesible desde el servidor
const { data: eventsData } = await useFetch<{
  data: Array<{
    id: number
    name: string
    slug: string
    event_date: string
    precio_base: number
    hero_image_url?: string | null
    location_city?: string | null
    location_region?: string | null
    location_country?: string | null
  }>
}>(
  `${apiBase}/api/events`,
  { credentials: 'include', server: false }
)
const events = computed(() => eventsData.value?.data ?? [])

function scrollToEventos() {
  if (import.meta.server) return
  nextTick(() => {
    const el = document.getElementById('eventos')
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: 'smooth' })
    }
  })
}

function formatLocation(ev: { location_city?: string | null; location_region?: string | null; location_country?: string | null }) {
  const parts = [ev.location_city, ev.location_region].filter(Boolean)
  if (parts.length > 0) return parts.join(', ')
  return ev.location_country || 'Colombia'
}

const route = useRoute()
onMounted(() => {
  if (route.hash === '#eventos') {
    nextTick(() => scrollToEventos())
  }
})
watch(() => route.hash, (hash) => {
  if (hash === '#eventos') {
    nextTick(() => scrollToEventos())
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white transition-colors">
    <LandingHeader />

    <!-- Hero Section -->
    <section class="relative pt-24 sm:pt-28 pb-12 sm:pb-20 px-4 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
      <div class="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
      <div class="container relative mx-auto max-w-6xl">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="text-center lg:text-left">
            <p class="text-emerald-600 dark:text-emerald-400 font-semibold mb-3 text-sm uppercase tracking-widest">
              Plataforma de running en Colombia
            </p>
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-5 text-slate-900 dark:text-white">
              El ecosistema digital para tus
              <span class="block text-emerald-500 dark:text-emerald-400">carreras y eventos</span>
            </h1>
            <p class="text-base sm:text-lg text-slate-600 max-w-xl mb-6 sm:mb-8 dark:text-slate-400 lg:max-w-none">
              Gestiona inscripciones, categorías y pagos. Sin costos fijos: solo
              <strong class="text-emerald-600 dark:text-emerald-400">7% de comisión</strong> por inscripción.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <button
                type="button"
                class="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-3 sm:px-6 sm:py-3.5 text-sm sm:text-base font-semibold text-slate-700 shadow-sm hover:border-emerald-400 hover:bg-slate-50 dark:border-white/20 dark:bg-white/5 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:bg-white/10 transition-all"
                @click="scrollToEventos"
              >
                <Icon name="i-lucide-calendar-search" class="size-5" />
                Ver eventos
              </button>
              <NuxtLink
                to="/login"
                class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 sm:px-6 sm:py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all hover:scale-[1.02]"
              >
                Organizar evento
                <Icon name="i-lucide-arrow-right" class="size-5" />
              </NuxtLink>
            </div>
          </div>
          <!-- Visual profesional: dashboard mockup abstracto -->
          <div class="relative hidden lg:flex items-center justify-center">
            <div class="relative w-full max-w-md">
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-800/50">
                <div class="flex items-center gap-2 mb-6">
                  <div class="size-3 rounded-full bg-emerald-500" />
                  <div class="size-3 rounded-full bg-emerald-400/60" />
                  <div class="size-3 rounded-full bg-emerald-300/40" />
                </div>
                <div class="space-y-4">
                  <div class="h-3 rounded bg-slate-200 dark:bg-slate-600 w-3/4" />
                  <div class="grid grid-cols-3 gap-3">
                    <div class="h-16 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                      <Icon name="i-lucide-users" class="size-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div class="h-16 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                      <Icon name="i-lucide-calendar-check" class="size-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div class="h-16 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                      <Icon name="i-lucide-trending-up" class="size-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div class="h-2 rounded bg-slate-100 dark:bg-slate-700 w-full" />
                  <div class="h-2 rounded bg-slate-100 dark:bg-slate-700 w-5/6" />
                  <div class="h-2 rounded bg-slate-100 dark:bg-slate-700 w-4/6" />
                </div>
              </div>
              <div class="absolute -right-4 -bottom-4 size-24 rounded-2xl bg-emerald-500/20 dark:bg-emerald-500/30 -z-10" />
              <div class="absolute -left-4 -top-4 size-32 rounded-full bg-slate-200/50 dark:bg-slate-700/30 -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits for organizers -->
    <section class="py-10 sm:py-16 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-10 text-slate-900 dark:text-white">
          Beneficios para organizadores
        </h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-400 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm dark:hover:border-emerald-500/30 transition-colors">
            <div class="mb-4 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 p-3 w-fit">
              <Icon name="i-lucide-percent" class="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Comisión por inscripción</h3>
            <p class="text-slate-600 text-sm dark:text-slate-400">
              Solo pagas un <strong class="text-slate-900 dark:text-white">7%</strong> del valor de cada inscripción. Sin suscripciones ni costos fijos. Pagas cuando vendes.
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-400 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm dark:hover:border-emerald-500/30 transition-colors">
            <div class="mb-4 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 p-3 w-fit">
              <Icon name="i-lucide-credit-card" class="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Pagos fáciles</h3>
            <p class="text-slate-600 text-sm dark:text-slate-400">
              Recibir pagos es sencillo. Los atletas suben su comprobante y tú apruebas desde el panel.
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-400 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm dark:hover:border-emerald-500/30 transition-colors">
            <div class="mb-4 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 p-3 w-fit">
              <Icon name="i-lucide-users" class="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Categorización automática</h3>
            <p class="text-slate-600 text-sm dark:text-slate-400">
              Define categorías por edad. El sistema asigna automáticamente según la fecha de nacimiento.
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-400 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm dark:hover:border-emerald-500/30 transition-colors">
            <div class="mb-4 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 p-3 w-fit">
              <Icon name="i-lucide-bar-chart-3" class="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Dashboard inteligente</h3>
            <p class="text-slate-600 text-sm dark:text-slate-400">
              Visualiza inscripciones, estados y métricas en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits for runners -->
    <section class="py-10 sm:py-16 px-4 bg-slate-100 dark:bg-slate-900">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-10 text-slate-900 dark:text-white">
          Beneficios para corredores
        </h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div class="flex flex-col items-center text-center p-6 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 shadow-sm dark:shadow-none">
            <div class="mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 p-4">
              <Icon name="i-lucide-file-check" class="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Inscripción sencilla</h3>
            <p class="text-slate-600 dark:text-slate-300 text-sm">
              Regístrate rápido con Google o como invitado. Verifica tu inscripción con tu documento.
            </p>
          </div>
          <div class="flex flex-col items-center text-center p-6 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 shadow-sm dark:shadow-none">
            <div class="mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 p-4">
              <Icon name="i-lucide-shield-check" class="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Pago seguro</h3>
            <p class="text-slate-600 dark:text-slate-300 text-sm">
              Sube tu comprobante y recibe confirmación por correo. Estado de inscripción en tiempo real.
            </p>
          </div>
          <div class="flex flex-col items-center text-center p-6 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 shadow-sm dark:shadow-none">
            <div class="mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 p-4">
              <Icon name="i-lucide-calendar" class="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Eventos cerca de ti</h3>
            <p class="text-slate-600 dark:text-slate-300 text-sm">
              Descubre carreras, maratones y retos en Colombia. Filtra por fecha y ubicación.
            </p>
          </div>
          <div class="flex flex-col items-center text-center p-6 rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5 shadow-sm dark:shadow-none">
            <div class="mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 p-4">
              <Icon name="i-lucide-search" class="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Verifica tu inscripción</h3>
            <p class="text-slate-600 dark:text-slate-300 text-sm">
              Ingresa tu documento en la página del evento y consulta el estado al instante.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Eventos destacados -->
    <section id="eventos" class="scroll-mt-20 sm:scroll-mt-24 py-10 sm:py-16 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-10 text-slate-900 dark:text-white">
          Próximos eventos
        </h2>
        <div v-if="events.length === 0" class="rounded-2xl border border-dashed border-slate-300 dark:border-white/20 py-16 text-center text-slate-500 dark:text-slate-400">
          <Icon name="i-lucide-calendar-x" class="size-12 mx-auto mb-4 opacity-50" />
          <p class="font-medium">Próximamente habrá eventos disponibles.</p>
          <p class="text-sm mt-1">Mientras tanto, <NuxtLink to="/login" class="text-emerald-600 dark:text-emerald-400 hover:underline">organiza el tuyo</NuxtLink>.</p>
        </div>
        <div v-else class="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="ev in events.slice(0, 6)"
            :key="ev.id"
            :to="`/${ev.slug}`"
            class="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-emerald-400 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-500/30 transition-all"
          >
            <div class="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-600 dark:to-emerald-800">
              <div class="absolute inset-0 flex items-center justify-center">
                <Icon name="i-lucide-calendar" class="size-16 text-white/40" />
              </div>
              <img
                v-if="ev.hero_image_url"
                :src="ev.hero_image_url"
                :alt="ev.name"
                loading="lazy"
                class="absolute inset-0 size-full object-cover transition group-hover:scale-105"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
            </div>
            <div class="p-4 sm:p-5">
              <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {{ ev.name }}
              </h3>
              <div class="flex items-center gap-2 text-slate-600 text-sm mb-2 dark:text-slate-300 font-medium">
                <Icon name="i-lucide-map-pin" class="size-4 shrink-0 text-emerald-500" />
                <span>{{ formatLocation(ev) }}</span>
              </div>
              <p class="text-slate-600 text-sm mb-3 dark:text-slate-400">
                {{ new Date(ev.event_date).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
              </p>
              <div class="flex items-center justify-between">
                <span class="text-emerald-600 font-semibold dark:text-emerald-400">
                  Desde ${{ ev.precio_base.toLocaleString('es-CO') }}
                </span>
                <span class="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline">
                  Inscríbete
                  <Icon name="i-lucide-arrow-right" class="size-4" />
                </span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Precios + CTA único -->
    <section class="py-10 sm:py-16 px-4 bg-slate-100 dark:bg-slate-900">
      <div class="container mx-auto max-w-4xl">
        <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8 md:p-10 text-center dark:border-emerald-500/30 dark:bg-emerald-500/5">
          <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-slate-900 dark:text-white">
            Organiza tu carrera sin complicaciones
          </h2>
          <p class="text-slate-600 mb-6 max-w-xl mx-auto dark:text-slate-400">
            Sin cuotas mensuales. Sin costos ocultos. Solo 7% de comisión por inscripción.
          </p>
          <div class="inline-flex flex-wrap items-baseline justify-center gap-2 rounded-xl bg-emerald-100 px-4 sm:px-6 py-3 mb-6 dark:bg-emerald-500/20">
            <span class="text-4xl font-bold text-emerald-600 dark:text-emerald-400">7%</span>
            <span class="text-slate-600 dark:text-slate-300">de comisión por cada inscripción</span>
          </div>
          <p class="text-slate-500 text-sm mb-8 dark:text-slate-500">
            Ejemplo: inscripción de $50.000 → tu comisión es $3.500
          </p>
          <NuxtLink
            to="/login"
            class="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 sm:px-10 sm:py-4 text-base sm:text-lg font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all hover:scale-[1.02]"
          >
            Empieza gratis
            <Icon name="i-lucide-arrow-right" class="size-5" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-200 py-8 sm:py-12 px-4 dark:border-white/10">
      <div class="container mx-auto max-w-6xl">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <NuxtLink to="/" class="flex items-center gap-1.5 font-bold text-xl tracking-tight">
            <span>Tu</span>
            <span class="text-emerald-500 dark:text-emerald-400">Meta</span>
            <span class="text-slate-400 text-sm font-normal">.app</span>
          </NuxtLink>
          <p class="text-slate-500 text-sm text-center md:text-left max-w-md dark:text-slate-400">
            Plataforma de inscripciones para carreras y eventos deportivos en Colombia.
          </p>
          <div class="flex items-center gap-4">
            <a
              :href="`https://wa.me/${whatsappNumber}`"
              target="_blank"
              rel="noopener"
              class="text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              aria-label="WhatsApp"
            >
              <Icon name="i-lucide-message-circle" class="size-5" />
            </a>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-slate-200 dark:border-white/10 text-center text-slate-500 text-sm dark:text-slate-500">
          <p>© {{ new Date().getFullYear() }} Tu Meta. Todos los derechos reservados.</p>
          <p class="mt-1">
            Contacto: <a :href="`https://wa.me/${whatsappNumber}`" class="text-emerald-600 dark:text-emerald-400 hover:underline">{{ contactPhone }}</a>
          </p>
        </div>
      </div>
    </footer>

    <!-- Botón WhatsApp flotante -->
    <a
      :href="`https://wa.me/${whatsappNumber}`"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex size-12 sm:size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110 hover:shadow-xl"
    >
      <svg class="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.462 4.448-9.908 9.909-9.908 2.658 0 5.161 1.032 7.046 2.898 1.884 1.884 2.898 4.388 2.898 7.043-.001 5.462-4.447 9.908-9.908 9.908m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  </div>
</template>
