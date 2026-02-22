<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:8686'

const { data: eventData, error, pending } = await useFetch<{
  data: {
    id: number
    name: string
    slug: string
    description: string | null
    kit_includes: string | null
    event_date: string
    event_end_date: string | null
    inscription_deadline: string | null
    timezone: string
    location_city: string | null
    location_region: string | null
    location_country: string | null
    bank_name: string | null
    bank_account: string | null
    precio_base: number
    hero_image_url: string | null
    premiacion_image_url: string | null
    talla_camisa_image_url: string | null
    cronograma_image_url: string | null
    company: {
      id: number
      name: string
      slug: string
      website_url: string | null
      facebook_url: string | null
      instagram_url: string | null
      twitter_url: string | null
    } | null
    categories: Array<{
      id: number
      name: string
      edad_min: number | null
      edad_max: number | null
      precio: number
    }>
  }
}>(
  () => `${apiBase}/api/events/${slug.value}`,
  { credentials: 'include' }
)

const event = computed(() => eventData.value?.data ?? null)
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white transition-colors">
    <LandingHeader show-inicio />

    <main class="container mx-auto px-4 pt-20 pb-12 max-w-4xl">
      <div v-if="pending" class="flex justify-center py-20">
        <Icon name="i-lucide-loader-2" class="size-12 animate-spin text-emerald-400" />
      </div>

      <div v-else-if="error || !event" class="text-center py-20">
        <Icon name="i-lucide-alert-circle" class="size-16 text-amber-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Evento no encontrado</h2>
        <p class="text-slate-600 dark:text-slate-400 mb-6">Este evento no existe o no está disponible.</p>
        <NuxtLink to="/" class="text-emerald-600 dark:text-emerald-400 hover:underline">
          Volver al inicio
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Hero del evento (imagen del evento o por defecto) -->
        <div class="relative -mx-4 mb-12 overflow-hidden rounded-2xl aspect-video md:aspect-[21/9]">
          <img
            :src="event.hero_image_url || '/images/hero-b2c.webp'"
            :alt="event.name"
            class="absolute inset-0 size-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <h1 class="text-3xl md:text-4xl font-bold">{{ event.name }}</h1>
            <p class="text-slate-300 mt-2">
              {{ new Date(event.event_date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>
        </div>

        <div class="mb-12">
          <p v-if="event.description" class="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
            {{ event.description }}
          </p>
        </div>

        <!-- Información clave -->
        <div v-if="event.event_date || event.location_city" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div v-if="event.event_date" class="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-none">
            <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Icon name="i-lucide-calendar" class="size-5" />
              <span class="font-semibold">Fecha</span>
            </div>
            <p class="text-slate-600 dark:text-slate-300">
              Inicio: {{ new Date(event.event_date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
            </p>
            <p v-if="event.event_end_date" class="text-slate-600 dark:text-slate-300 mt-1">
              Fin: {{ new Date(event.event_end_date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
            </p>
            <p v-else-if="event.event_date" class="text-slate-600 dark:text-slate-300 mt-1">
              Fin: {{ new Date(event.event_date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
            </p>
            <p class="text-sm text-muted-foreground mt-2">{{ event.timezone || 'America/Bogota' }}</p>
          </div>
          <div v-if="event.location_city || event.location_region || event.location_country" class="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-none">
            <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
              <Icon name="i-lucide-map-pin" class="size-5" />
              <span class="font-semibold">Ubicación</span>
            </div>
            <p v-if="event.location_city" class="text-slate-600 dark:text-slate-300">{{ event.location_city }}</p>
            <p v-if="event.location_region" class="text-slate-600 dark:text-slate-300">{{ event.location_city ? `${event.location_city}, ${event.location_region}` : event.location_region }}</p>
            <p v-if="event.location_country" class="text-slate-600 dark:text-slate-300">{{ event.location_country }}</p>
          </div>
        </div>

        <div v-if="event.inscription_deadline" class="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-12 text-amber-800 text-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Inscripciones hasta: {{ new Date(event.inscription_deadline).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
        </div>

        <div v-if="event.kit_includes" class="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 mb-12 shadow-sm dark:shadow-none">
          <h3 class="font-semibold mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
            <Icon name="i-lucide-package" class="size-4" />
            El KIT incluye
          </h3>
          <p class="text-slate-600 dark:text-slate-300">{{ event.kit_includes }}</p>
        </div>

        <div v-if="event.premiacion_image_url || event.talla_camisa_image_url || event.cronograma_image_url" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div v-if="event.premiacion_image_url" class="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5">
            <p class="font-semibold p-3 text-slate-900 dark:text-white">Cuadro de premiación</p>
            <img :src="event.premiacion_image_url" alt="Premiación" class="w-full object-contain max-h-64">
          </div>
          <div v-if="event.talla_camisa_image_url" class="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5">
            <p class="font-semibold p-3 text-slate-900 dark:text-white">Tabla medidas camisetas</p>
            <img :src="event.talla_camisa_image_url" alt="Tallas" class="w-full object-contain max-h-64">
          </div>
          <div v-if="event.cronograma_image_url" class="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/5">
            <p class="font-semibold p-3 text-slate-900 dark:text-white">Cronograma inscripciones</p>
            <img :src="event.cronograma_image_url" alt="Cronograma" class="w-full object-contain max-h-64">
          </div>
        </div>

        <div v-if="event.company && (event.company.website_url || event.company.facebook_url || event.company.instagram_url || event.company.twitter_url)" class="flex flex-wrap gap-4 mb-12">
          <span class="text-sm text-muted-foreground">Organizador:</span>
          <a v-if="event.company.website_url" :href="event.company.website_url" target="_blank" rel="noopener" class="text-emerald-500 hover:underline flex items-center gap-1">
            <Icon name="i-lucide-globe" class="size-4" /> Web
          </a>
          <a v-if="event.company.facebook_url" :href="event.company.facebook_url" target="_blank" rel="noopener" class="text-emerald-500 hover:underline flex items-center gap-1">
            <Icon name="i-lucide-facebook" class="size-4" /> Facebook
          </a>
          <a v-if="event.company.instagram_url" :href="event.company.instagram_url" target="_blank" rel="noopener" class="text-emerald-500 hover:underline flex items-center gap-1">
            <Icon name="i-lucide-instagram" class="size-4" /> Instagram
          </a>
          <a v-if="event.company.twitter_url" :href="event.company.twitter_url" target="_blank" rel="noopener" class="text-emerald-500 hover:underline flex items-center gap-1">
            <Icon name="i-lucide-twitter" class="size-4" /> Twitter
          </a>
        </div>

        <div v-if="event.bank_name || event.bank_account" class="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 mb-12 shadow-sm dark:shadow-none">
          <h3 class="font-semibold mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
            <Icon name="i-lucide-credit-card" class="size-4" />
            Información de pago
          </h3>
          <p v-if="event.bank_name" class="text-slate-600 dark:text-slate-300">Banco: {{ event.bank_name }}</p>
          <p v-if="event.bank_account" class="text-slate-600 dark:text-slate-300">Cuenta: {{ event.bank_account }}</p>
          <p class="text-slate-600 dark:text-slate-300 mt-2">
            Valor según categoría (verás el precio al seleccionar fecha de nacimiento en el formulario)
          </p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <h2 class="text-xl font-semibold mb-6 text-slate-900 dark:text-white">Inscripción</h2>
          <RegistrationForm
            :event-id="event.id"
            :categories="event.categories"
            :precio-base="event.precio_base"
            :inscription-deadline="event.inscription_deadline"
          />
        </div>
      </template>
    </main>
  </div>
</template>
