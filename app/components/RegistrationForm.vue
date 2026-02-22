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
const GRUPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

interface ColombiaDepto {
  id: number
  departamento: string
  ciudades: string[]
}

const colombiaData = ref<ColombiaDepto[]>([])
const epsList = ref<string[]>([])

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
  grupo_sanguineo: z.string().max(10).optional(),
  departamento: z.string().max(100).optional(),
  ciudad: z.string().max(100).optional(),
  direccion: z.string().min(5, 'La dirección es obligatoria').max(255),
  contacto_emergencia: z.string().min(2, 'El contacto de emergencia es obligatorio').max(255),
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
    eps: '__none__',
    talla_camisa: undefined as (typeof TALLAS)[number] | undefined,
    grupo_sanguineo: '',
    departamento: '',
    ciudad: '',
    direccion: '',
    contacto_emergencia: '',
    comprobante: undefined as File | undefined,
  },
})

const [guestName, guestNameAttrs] = defineField('guest_name')
const [guestEmail, guestEmailAttrs] = defineField('guest_email')
const [fechaNacimiento, fechaNacimientoAttrs] = defineField('fecha_nacimiento')
const [identificacion, identificacionAttrs] = defineField('identificacion')
const [eps, epsAttrs] = defineField('eps')
const [tallaCamisa, tallaCamisaAttrs] = defineField('talla_camisa')
const [grupoSanguineo, grupoSanguineoAttrs] = defineField('grupo_sanguineo')
const [departamento, departamentoAttrs] = defineField('departamento')
const [ciudad, ciudadAttrs] = defineField('ciudad')
const [direccion, direccionAttrs] = defineField('direccion')
const [contactoEmergencia, contactoEmergenciaAttrs] = defineField('contacto_emergencia')
const [comprobante, comprobanteAttrs] = defineField('comprobante')

const ciudadesDisponibles = computed(() => {
  if (!departamento.value || !colombiaData.value.length) return []
  const depto = colombiaData.value.find(d => d.departamento === departamento.value)
  return depto?.ciudades ?? []
})
const comprobanteInput = ref<HTMLInputElement | null>(null)

// Auto-calcular categoría cuando cambia la fecha de nacimiento
const selectedCategoryId = ref<number | null>(props.categories[0]?.id ?? null)
watch(fechaNacimiento, (val) => {
  if (val) {
    const birthDate = new Date(val)
    const age = calculateAge(birthDate)
    selectedCategoryId.value = findMatchingCategory(age)
  }
}, { immediate: true })

const { user, fetchUser, logout } = useAuth()
const route = useRoute()

onMounted(async () => {
  try {
    await fetchUser()
  } catch {
    // Not logged in
  }
  try {
    const [colombiaRes, epsRes] = await Promise.all([
      $fetch<ColombiaDepto[]>('/data/colombia.json'),
      $fetch<string[]>('/data/eps-colombia.json'),
    ])
    colombiaData.value = colombiaRes
    epsList.value = epsRes
  } catch {
    colombiaData.value = []
    epsList.value = []
  }
})

watch(departamento, () => {
  setFieldValue('ciudad', '')
})
const isLoading = ref(false)
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const { $api, $csrf } = useNuxtApp()

const registrationMode = ref<'choice' | 'guest' | 'google'>('choice')

const isGuestMode = computed(() => registrationMode.value === 'guest')

function onInvalid(errs: Record<string, unknown>) {
  const first = Object.values(errs).flat().find(Boolean)
  errorMessage.value = (typeof first === 'string' ? first : String(first)) || 'Revisa los campos del formulario'
}

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
    if (values.eps && values.eps !== '__none__') formData.append('eps', values.eps)
    if (values.talla_camisa) formData.append('talla_camisa', values.talla_camisa)
    if (values.grupo_sanguineo) formData.append('grupo_sanguineo', values.grupo_sanguineo)
    if (values.departamento) formData.append('departamento', values.departamento)
    if (values.ciudad) formData.append('ciudad', values.ciudad)
    formData.append('direccion', values.direccion)
    formData.append('contacto_emergencia', values.contacto_emergencia)
    formData.append('comprobante', values.comprobante)

    const endpoint = isGuestMode.value ? '/registrations/guest' : '/registrations'
    await $api(endpoint, {
      method: 'POST',
      body: formData,
    })

    successMessage.value = 'Inscripción registrada. Revisaremos tu comprobante y te notificaremos por correo.'
  }
  catch (e: any) {
    const errs = e?.data?.errors
    if (errs) {
      const first = Object.values(errs).flat()[0]
      errorMessage.value = typeof first === 'string' ? first : 'Error al procesar la inscripción'
    }
    else {
      errorMessage.value = e?.data?.message || e?.message || 'Error al procesar la inscripción'
    }
  }
  finally {
    isLoading.value = false
  }
}, onInvalid)

