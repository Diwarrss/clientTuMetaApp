<script setup lang="ts">
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

interface Category {
  id: number
  name: string
  edad_min: number | null
  edad_max: number | null
  precio: number
}

const props = defineProps<{
  eventId: number
  categories: Category[]
  precioBase?: number
  inscriptionDeadline?: string | null
}>()

const inscriptionClosed = computed(() => {
  if (!props.inscriptionDeadline) return false
  return new Date(props.inscriptionDeadline) < new Date()
})

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
  guest_name: z.string().min(2, 'El nombre es obligatorio').optional(),
  guest_email: z.string().email('Correo válido').optional(),
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

const { handleSubmit, setFieldValue, defineField } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: {
    guest_name: '',
    guest_email: '',
    fecha_nacimiento: '',
    identificacion: '',
    eps: '',
    talla_camisa: undefined as (typeof TALLAS)[number] | undefined,
    comprobante: undefined as File | undefined,
  },
})

const [guestName, guestNameAttrs] = defineField('guest_name')
const [guestEmail, guestEmailAttrs] = defineField('guest_email')
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

const registrationMode = ref<'choice' | 'guest' | 'google'>('choice')

const isGuestMode = computed(() => registrationMode.value === 'guest')

const onSubmit = handleSubmit(async (values) => {
  if (!selectedCategoryId.value) {
    errorMessage.value = 'Selecciona una categoría'
    return
  }
  if (isGuestMode.value && (!values.guest_name?.trim() || !values.guest_email)) {
    errorMessage.value = 'Nombre y correo son obligatorios'
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
    if (isGuestMode.value) {
      formData.append('guest_name', values.guest_name!.trim())
      formData.append('guest_email', values.guest_email!)
    }
    formData.append('identificacion', values.identificacion)
    if (values.eps) formData.append('eps', values.eps)
    if (values.talla_camisa) formData.append('talla_camisa', values.talla_camisa)
    formData.append('comprobante', values.comprobante)

    const endpoint = isGuestMode.value ? '/registrations/guest' : '/registrations'
    await $api(endpoint, {
      method: 'POST',
      body: formData,
    })

    successMessage.value = 'Inscripción registrada. Revisaremos tu comprobante y te notificaremos por correo.'
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

function selectGuest() {
  registrationMode.value = 'guest'
}
function selectGoogle() {
  navigateTo(`/login?redirect=${encodeURIComponent($route.fullPath)}`)
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="inscriptionClosed" class="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
      <p class="text-sm text-red-200">
        El plazo de inscripción ha vencido.
      </p>
    </div>
    <!-- Pantalla de elección: invitado o Google -->
    <div v-else-if="!user && registrationMode === 'choice'" class="space-y-6">
      <div class="text-center">
        <h3 class="text-lg font-semibold text-white">
          ¿Cómo te gustaría inscribirte?
        </h3>
        <p class="mt-1 text-sm text-slate-400">
          Elige la opción que mejor se adapte a ti
        </p>
      </div>

      <div class="space-y-3">
        <button
          type="button"
          class="flex w-full items-center gap-4 rounded-xl border border-white/20 bg-white/5 p-4 text-left transition hover:border-emerald-500/50 hover:bg-white/10"
          @click="selectGuest"
        >
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <Icon name="i-lucide-zap" class="size-6 text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-emerald-400">
              Continuar como invitado
            </p>
            <p class="text-sm text-slate-400">
              Inscripción rápida sin crear cuenta.
            </p>
          </div>
          <Icon name="i-lucide-chevron-right" class="size-5 shrink-0 text-slate-500" />
        </button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-white/20" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-slate-900 px-2 text-slate-500">o</span>
          </div>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 transition hover:border-white/30 hover:bg-white/10"
          @click="selectGoogle"
        >
          <Icon name="simple-icons:google" class="size-5" />
          <span>Continuar con Google</span>
        </button>
      </div>
    </div>

    <form v-else-if="user || registrationMode === 'guest'" class="space-y-4" @submit="onSubmit">
      <div v-if="successMessage" class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200 text-sm">
        {{ successMessage }}
      </div>
      <div v-else-if="errorMessage" class="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Volver atrás (solo en modo invitado) -->
      <div v-if="isGuestMode && !successMessage" class="flex justify-start">
        <button
          type="button"
          class="text-sm text-slate-400 hover:text-white"
          @click="registrationMode = 'choice'"
        >
          <Icon name="i-lucide-arrow-left" class="mr-1 inline size-4" />
          Cambiar opción
        </button>
      </div>

      <!-- Campos guest (solo cuando no hay usuario) -->
      <div v-if="isGuestMode" class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label for="guest_name">Nombre completo *</Label>
          <Input
            id="guest_name"
            v-model="guestName"
            v-bind="guestNameAttrs"
            placeholder="Tu nombre"
            class="bg-white/5 border-white/20 text-white"
          />
          <p v-if="guestNameAttrs.errorMessage" class="text-sm text-red-400">
            {{ guestNameAttrs.errorMessage }}
          </p>
        </div>
        <div class="space-y-2">
          <Label for="guest_email">Correo electrónico *</Label>
          <Input
            id="guest_email"
            v-model="guestEmail"
            type="email"
            v-bind="guestEmailAttrs"
            placeholder="tu@correo.com"
            class="bg-white/5 border-white/20 text-white"
          />
          <p v-if="guestEmailAttrs.errorMessage" class="text-sm text-red-400">
            {{ guestEmailAttrs.errorMessage }}
          </p>
        </div>
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
            <span v-if="selectedCategoryId" class="ml-2 font-semibold text-emerald-400">
              ${{ (categories.find(c => c.id === selectedCategoryId)?.precio ?? props.precioBase ?? 0).toLocaleString('es-CO') }}
            </span>
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
