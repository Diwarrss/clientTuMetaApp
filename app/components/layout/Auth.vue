<script setup lang="ts">
defineProps<{
  reverse?: boolean
}>()
</script>

<template>
  <div
    class="relative flex items-center justify-center px-4 h-dvh lg:max-w-none lg:px-0"
    :class="{ 'flex-row-reverse': reverse }"
  >
    <div class="relative hidden h-full flex-1 flex-col overflow-hidden rounded-r-2xl bg-muted p-10 text-white lg:flex dark:border-r">
      <img
        src="/images/hero-b2c.webp"
        alt="Eventos deportivos"
        class="absolute inset-0 h-full w-full rounded-r-2xl object-cover object-center"
      />
      <div class="absolute inset-0 rounded-r-2xl bg-slate-900/50" aria-hidden="true" />
      <div class="relative z-20 mt-auto">
        <blockquote class="space-y-2">
          <p class="text-lg font-medium">
            Organiza tus carreras y eventos deportivos. Gestiona inscripciones, cobros y participantes en un solo lugar.
          </p>
          <footer class="text-sm text-slate-300">
            Tu Meta — Plataforma para organizadores
          </footer>
        </blockquote>
      </div>
    </div>
    <div class="relative mx-auto flex-1 lg:p-8">
      <slot />
      <NuxtLink
        to="/"
        class="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 hover:bg-emerald-600 hover:shadow-xl dark:shadow-emerald-900/40"
      >
        <Icon name="i-lucide-home" class="size-5" />
        Inicio
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>

</style>
