<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})
</script>

<template>
  <LayoutAuth>
    <div class="grid mx-auto max-w-sm gap-6">
      <div class="flex flex-col text-center space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">
          Crear cuenta
        </h1>
        <p class="text-sm text-muted-foreground">
          Regístrate para organizar tus eventos deportivos
        </p>
      </div>
      <AuthSignUp />
      <p class="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?
        <NuxtLink
          to="/login"
          class="underline underline-offset-4 hover:text-primary"
        >
          Iniciar sesión
        </NuxtLink>
      </p>
    </div>
  </LayoutAuth>
</template>

<style scoped>

</style>
