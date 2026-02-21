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
    event_date: string
    bank_name: string | null
    bank_account: string | null
    precio_base: number
    hero_image_url: string | null
    categories: Array<{
      id: number
      name: string
      edad_min: number | null
      edad_max: number | null
    }>
  }
}>(
  () => `${apiBase}/api/events/${slug.value}`,
  { credentials: 'include' }
)

const event = computed(() => eventData.value?.data ?? null)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
    <header class="border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <NuxtLink to="/" class="flex items-center gap-1.5 font-bold text-xl">
          <span>Tu</span>
          <span class="text-emerald-400">Meta</span>
          <span class="text-slate-500 text-sm font-normal">.app</span>
        </NuxtLink>
        <nav class="flex items-center gap-4">
          <NuxtLink to="/" class="text-sm text-slate-400 hover:text-white">
            Inicio
          </NuxtLink>
          <NuxtLink to="/login" class="text-sm text-slate-400 hover:text-white">
            Iniciar sesión
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="container mx-auto px-4 py-12 max-w-4xl">
      <div v-if="pending" class="flex justify-center py-20">
        <Icon name="i-lucide-loader-2" class="size-12 animate-spin text-emerald-400" />
      </div>

      <div v-else-if="error || !event" class="text-center py-20">
        <Icon name="i-lucide-alert-circle" class="size-16 text-amber-500 mx-auto mb-4" />
        <h2 class="text-xl font-semibold mb-2">Evento no encontrado</h2>
        <p class="text-slate-400 mb-6">Este evento no existe o no está disponible.</p>
        <NuxtLink to="/" class="text-emerald-400 hover:underline">
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
          <p v-if="event.description" class="text-slate-300 whitespace-pre-wrap">
            {{ event.description }}
          </p>
        </div>

        <div v-if="event.bank_name || event.bank_account" class="rounded-xl border border-white/10 bg-white/5 p-6 mb-12">
          <h3 class="font-semibold mb-2 flex items-center gap-2">
            <Icon name="i-lucide-credit-card" class="size-4" />
            Información de pago
          </h3>
          <p v-if="event.bank_name" class="text-slate-300">Banco: {{ event.bank_name }}</p>
          <p v-if="event.bank_account" class="text-slate-300">Cuenta: {{ event.bank_account }}</p>
          <p class="text-emerald-400 font-semibold mt-2">
            Valor: ${{ event.precio_base.toLocaleString('es-CO') }}
          </p>
        </div>

        <div class="rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 class="text-xl font-semibold mb-6">Inscripción</h2>
          <RegistrationForm
            :event-id="event.id"
            :categories="event.categories"
            :precio-base="event.precio_base"
          />
        </div>
      </template>
    </main>
  </div>
</template>
