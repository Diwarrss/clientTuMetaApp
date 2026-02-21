<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

interface Category {
  id: number
  name: string
  edad_min: number | null
  edad_max: number | null
}

const props = defineProps<{
  eventId: number
  categories: Category[]
  precioBase: number
}>()

const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const

function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age
}

function findMatchingCategory(age: number): number | null {
  for (const cat of props.categories) {
    const minOk = cat.edad_min === null || age >= cat.edad_min
    const maxOk = cat.edad_max === null || age <= cat.edad_max
    if (minOk && maxOk) return cat.id
  }
  return props.categories[0]?.id ?? null
}

const schema = z.object({
  fecha_nacimiento: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  identificacion: z.string().min(5, 'La identificación es obligatoria').max(50),
  eps: z.string().max(100).optional(),
  talla_camisa: z.enum(TALLAS).optional(),
  comprobante: z.union([
    z.instanceof(File).refine(
      f => ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(f.type),
      'El archivo debe ser PDF, JPG o PNG'
    ).refine(f => f.size <= 5 * 1024 * 1024, 'El archivo no debe superar 5 MB'),
    z.undefined(),
  ]).refine(val => val instanceof File, 'El comprobante de pago es obligatorio'),
})

type Schema = z.infer<typeof schema>

const { handleSubmit, setFieldValue, watch, defineField } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    fecha_nacimiento: '',
    identificacion: '',
    eps: '',
    talla_camisa: undefined as (typeof TALLAS)[number] | undefined,
    comprobante: undefined as File | undefined,
  },
})

const [fechaNacimiento, fechaNacimientoAttrs] = defineField('fecha_nacimiento')
const [identificacion, identificacionAttrs] = defineField('identificacion')
const [eps, epsAttrs] = defineField('eps')
const [tallaCamisa, tallaCamisaAttrs] = defineField('talla_camisa')
const [comprobante, comprobanteAttrs] = defineField('comprobante')

// Auto-calcular categoría cuando cambia la fecha de nacimiento
const selectedCategoryId = ref<number | null>(props.categories[0]?.id ?? null)
watch(fechaNacimiento, (val) => {
  if (val) {
    const birthDate = new Date(val)
    const age = calculateAge(birthDate)
    selectedCategoryId.value = findMatchingCategory(age)
  }
}, { immediate: true })

const { user, fetchUser } = useAuth()

onMounted(async () => {
  try {
    await fetchUser()
  } catch {
    // Not logged in
  }
})
const isLoading = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const { $api, $csrf } = useNuxtApp()

const onSubmit = handleSubmit(async (values) => {
  if (!selectedCategoryId.value) {
    errorMessage.value = 'Selecciona una categoría'
    return
  }

  isLoading.value = true
  successMessage.value = null
  errorMessage.value = null

  try {
    await $csrf()
    const formData = new FormData()
    formData.append('event_id', String(props.eventId))
    formData.append('category_id', String(selectedCategoryId.value))
    formData.append('identificacion', values.identificacion)
    if (values.eps) formData.append('eps', values.eps)
    if (values.talla_camisa) formData.append('talla_camisa', values.talla_camisa)
    formData.append('comprobante', values.comprobante)

    await $api('/registrations', {
      method: 'POST',
      body: formData,
    })

    successMessage.value = 'Inscripción registrada. Revisaremos tu comprobante y te notificaremos.'
  }
  catch (e: any) {
    const errors = e?.data?.errors
    if (errors) {
      const first = Object.values(errors).flat()[0]
      errorMessage.value = typeof first === 'string' ? first : 'Error al procesar la inscripción'
    }
    else {
      errorMessage.value = e?.data?.message || e?.message || 'Error al procesar la inscripción'
    }
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="!user" class="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
      <p class="text-sm text-amber-200 mb-3">
        Debes iniciar sesión para inscribirte. Si no tienes cuenta, regístrate primero.
      </p>
      <NuxtLink
        :to="`/login?redirect=${encodeURIComponent($route.fullPath)}`"
        class="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
      >
        Iniciar sesión para inscribirse
        <Icon name="i-lucide-log-in" class="size-4" />
      </NuxtLink>
    </div>

    <form v-else class="space-y-4" @submit="onSubmit">
      <div v-if="successMessage" class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 text-sm">
        {{ successMessage }}
      </div>
      <div v-else-if="errorMessage" class="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">
        {{ errorMessage }}
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="fecha_nacimiento">Fecha de nacimiento *</Label>
          <Input
            id="fecha_nacimiento"
            v-model="fechaNacimiento"
            type="date"
            v-bind="fechaNacimientoAttrs"
            class="bg-white/5 border-white/20 text-white"
          />
          <p v-if="fechaNacimientoAttrs.errorMessage" class="text-sm text-red-400">
            {{ fechaNacimientoAttrs.errorMessage }}
          </p>
        </div>
        <div class="space-y-2">
          <Label>Categoría asignada</Label>
          <p class="rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-300">
            {{ categories.find(c => c.id === selectedCategoryId)?.name ?? 'Selecciona fecha de nacimiento' }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <Label for="identificacion">Número de identificación *</Label>
        <Input
          id="identificacion"
          v-model="identificacion"
          v-bind="identificacionAttrs"
          placeholder="Cédula o documento"
          class="bg-white/5 border-white/20 text-white"
        />
        <p v-if="identificacionAttrs.errorMessage" class="text-sm text-red-400">
          {{ identificacionAttrs.errorMessage }}
        </p>
      </div>

      <div class="space-y-2">
        <Label for="eps">EPS (opcional)</Label>
        <Input
          id="eps"
          v-model="eps"
          v-bind="epsAttrs"
          placeholder="Nombre de tu EPS"
          class="bg-white/5 border-white/20 text-white"
        />
      </div>

      <div class="space-y-2">
        <Label for="talla_camisa">Talla de camisa</Label>
        <Select v-model="tallaCamisa" v-bind="tallaCamisaAttrs">
          <SelectTrigger class="bg-white/5 border-white/20 text-white">
            <SelectValue placeholder="Selecciona talla" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="t in TALLAS" :key="t" :value="t">
              {{ t }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label for="comprobante">Comprobante de pago * (PDF, JPG o PNG, máx. 5 MB)</Label>
        <Input
          id="comprobante"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          class="bg-white/5 border-white/20 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-white"
          @change="(e: Event) => {
            const target = e.target as HTMLInputElement
            const file = target.files?.[0]
            if (file) setFieldValue('comprobante', file)
          }"
        />
        <p v-if="comprobanteAttrs.errorMessage" class="text-sm text-red-400">
          {{ comprobanteAttrs.errorMessage }}
        </p>
      </div>

      <Button
        type="submit"
        class="w-full"
        :disabled="isLoading"
      >
        <Icon v-if="isLoading" name="i-lucide-loader-2" class="mr-2 size-4 animate-spin" />
        {{ isLoading ? 'Enviando...' : 'Enviar inscripción' }}
      </Button>
    </form>
  </div>
</template>
