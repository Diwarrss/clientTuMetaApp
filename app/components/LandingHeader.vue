<script setup lang="ts">
const colorMode = useColorMode()
const { user, fetchUser } = useAuth()
const mobileMenuOpen = ref(false)

onMounted(async () => {
  try {
    await fetchUser()
  } catch {
    // No logueado
  }
})

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/95">
    <div class="container mx-auto flex h-14 sm:h-16 items-center justify-between gap-4 px-4">
      <NuxtLink to="/" class="flex shrink-0 items-center gap-1.5 font-bold text-lg sm:text-xl tracking-tight" @click="closeMobileMenu">
        <span>Tu</span>
        <span class="text-emerald-500 dark:text-emerald-400">Meta</span>
        <span class="text-slate-400 text-sm font-normal">.app</span>
      </NuxtLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-1 lg:gap-6">
        <NuxtLink
          to="/"
          class="inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
        >
          Inicio
        </NuxtLink>
        <NuxtLink
          to="/#eventos"
          class="inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
        >
          Eventos
        </NuxtLink>
        <ClientOnly>
          <button
            type="button"
            :title="colorMode.value === 'dark' ? 'Modo oscuro (clic para claro)' : 'Modo claro (clic para oscuro)'"
            class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            @click="toggleTheme()"
          >
            <Icon :name="colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'" class="size-5" />
          </button>
          <NuxtLink
            v-if="!user"
            to="/login"
            class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            Iniciar sesión
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            <Icon :name="user ? 'i-lucide-layout-dashboard' : 'i-lucide-calendar-plus'" class="size-4" />
            {{ user ? 'Ir al panel' : 'Organiza tu evento' }}
          </NuxtLink>
          <template #fallback>
            <button type="button" class="rounded-lg p-2 text-slate-600" aria-hidden="true">
              <Icon name="i-lucide-sun" class="size-5" />
            </button>
            <NuxtLink to="/login" class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300">
              Iniciar sesión
            </NuxtLink>
            <NuxtLink to="/dashboard" class="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">
              <Icon name="i-lucide-calendar-plus" class="size-4" />
              Organiza tu evento
            </NuxtLink>
          </template>
        </ClientOnly>
      </nav>

      <!-- Mobile: hamburger + CTA compacto -->
      <div class="flex md:hidden items-center gap-2">
        <ClientOnly>
          <button
            type="button"
            :title="colorMode.value === 'dark' ? 'Modo oscuro' : 'Modo claro'"
            class="rounded-lg p-2 text-slate-600 dark:text-slate-400"
            @click="toggleTheme()"
          >
            <Icon :name="colorMode.value === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'" class="size-5" />
          </button>
          <NuxtLink
            v-if="!user"
            to="/login"
            class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
          >
            Entrar
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Icon :name="user ? 'i-lucide-layout-dashboard' : 'i-lucide-calendar-plus'" class="size-4" />
            <span>{{ user ? 'Panel' : 'Organizar' }}</span>
          </NuxtLink>
          <template #fallback>
            <NuxtLink to="/login" class="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium">Entrar</NuxtLink>
            <NuxtLink to="/dashboard" class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white">
              <Icon name="i-lucide-calendar-plus" class="size-4" />
              Organizar
            </NuxtLink>
          </template>
        </ClientOnly>
        <button
          type="button"
          class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Abrir menú"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <Icon :name="mobileMenuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" />
        </button>
      </div>
    </div>

    <!-- Mobile menu overlay -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 top-14 sm:top-16 z-40 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm md:hidden"
        aria-hidden="true"
        @click="closeMobileMenu"
      />
    </Transition>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <nav
        v-if="mobileMenuOpen"
        class="fixed left-4 right-4 top-[4.5rem] sm:top-[4.75rem] z-50 flex flex-col gap-1 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-900 md:hidden"
      >
        <NuxtLink
          to="/"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="closeMobileMenu"
        >
          <Icon name="i-lucide-home" class="size-4" />
          Inicio
        </NuxtLink>
        <NuxtLink
          to="/#eventos"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          @click="closeMobileMenu"
        >
          <Icon name="i-lucide-calendar" class="size-4" />
          Ver eventos
        </NuxtLink>
        <NuxtLink
          v-if="!user"
          to="/login"
          class="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 dark:border-slate-600 dark:text-slate-300"
          @click="closeMobileMenu"
        >
          <Icon name="i-lucide-log-in" class="size-4" />
          Iniciar sesión
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-3 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white"
          @click="closeMobileMenu"
        >
          <Icon :name="user ? 'i-lucide-layout-dashboard' : 'i-lucide-calendar-plus'" class="size-4" />
          {{ user ? 'Ir al panel' : 'Organiza tu evento' }}
        </NuxtLink>
      </nav>
    </Transition>
  </header>
</template>
