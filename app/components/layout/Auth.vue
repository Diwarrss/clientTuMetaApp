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
    <div class="mx-auto flex-1 lg:p-8">
      <slot />
    </div>
  </div>
</template>

<style scoped>

</style>
