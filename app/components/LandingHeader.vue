<script setup lang="ts">
const colorMode = useColorMode()

defineProps<{
  /** Mostrar enlace "Inicio" (para página de evento) */
  showInicio?: boolean
}>()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/80">
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
      <NuxtLink to="/" class="flex items-center gap-1.5 font-bold text-xl tracking-tight">
        <span>Tu</span>
        <span class="text-emerald-500 dark:text-emerald-400">Meta</span>
        <span class="text-slate-400 text-sm font-normal">.app</span>
      </NuxtLink>
      <nav class="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          :title="colorMode.value === 'dark' ? 'Modo oscuro (clic para claro)' : 'Modo claro (clic para oscuro)'"
          class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          @click="toggleTheme()"
        >
          <Icon :name="colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'" class="size-5" />
        </button>
        <NuxtLink
          v-if="showInicio"
          to="/"
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
        >
          <Icon name="i-lucide-home" class="size-4" />
          Inicio
        </NuxtLink>
        <NuxtLink
          to="/login"
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
        >
          <Icon name="i-lucide-log-in" class="size-4" />
          Iniciar sesión
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
        >
          <Icon name="i-lucide-calendar-plus" class="size-4" />
          Organiza tu evento
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
