<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const route = useRoute()
const token = computed(() => (route.query.token as string) || '')

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:8686'

const { data, error, pending } = await useFetch<{
  data: {
    event: { name: string; slug: string; event_date: string }
    category: string
    participant: string
    estado: string
    estado_label: string
  }
}>(
  () => (token.value ? `${apiBase}/api/registrations/verify/${token.value}` : null),
  { credentials: 'include' }
)

const registration = computed(() => data.value?.data ?? null)
</script>

<template>
  <div class="min-h-screen bg-slate-100 text-slate-900 dark:bg-gradient-to-b dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-white transition-colors">
    <LandingHeader show-inicio />

    <main class="container mx-auto px-4 pt-20 pb-12 max-w-xl">
      <h1 class="text-2xl font-bold mb-8 text-slate-900 dark:text-white">
        Verificar inscripción
      </h1>

      <div v-if="!token" class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6">
        <p class="text-amber-200">
          Ingresa el enlace de verificación que recibiste por correo. Si no lo tienes, revisa tu bandeja de entrada o spam.
        </p>
      </div>

      <div v-else-if="pending" class="flex justify-center py-12">
        <Icon name="i-lucide-loader-2" class="size-12 animate-spin text-emerald-400" />
      </div>

      <div v-else-if="error || !registration" class="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
        <Icon name="i-lucide-alert-circle" class="size-12 text-red-400 mb-4" />
        <p class="text-red-200">
          Inscripción no encontrada o enlace inválido.
        </p>
      </div>

      <div v-else class="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm space-y-4">
        <div>
          <p class="text-sm text-muted-foreground">Evento</p>
          <p class="font-semibold text-lg">{{ registration.event.name }}</p>
          <p class="text-sm text-muted-foreground">
            {{ new Date(registration.event.event_date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Participante</p>
          <p class="font-medium">{{ registration.participant }}</p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Categoría</p>
          <p class="font-medium">{{ registration.category }}</p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground">Estado</p>
          <Badge
            :variant="registration.estado === 'approved' ? 'default' : registration.estado === 'rejected' ? 'destructive' : 'secondary'"
          >
            {{ registration.estado_label }}
          </Badge>
        </div>
        <NuxtLink
          :to="`/${registration.event.slug}`"
          class="inline-flex items-center gap-2 text-emerald-500 hover:underline"
        >
          Ver evento
          <Icon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
      </div>
    </main>
  </div>
</template>
