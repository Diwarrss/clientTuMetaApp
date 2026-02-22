<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import * as z from 'zod'

const { user, fetchUser } = useAuth()
const { $api } = useNuxtApp()

const profileFormSchema = toTypedSchema(z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(255),
  email: z.string().email('Correo electrónico válido'),
}))

const { handleSubmit, resetForm, setValues } = useForm({
  validationSchema: profileFormSchema,
  initialValues: {
    name: user.value?.name ?? '',
    email: user.value?.email ?? '',
  },
})

watch(user, (u) => {
  if (u) {
    setValues({ name: u.name ?? '', email: u.email ?? '' })
  }
}, { immediate: true })

const onSubmit = handleSubmit(async (values) => {
  try {
    await $api('/auth/profile', {
      method: 'PUT',
      body: { name: values.name, email: values.email },
    })
    await fetchUser()
    toast.success('Perfil actualizado correctamente')
  }
  catch (e: any) {
    const msg = e?.data?.message || e?.data?.errors?.email?.[0] || 'Error al actualizar'
    toast.error(msg)
  }
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      Perfil
    </h3>
    <p class="text-sm text-muted-foreground">
      Actualiza tu nombre y correo electrónico
    </p>
  </div>
  <Separator />
  <form class="space-y-6" @submit="onSubmit">
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>Nombre</FormLabel>
        <FormControl>
          <Input v-bind="componentField" placeholder="Tu nombre" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="email">
      <FormItem>
        <FormLabel>Correo electrónico</FormLabel>
        <FormControl>
          <Input v-bind="componentField" type="email" placeholder="tu@correo.com" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="flex gap-2">
      <Button type="submit">
        Guardar cambios
      </Button>
      <Button type="button" variant="outline" @click="resetForm">
        Restablecer
      </Button>
    </div>
  </form>
</template>
