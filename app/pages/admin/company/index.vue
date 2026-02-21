<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
  middleware: 'permission',
  permissions: 'events.view',
})

const { $api } = useNuxtApp()
const loading = ref(true)
const saving = ref(false)

const form = ref({
  website_url: '',
  facebook_url: '',
  instagram_url: '',
  twitter_url: '',
})

const hasCompany = ref(true)

const fetchCompany = async () => {
  loading.value = true
  hasCompany.value = true
  try {
    const res = await $api<{
      data: {
        id: number
        name: string
        slug: string
        website_url: string | null
        facebook_url: string | null
        instagram_url: string | null
        twitter_url: string | null
      }
    }>('/admin/companies/me')
    const d = res.data
    form.value = {
      website_url: d.website_url || '',
      facebook_url: d.facebook_url || '',
      instagram_url: d.instagram_url || '',
      twitter_url: d.twitter_url || '',
    }
  }
  catch (e: any) {
    if ((e?.statusCode === 404 || e?.status === 404) || e?.data?.message?.includes('empresa asignada')) {
      hasCompany.value = false
    }
    else {
      toast.error('Error al cargar la empresa')
    }
  }
  finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    await $api('/admin/companies/me', {
      method: 'PUT',
      body: {
        website_url: form.value.website_url.trim() || null,
        facebook_url: form.value.facebook_url.trim() || null,
        instagram_url: form.value.instagram_url.trim() || null,
        twitter_url: form.value.twitter_url.trim() || null,
      },
    })
    toast.success('Empresa actualizada')
  }
  catch (e: any) {
    const msg = e?.data?.message || Object.values(e?.data?.errors || {})?.[0]?.[0] || 'Error al actualizar'
    toast.error(msg)
  }
  finally {
    saving.value = false
  }
}

onMounted(fetchCompany)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        Mi empresa
      </h2>
      <p class="text-muted-foreground">
        Enlaces de la empresa organizadora (web, redes sociales). Se muestran en la página del evento.
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Icon name="i-lucide-loader-2" class="size-8 animate-spin text-muted-foreground" />
    </div>

    <div v-else-if="!hasCompany" class="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
      <p class="text-amber-200 font-medium">
        No tienes empresa asignada
      </p>
      <p class="mt-2 text-sm text-slate-400">
        Tu usuario no está asociado a ninguna empresa. Contacta al administrador para que te asigne a una empresa y puedas gestionar los enlaces (web, redes sociales) que se muestran en la página de tus eventos.
      </p>
    </div>

    <form v-else class="max-w-xl space-y-4" @submit.prevent="handleSubmit">
      <Card>
        <CardHeader>
          <CardTitle>Enlaces</CardTitle>
          <CardDescription>
            URLs opcionales. Deja en blanco los que no uses.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="website_url">Sitio web</Label>
            <Input
              id="website_url"
              v-model="form.website_url"
              type="url"
              placeholder="https://..."
            />
          </div>
          <div class="grid gap-2">
            <Label for="facebook_url">Facebook</Label>
            <Input
              id="facebook_url"
              v-model="form.facebook_url"
              type="url"
              placeholder="https://facebook.com/..."
            />
          </div>
          <div class="grid gap-2">
            <Label for="instagram_url">Instagram</Label>
            <Input
              id="instagram_url"
              v-model="form.instagram_url"
              type="url"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div class="grid gap-2">
            <Label for="twitter_url">Twitter / X</Label>
            <Input
              id="twitter_url"
              v-model="form.twitter_url"
              type="url"
              placeholder="https://twitter.com/..."
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" :disabled="saving">
        <Icon v-if="saving" name="i-lucide-loader-2" class="mr-2 h-4 w-4 animate-spin" />
        Guardar
      </Button>
    </form>
  </div>
</template>
