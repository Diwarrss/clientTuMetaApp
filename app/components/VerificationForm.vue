<script setup lang="ts">
const TIPOS_DOCUMENTO = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'TI', label: 'Tarjeta de identidad' },
  { value: 'PA', label: 'Pasaporte' },
] as const

const props = defineProps<{
  eventId: number
}>()

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:8686'

const tipoDocumento = ref('CC')
const numeroDocumento = ref('')
const loading = ref(false)
const result = ref<{
  event: { name: string; slug: string; event_date: string }
  category: string
  participant: string
  estado: string
  estado_label: string
} | null>(null)
const errorMessage = ref<string | null>(null)

function reset() {
  result.value = null
  errorMessage.value = null
  numeroDocumento.value = ''
}

async function buscar() {
  const num = numeroDocumento.value?.trim()
  if (!num) {
    errorMessage.value = 'Ingresa tu número de documento'
    return
  }

  loading.value = true
  result.value = null
  errorMessage.value = null

  try {
    const res = await $fetch<{ data: typeof result.value }>(`${apiBase}/api/registrations/verify-by-document`, {
      method: 'GET',
      query: { event_id: props.eventId, identificacion: num },
      credentials: 'include',
    })
    result.value = res.data
  } catch (e: any) {
    errorMessage.value = e?.data?.message || 'No encontramos tu inscripción. Revisa el número de documento.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm dark:shadow-none">
    <h3 class="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
      Verificar inscripción
    </h3>
    <p class="text-sm text-muted-foreground mb-4">
      Ingresa tus datos para verificar el estado de tu inscripción en este evento.
    </p>

    <form v-if="!result" class="space-y-4" @submit.prevent="buscar">
      <div class="space-y-2">
        <Label for="tipo_documento">Tipo de documento</Label>
        <Select v-model="tipoDocumento">
          <SelectTrigger id="tipo_documento">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="t in TIPOS_DOCUMENTO" :key="t.value" :value="t.value">
              {{ t.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label for="numero_documento">Número de documento</Label>
        <Input
          id="numero_documento"
          v-model="numeroDocumento"
          placeholder="Ej: 123456789"
          :disabled="loading"
        />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-500 dark:text-red-400">
        {{ errorMessage }}
      </p>

      <div class="flex gap-3">
        <Button type="button" variant="outline" :disabled="loading" @click="reset">
          Cancelar
        </Button>
        <Button type="submit" :disabled="loading">
          <Icon v-if="loading" name="i-lucide-loader-2" class="mr-2 size-4 animate-spin" />
          <Icon v-else name="i-lucide-search" class="mr-2 size-4" />
          Buscar inscripción
        </Button>
      </div>
    </form>

    <div v-else class="space-y-4">
      <div>
        <p class="text-sm text-muted-foreground">Evento</p>
        <p class="font-semibold">{{ result.event.name }}</p>
        <p class="text-sm text-muted-foreground">
          {{ new Date(result.event.event_date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
        </p>
      </div>
      <div>
        <p class="text-sm text-muted-foreground">Participante</p>
        <p class="font-medium">{{ result.participant }}</p>
      </div>
      <div>
        <p class="text-sm text-muted-foreground">Categoría</p>
        <p class="font-medium">{{ result.category }}</p>
      </div>
      <div>
        <p class="text-sm text-muted-foreground">Estado</p>
        <Badge
          :variant="result.estado === 'approved' ? 'default' : result.estado === 'rejected' ? 'destructive' : 'secondary'"
        >
          {{ result.estado_label }}
        </Badge>
      </div>
      <Button variant="outline" size="sm" @click="reset">
        Buscar otra inscripción
      </Button>
    </div>
  </div>
</template>