function selectGuest() {
  registrationMode.value = 'guest'
}
function selectGoogle() {
  navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
}

function triggerComprobanteClick() {
  comprobanteInput?.value?.click()
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="inscriptionClosed" class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
      <p class="text-sm text-red-800 dark:text-red-200">
        El plazo de inscripción ha vencido.
      </p>
    </div>
    <!-- Pantalla de elección: invitado o Google -->
    <div v-else-if="!user && registrationMode === 'choice'" class="space-y-6">
      <div class="text-center">
        <h3 class="text-lg font-semibold text-foreground">
          ¿Cómo te gustaría inscribirte?
        </h3>
        <p class="mt-1 text-sm text-muted-foreground">
          Elige la opción que mejor se adapte a ti
        </p>
      </div>

      <div class="space-y-3">
        <button
          type="button"
          class="flex w-full items-center gap-4 rounded-xl border border-border bg-muted/50 p-4 text-left transition hover:border-emerald-500/50 hover:bg-muted dark:border-white/20 dark:bg-white/5 dark:hover:border-emerald-500/50 dark:hover:bg-white/10"
          @click="selectGuest"
        >
          <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500">
            <Icon name="i-lucide-zap" class="size-6 text-white" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-emerald-600 dark:text-emerald-400">
              Continuar como invitado
            </p>
            <p class="text-sm text-muted-foreground">
              Inscripción rápida sin crear cuenta.
            </p>
          </div>
          <Icon name="i-lucide-chevron-right" class="size-5 shrink-0 text-muted-foreground" />
        </button>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-border dark:border-white/20" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground dark:bg-slate-900">o</span>
          </div>
        </div>

        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3 transition hover:border-emerald-500/50 hover:bg-muted dark:border-white/20 dark:bg-white/5 dark:hover:border-white/30 dark:hover:bg-white/10"
          @click="selectGoogle"
        >
          <Icon name="simple-icons:google" class="size-5" />
          <span>Continuar con Google</span>
        </button>
      </div>
    </div>

    <form v-else-if="user || registrationMode === 'guest'" class="space-y-6" @submit="onSubmit">
      <!-- Banner: usuario logueado con Google -->
      <div v-if="user && !isGuestMode" class="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <Icon name="i-lucide-user-check" class="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span class="text-sm font-medium text-emerald-800 dark:text-emerald-200 break-words">
            Inscribiéndote como <strong>{{ user.name }}</strong>
            <span class="text-emerald-600 dark:text-emerald-400">({{ user.email }})</span>
          </span>
        </div>
        <button
          type="button"
          class="text-xs text-emerald-600 underline hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
          @click="async () => { await logout(); await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`) }"
        >
          Usar otra cuenta
        </button>
      </div>

      <div v-if="successMessage" class="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        {{ successMessage }}
      </div>
      <div v-else-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
        {{ errorMessage }}
      </div>

      <!-- Volver atrás (solo en modo invitado) -->
      <div v-if="isGuestMode && !successMessage" class="flex justify-start">
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="gap-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
          @click="registrationMode = 'choice'"
        >
          <Icon name="i-lucide-arrow-left" class="size-4" />
          Cambiar opción
        </Button>
      </div>

      <!-- Sección 1: Datos personales -->
      <div class="space-y-4 rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-3 sm:p-4">
        <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Icon name="i-lucide-user" class="size-4" />
          Datos personales
        </h4>
        <div v-if="isGuestMode" class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="guest_name">Nombre completo *</Label>
            <Input
              id="guest_name"
              v-model="guestName"
              v-bind="guestNameAttrs"
              placeholder="Ej: Juan Pérez"
            />
            <p v-if="guestNameAttrs.errorMessage" class="text-sm text-red-500">{{ guestNameAttrs.errorMessage }}</p>
          </div>
          <div class="space-y-2">
            <Label for="guest_email">Correo electrónico *</Label>
            <Input
              id="guest_email"
              v-model="guestEmail"
              type="email"
              v-bind="guestEmailAttrs"
              placeholder="Ej: juan@correo.com"
            />
            <p v-if="guestEmailAttrs.errorMessage" class="text-sm text-red-500">{{ guestEmailAttrs.errorMessage }}</p>
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
            />
            <p v-if="fechaNacimientoAttrs.errorMessage" class="text-sm text-red-500">{{ fechaNacimientoAttrs.errorMessage }}</p>
          </div>
          <div class="space-y-2">
            <Label>Categoría y precio</Label>
            <div class="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3">
              <span class="font-medium text-slate-900 dark:text-white">{{ categories.find(c => c.id === selectedCategoryId)?.name ?? 'Selecciona fecha de nacimiento' }}</span>
              <span v-if="selectedCategoryId" class="ml-2 font-semibold text-emerald-600 dark:text-emerald-400">
                ${{ (categories.find(c => c.id === selectedCategoryId)?.precio ?? props.precioBase ?? 0).toLocaleString('es-CO') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 2: Documento e identificación -->
      <div class="space-y-4 rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-3 sm:p-4">
        <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Icon name="i-lucide-id-card" class="size-4" />
          Documento e identificación
        </h4>
        <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div class="space-y-2">
            <Label for="identificacion">Cédula o documento *</Label>
            <Input
              id="identificacion"
              v-model="identificacion"
              v-bind="identificacionAttrs"
              placeholder="Ej: 123456789"
            />
            <p v-if="identificacionAttrs.errorMessage" class="text-sm text-red-500">{{ identificacionAttrs.errorMessage }}</p>
          </div>
          <div class="space-y-2">
            <Label for="eps">EPS</Label>
            <Select v-model="eps" v-bind="epsAttrs">
              <SelectTrigger>
                <SelectValue placeholder="Tu EPS (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No especificado</SelectItem>
                <SelectItem v-for="e in epsList" :key="e" :value="e">{{ e }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="talla_camisa">Talla de camisa</Label>
            <Select v-model="tallaCamisa" v-bind="tallaCamisaAttrs">
              <SelectTrigger>
                <SelectValue placeholder="XS, S, M, L..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="t in TALLAS" :key="t" :value="t">{{ t }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="grupo_sanguineo">Grupo sanguíneo</Label>
            <Select v-model="grupoSanguineo" v-bind="grupoSanguineoAttrs">
              <SelectTrigger>
                <SelectValue placeholder="A+, B-, O+..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="g in GRUPOS_SANGUINEOS" :key="g" :value="g">{{ g }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <!-- Sección 3: Ubicación y contacto -->
      <div class="space-y-4 rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-3 sm:p-4">
        <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Icon name="i-lucide-map-pin" class="size-4" />
          Ubicación y contacto
        </h4>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="departamento">Departamento</Label>
            <Select v-model="departamento" v-bind="departamentoAttrs">
              <SelectTrigger>
                <SelectValue placeholder="Ej: Antioquia, Cundinamarca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="d in colombiaData" :key="d.id" :value="d.departamento">{{ d.departamento }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="ciudad">Ciudad</Label>
            <Select v-model="ciudad" v-bind="ciudadAttrs" :disabled="!departamento">
              <SelectTrigger>
                <SelectValue placeholder="Selecciona ciudad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in ciudadesDisponibles" :key="c" :value="c">{{ c }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="direccion">Dirección *</Label>
            <Input
              id="direccion"
              v-model="direccion"
              v-bind="direccionAttrs"
              placeholder="Ej: Calle 50 #12-34, Barrio Centro"
            />
            <p v-if="direccionAttrs.errorMessage" class="text-sm text-red-500">{{ direccionAttrs.errorMessage }}</p>
          </div>
          <div class="space-y-2">
            <Label for="contacto_emergencia">Contacto de emergencia *</Label>
            <Input
              id="contacto_emergencia"
              v-model="contactoEmergencia"
              v-bind="contactoEmergenciaAttrs"
              placeholder="Ej: María Pérez - 300 123 4567"
            />
            <p v-if="contactoEmergenciaAttrs.errorMessage" class="text-sm text-red-500">{{ contactoEmergenciaAttrs.errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Sección 4: Comprobante -->
      <div class="space-y-4 rounded-lg border border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-3 sm:p-4">
        <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Icon name="i-lucide-file-up" class="size-4" />
          Comprobante de pago *
        </h4>
        <div
          class="relative flex min-h-[80px] sm:min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-4 sm:px-4 sm:py-5 transition hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-600 dark:bg-slate-900/50 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/5"
          :class="{ 'border-red-400 dark:border-red-500': comprobanteAttrs.errorMessage }"
          @click="triggerComprobanteClick"
        >
          <input
            ref="comprobanteInput"
            id="comprobante"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png,image/jpg"
            class="sr-only"
            @change="(e: Event) => {
              const target = e.target as HTMLInputElement
              const file = target.files?.[0]
              if (file) setFieldValue('comprobante', file)
            }"
          />
          <Icon
            v-if="!comprobante"
            name="i-lucide-upload"
            class="size-10 text-slate-400 dark:text-slate-500"
          />
          <Icon
            v-else
            name="i-lucide-file-check"
            class="size-10 text-emerald-500 dark:text-emerald-400"
          />
          <p v-if="!comprobante" class="text-center text-sm text-slate-600 dark:text-slate-400">
            Haz clic o arrastra tu archivo aquí
          </p>
          <p v-else class="text-center text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {{ comprobante.name }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            PDF, JPG o PNG — máx. 5 MB
          </p>
        </div>
        <p v-if="comprobanteAttrs.errorMessage" class="text-sm text-red-500 dark:text-red-400">
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
