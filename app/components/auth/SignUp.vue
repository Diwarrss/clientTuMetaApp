<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import PasswordInput from '~/components/PasswordInput.vue'

const router = useRouter()
const { $api } = useNuxtApp()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)

async function onSubmit(event: Event) {
  event.preventDefault()
  if (!name.value || !email.value || !password.value || !passwordConfirmation.value)
    return

  if (password.value !== passwordConfirmation.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  if (password.value.length < 8) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  error.value = null
  isLoading.value = true

  try {
    await $api('/auth/register', {
      method: 'POST',
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
      },
    })
    router.push('/login?registered=1')
  }
  catch (e: any) {
    const err = e?.data?.errors
    error.value =
      err?.email?.[0] ||
      err?.name?.[0] ||
      err?.password?.[0] ||
      e?.data?.message ||
      e?.message ||
      'Error al registrarse'
  }
  finally {
    isLoading.value = false
  }
}

function loginWithGoogle() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:8686'
  const frontendOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const returnTo = `${frontendOrigin}/dashboard`
  window.location.href = `${apiBase}/auth/google/redirect?redirect_url=${encodeURIComponent(returnTo)}`
}
</script>

<template>
  <div class="grid gap-6">
    <Button
      type="button"
      variant="outline"
      class="w-full gap-2"
      @click="loginWithGoogle"
    >
      <Icon name="simple-icons:google" class="size-4" />
      Continuar con Google
    </Button>

    <Separator label="O regístrate con correo" />

    <form @submit="onSubmit">
      <div class="grid gap-4">
        <div v-if="error" class="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {{ error }}
        </div>
        <div class="grid gap-2">
          <Label for="name">Nombre</Label>
          <Input
            id="name"
            v-model="name"
            placeholder="Tu nombre completo"
            type="text"
            auto-capitalize="words"
            auto-complete="name"
            :disabled="isLoading"
            required
          />
        </div>
        <div class="grid gap-2">
          <Label for="email">Correo electrónico</Label>
          <Input
            id="email"
            v-model="email"
            placeholder="tu@correo.com"
            type="email"
            auto-capitalize="none"
            auto-complete="email"
            :disabled="isLoading"
            required
          />
        </div>
        <div class="grid gap-2">
          <Label for="password">Contraseña</Label>
          <PasswordInput
            id="password"
            v-model="password"
            placeholder="Mínimo 8 caracteres"
            :disabled="isLoading"
            required
          />
        </div>
        <div class="grid gap-2">
          <Label for="confirm-password">Confirmar contraseña</Label>
          <PasswordInput
            id="confirm-password"
            v-model="passwordConfirmation"
            placeholder="Repite la contraseña"
            :disabled="isLoading"
            required
          />
        </div>
        <Button type="submit" class="w-full" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          Crear cuenta
        </Button>
      </div>
    </form>
  </div>
</template>
