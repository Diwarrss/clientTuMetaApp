<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const { user, fetchUser } = useAuth()

// Check if user is already logged in
const route = useRoute()

onMounted(async () => {
  try {
    await fetchUser()
    if (user.value) {
      const redirect = route.query.redirect as string
      await navigateTo(redirect && redirect.startsWith('/') ? redirect : '/dashboard')
    }
  } catch {
    // User is not logged in, stay on login page
  }
})
</script>

<template>
  <LayoutAuth reverse>
    <div class="grid mx-auto w-full max-w-sm gap-6 px-2 sm:px-0">
      <div class="grid gap-2 text-center">
        <h1 class="text-xl sm:text-2xl font-semibold tracking-tight">
          Bienvenido
        </h1>
        <p class="text-balance text-sm text-muted-foreground">
          Ingresa tus credenciales para continuar
        </p>
      </div>
      <AuthSignIn />
    </div>
  </LayoutAuth>
</template>
