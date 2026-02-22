<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import PasswordInput from '~/components/PasswordInput.vue'

const auth = useAuth()
const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

function loginWithGoogle() {
  const apiBase = config.public.apiBase || 'http://localhost:8686'
  const redirectUrl = (route.query.redirect as string) || '/dashboard'
  const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const returnTo = `${frontendOrigin}${redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`}`
  window.location.href = `${apiBase}/auth/google/redirect?redirect_url=${encodeURIComponent(returnTo)}`
}

async function onSubmit(event: Event) {
  event.preventDefault()
  if (!email.value || !password.value)
    return

  error.value = null
  isLoading.value = true

  try {
    await auth.login({
      email: email.value,
      password: password.value
    })
    const redirect = route.query.redirect as string
    await navigateTo(redirect && redirect.startsWith('/') ? redirect : '/dashboard')
  } catch (e: any) {
    // Laravel ValidationException comes as { errors: { field: [msg] } }
    const firstFieldError =
      e?.data?.errors?.email?.[0] ||
      e?.data?.errors?.password?.[0]
    error.value = firstFieldError || e?.data?.message || e?.message || 'Error al iniciar sesión'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <form class="grid gap-6" @submit="onSubmit">
    <div class="flex flex-col gap-4">
      <Button
        type="button"
        variant="outline"
        class="w-full gap-2"
        @click="loginWithGoogle"
      >
        <Icon name="simple-icons:google" class="size-4" />
        Continuar con Google
      </Button>
    </div>
    <Separator label="O continúa con correo" />
    <div v-if="error" class="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
      {{ error }}
    </div>
    <div class="grid gap-2">
      <Label for="email">
        Correo electrónico
      </Label>
      <Input
        id="email"
        v-model="email"
        type="email"
        placeholder="tu@correo.com"
        :disabled="isLoading"
        auto-capitalize="none"
        auto-complete="email"
        auto-correct="off"
        required
      />
    </div>
    <div class="grid gap-2">
      <div class="flex items-center">
        <Label for="password">
          Contraseña
        </Label>
        <NuxtLink
          to="/forgot-password"
          class="ml-auto inline-block text-sm underline"
        >
          ¿Olvidaste tu contraseña?
        </NuxtLink>
      </div>
      <PasswordInput id="password" v-model="password" autocomplete="current-password" :disabled="isLoading" required />
    </div>
    <Button type="submit" class="w-full" :disabled="isLoading || !email || !password">
      <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
      Iniciar sesión
    </Button>
  </form>
  <div class="mt-4 text-center text-sm text-muted-foreground">
    ¿No tienes cuenta?
    <NuxtLink to="/register" class="underline">
      Regístrate
    </NuxtLink>
  </div>
</template>

<style scoped>

</style>
