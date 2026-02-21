<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:8686'
const colorMode = useColorMode()

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

// Fetch eventos activos para la sección de eventos destacados (opcional)
const { data: eventsData } = await useFetch<{ data: Array<{ id: number; name: string; slug: string; event_date: string; precio_base: number }> }>(
  `${apiBase}/api/events`,
  { credentials: 'include' }
)
const events = computed(() => eventsData.value?.data ?? [])

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white transition-colors">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/80">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <NuxtLink to="/" class="flex items-center gap-1.5 font-bold text-xl tracking-tight">
          <span>Tu</span>
          <span class="text-emerald-500 dark:text-emerald-400">Meta</span>
          <span class="text-slate-400 text-sm font-normal">.app</span>
        </NuxtLink>
        <nav class="flex items-center gap-2 sm:gap-4">
          <!-- Toggle claro / oscuro (un solo botón, icono según tema) -->
          <button
            type="button"
            :title="colorMode.value === 'dark' ? 'Modo oscuro (clic para claro)' : 'Modo claro (clic para oscuro)'"
            class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            @click="toggleTheme()"
          >
            <Icon :name="colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'" class="size-5" />
          </button>
          <NuxtLink
            to="/login"
            class="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
          >
            Iniciar sesión
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            Organiza tu evento
          </NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-24 px-4 overflow-hidden">
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-30"
        style="background-image: url('/images/hero-b2b.webp')"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-slate-100/95 via-slate-50/90 to-slate-100 dark:from-slate-950/90 dark:via-slate-950/70 dark:to-slate-950" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]" />
      <div class="container relative mx-auto max-w-5xl text-center">
        <p class="text-emerald-600 dark:text-emerald-400 font-medium mb-4 text-sm uppercase tracking-widest">
          tumeta.app
        </p>
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Cada meta tiene
          <span class="block text-emerald-500 dark:text-emerald-400">su camino</span>
        </h1>
        <p class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 dark:text-slate-400">
          Plataforma de inscripciones para carreras, maratones y retos deportivos.
          Sin costos fijos: pagas solo un <strong class="text-emerald-600 dark:text-emerald-400">7% de comisión</strong> por cada inscripción cobrada.
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all hover:scale-105"
        >
          Organiza tu evento
          <Icon name="i-lucide-arrow-right" class="size-5" />
        </NuxtLink>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-24 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-3xl font-bold text-center mb-16 text-slate-900 dark:text-white">
          ¿Por qué elegir Tu Meta?
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div class="mb-4 rounded-xl overflow-hidden w-16 h-16">
              <img src="/images/feature-pagos.webp" alt="Pagos fáciles" class="size-full object-cover" />
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
            <div class="mb-4 rounded-xl overflow-hidden w-16 h-16">
              <img src="/images/feature-dashboard.webp" alt="Dashboard inteligente" class="size-full object-cover" />
            </div>
            <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">Dashboard inteligente</h3>
            <p class="text-slate-600 text-sm dark:text-slate-400">
              Visualiza inscripciones, estados y métricas en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Eventos destacados -->
    <section v-if="events.length > 0" class="py-16 px-4">
      <div class="container mx-auto max-w-6xl">
        <h2 class="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Próximos eventos
        </h2>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="ev in events.slice(0, 6)"
            :key="ev.id"
            :to="`/${ev.slug}`"
            class="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-emerald-400 dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-sm dark:hover:border-emerald-500/30 transition-colors"
          >
            <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">{{ ev.name }}</h3>
            <p class="text-slate-600 text-sm mb-2 dark:text-slate-400">
              {{ new Date(ev.event_date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) }}
            </p>
            <p class="text-emerald-600 font-semibold dark:text-emerald-400">
              ${{ ev.precio_base.toLocaleString('es-CO') }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Precios -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-4xl">
        <div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 md:p-12 text-center dark:border-emerald-500/30 dark:bg-emerald-500/5">
          <h2 class="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
            Precio simple y transparente
          </h2>
          <p class="text-slate-600 mb-6 max-w-xl mx-auto dark:text-slate-400">
            Sin cuotas mensuales. Sin costos ocultos. Solo pagas cuando tus atletas se inscriben.
          </p>
          <div class="inline-flex items-baseline gap-2 rounded-xl bg-emerald-100 px-6 py-3 dark:bg-emerald-500/20">
            <span class="text-4xl font-bold text-emerald-600 dark:text-emerald-400">7%</span>
            <span class="text-slate-600 dark:text-slate-300">de comisión por cada inscripción</span>
          </div>
          <p class="text-slate-500 text-sm mt-4 dark:text-slate-500">
            Ejemplo: inscripción de $50.000 → tu comisión es $3.500
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 px-4">
      <div class="container mx-auto max-w-3xl text-center">
        <h2 class="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
          ¿Listo para organizar tu próximo evento?
        </h2>
        <p class="text-slate-600 mb-8 dark:text-slate-400">
          Únete a Tu Meta y simplifica la gestión de inscripciones deportivas.
        </p>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-600 transition-colors"
        >
          Comenzar ahora
          <Icon name="i-lucide-arrow-right" class="size-5" />
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-slate-200 py-8 px-4 dark:border-white/10">
      <div class="container mx-auto flex flex-col items-center gap-3 text-center text-slate-500 text-sm dark:text-slate-500">
        <p>© {{ new Date().getFullYear() }} Tu Meta · tumeta.app · Plataforma de inscripciones deportivas.</p>
        <p>
          Contacto: <a :href="`tel:${whatsappNumber}`" class="text-emerald-600 dark:text-emerald-400 hover:underline">{{ contactPhone }}</a>
        </p>
      </div>
    </footer>

    <!-- Botón WhatsApp flotante -->
    <a
      :href="`https://wa.me/${whatsappNumber}`"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      class="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-110 hover:shadow-xl"
    >
      <svg class="size-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.462 4.448-9.908 9.909-9.908 2.658 0 5.161 1.032 7.046 2.898 1.884 1.884 2.898 4.388 2.898 7.043-.001 5.462-4.447 9.908-9.908 9.908m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </a>
  </div>
</template>
