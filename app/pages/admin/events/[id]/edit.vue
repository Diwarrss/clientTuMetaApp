<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
  middleware: 'permission',
  permissions: 'events.edit',
})

interface Company {
  id: number
  name: string
  slug: string
}

interface CategoryInput {
  id?: number
  name: string
  edad_min: number | null
  edad_max: number | null
  precio: number
}

const { $api } = useNuxtApp()
const router = useRouter()
const route = useRoute()
const { user } = useAuth()

const eventId = computed(() => Number(route.params.id))
const companies = ref<Company[]>([])
const loading = ref(false)
const saving = ref(false)
const currentHeroImageUrl = ref<string | null>(null)
const heroImageFile = ref<File | null>(null)
const heroImagePreview = ref<string | null>(null)
const removeHeroImage = ref(false)
const premiacionImageUrl = ref<string | null>(null)
const premiacionImageFile = ref<File | null>(null)
const removePremiacionImage = ref(false)
const tallaCamisaImageUrl = ref<string | null>(null)
const tallaCamisaImageFile = ref<File | null>(null)
const removeTallaCamisaImage = ref(false)
const cronogramaImageUrl = ref<string | null>(null)
const cronogramaImageFile = ref<File | null>(null)
const removeCronogramaImage = ref(false)

const isSuperAdmin = computed(() => user.value?.roles?.includes('super_admin') ?? false)

const form = ref({
  company_id: null as number | null,
  name: '',
  description: '',
  kit_includes: '',
  event_date: '',
  event_time: '07:00',
  event_end_date: '' as string | null,
  event_end_time: '07:00' as string | null,
  inscription_deadline: '' as string | null,
  timezone: 'America/Bogota',
  location_city: '',
  location_region: '',
  location_country: 'Colombia',
  bank_name: '',
  bank_account: '',
  precio_base: 0,
  status: 'active',
  categories: [] as CategoryInput[],
})

const fetchEvent = async () => {
  loading.value = true
  try {
    const res = await $api<{
      data: {
        id: number
        company_id: number
        name: string
        description: string | null
        kit_includes: string | null
        event_date: string
        event_end_date: string | null
        inscription_deadline: string | null
        timezone: string
        location_city: string | null
        location_region: string | null
        location_country: string | null
        bank_name: string | null
        bank_account: string | null
        precio_base: number
        status: string
        hero_image_url: string | null
        premiacion_image_url: string | null
        talla_camisa_image_url: string | null
        cronograma_image_url: string | null
        categories: Array<{ id: number; name: string; edad_min: number | null; edad_max: number | null; precio: number }>
      }
    }>(`/admin/events/${eventId.value}`)
    const d = res.data
    currentHeroImageUrl.value = d.hero_image_url ?? null
    premiacionImageUrl.value = d.premiacion_image_url ?? null
    tallaCamisaImageUrl.value = d.talla_camisa_image_url ?? null
    cronogramaImageUrl.value = d.cronograma_image_url ?? null
    const dt = new Date(d.event_date)
    const dtEnd = d.event_end_date ? new Date(d.event_end_date) : null
    const dtInsc = d.inscription_deadline ? new Date(d.inscription_deadline) : null
    form.value = {
      company_id: d.company_id,
      name: d.name,
      description: d.description || '',
      kit_includes: d.kit_includes || '',
      event_date: dt.toISOString().slice(0, 10),
      event_time: dt.toTimeString().slice(0, 5),
      event_end_date: dtEnd ? dtEnd.toISOString().slice(0, 10) : null,
      event_end_time: dtEnd ? dtEnd.toTimeString().slice(0, 5) : '07:00',
      inscription_deadline: dtInsc ? dtInsc.toISOString().slice(0, 10) : null,
      timezone: d.timezone || 'America/Bogota',
      location_city: d.location_city || '',
      location_region: d.location_region || '',
      location_country: d.location_country || 'Colombia',
      bank_name: d.bank_name || '',
      bank_account: d.bank_account || '',
      precio_base: d.precio_base,
      status: d.status,
      categories: d.categories.map(c => ({
        id: c.id,
        name: c.name,
        edad_min: c.edad_min,
        edad_max: c.edad_max,
        precio: c.precio ?? 0,
      })),
    }
  }
  catch (error) {
    toast.error('Error al cargar el evento')
    router.push('/admin/events')
  }
  finally {
    loading.value = false
  }
}

const fetchCompanies = async () => {
  try {
    const res = await $api<{ data: Company[] }>('/admin/events/companies')
    companies.value = res.data
  }
  catch {
    companies.value = []
  }
}

function addCategory() {
  form.value.categories.push({ name: '', edad_min: null, edad_max: null, precio: form.value.precio_base || 0 })
}

function removeCategory(index: number) {
  if (form.value.categories.length > 1) {
    form.value.categories.splice(index, 1)
  }
}

function onHeroImageChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  heroImageFile.value = file || null
  heroImagePreview.value = file ? URL.createObjectURL(file) : null
  if (file) removeHeroImage.value = false
}
function onPremiacionChange(e: Event) {
  const t = (e.target as HTMLInputElement)
  premiacionImageFile.value = t.files?.[0] || null
  if (premiacionImageFile.value) removePremiacionImage.value = false
}
function onTallaCamisaChange(e: Event) {
  const t = (e.target as HTMLInputElement)
  tallaCamisaImageFile.value = t.files?.[0] || null
  if (tallaCamisaImageFile.value) removeTallaCamisaImage.value = false
}
function onCronogramaChange(e: Event) {
  const t = (e.target as HTMLInputElement)
  cronogramaImageFile.value = t.files?.[0] || null
  if (cronogramaImageFile.value) removeCronogramaImage.value = false
}

function buildEventDate(): string {
  if (!form.value.event_date) return ''
  const [y, m, d] = form.value.event_date.split('-')
  const [hh, mm] = (form.value.event_time || '07:00').split(':')
  return `${y}-${m}-${d}T${hh}:${mm}:00`
}
function buildEventEndDate(): string | null {
  if (!form.value.event_end_date) return null
  const [y, m, d] = form.value.event_end_date.split('-')
  const [hh, mm] = (form.value.event_end_time || '07:00').split(':')
  return `${y}-${m}-${d}T${hh}:${mm}:00`
}
function buildInscriptionDeadline(): string | null {
  if (!form.value.inscription_deadline) return null
  return form.value.inscription_deadline + 'T23:59:59'
}

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    toast.error('El nombre del evento es obligatorio')
    return
  }
  if (!form.value.event_date) {
    toast.error('La fecha del evento es obligatoria')
    return
  }
  const validCats = form.value.categories.filter(c => c.name.trim())
  if (validCats.length === 0) {
    toast.error('Agrega al menos una categoría')
    return
  }

  saving.value = true
  try {
    const useFormData = heroImageFile.value || removeHeroImage.value || premiacionImageFile.value || removePremiacionImage.value ||
      tallaCamisaImageFile.value || removeTallaCamisaImage.value || cronogramaImageFile.value || removeCronogramaImage.value
    const body: Record<string, unknown> = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || null,
      kit_includes: form.value.kit_includes.trim() || null,
      event_date: buildEventDate(),
      event_end_date: buildEventEndDate(),
      inscription_deadline: buildInscriptionDeadline(),
      timezone: form.value.timezone || 'America/Bogota',
      location_city: form.value.location_city.trim() || null,
      location_region: form.value.location_region.trim() || null,
      location_country: form.value.location_country.trim() || null,
      bank_name: form.value.bank_name.trim() || null,
      bank_account: form.value.bank_account.trim() || null,
      precio_base: Number(form.value.precio_base) || 0,
      status: form.value.status,
      categories: validCats.map(c => ({
        id: c.id ?? undefined,
        name: c.name.trim(),
        edad_min: c.edad_min ?? null,
        edad_max: c.edad_max ?? null,
        precio: Number(c.precio) || 0,
      })),
    }
    if (isSuperAdmin.value && form.value.company_id) {
      body.company_id = form.value.company_id
    }
    if (useFormData) {
      const fd = new FormData()
      Object.entries(body).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
        }
      })
      if (removeHeroImage.value) fd.append('remove_hero_image', '1')
      if (heroImageFile.value) fd.append('hero_image', heroImageFile.value)
      if (removePremiacionImage.value) fd.append('remove_premiacion_image', '1')
      if (premiacionImageFile.value) fd.append('premiacion_image', premiacionImageFile.value)
      if (removeTallaCamisaImage.value) fd.append('remove_talla_camisa_image', '1')
      if (tallaCamisaImageFile.value) fd.append('talla_camisa_image', tallaCamisaImageFile.value)
      if (removeCronogramaImage.value) fd.append('remove_cronograma_image', '1')
      if (cronogramaImageFile.value) fd.append('cronograma_image', cronogramaImageFile.value)
      await $api(`/admin/events/${eventId.value}`, { method: 'PUT', body: fd })
    }
    else {
      await $api(`/admin/events/${eventId.value}`, { method: 'PUT', body })
    }
    toast.success('Evento actualizado correctamente')
    router.push('/admin/events')
  }
  catch (error: any) {
    const msg = error?.data?.message || Object.values(error?.data?.errors || {})?.[0]?.[0] || 'Error al actualizar el evento'
    toast.error(msg)
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  Promise.all([fetchEvent(), fetchCompanies()])
})
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Editar evento
        </h2>
        <p class="text-muted-foreground">
          Modifica los datos del evento
        </p>
      </div>
      <Button variant="outline" @click="router.push('/admin/events')">
        <Icon name="i-lucide-arrow-left" class="mr-2 h-4 w-4" />
        Volver
      </Button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Icon name="i-lucide-loader-2" class="size-8 animate-spin text-muted-foreground" />
    </div>

    <form v-else @submit.prevent="handleSubmit">
      <div class="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del evento</CardTitle>
            <CardDescription>
              Datos básicos del evento
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="isSuperAdmin" class="grid gap-2">
              <Label for="company">Empresa</Label>
              <Select v-model="form.company_id">
                <SelectTrigger id="company">
                  <SelectValue placeholder="Selecciona una empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="c in companies" :key="c.id" :value="c.id">
                    {{ c.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="grid gap-2">
              <Label for="name">Nombre del evento *</Label>
              <Input
                id="name"
                v-model="form.name"
                required
                placeholder="Ej: Reto 7K 2025"
              />
            </div>

            <div class="grid gap-2">
              <Label>Imagen hero (portada del evento)</Label>
              <p class="text-sm text-muted-foreground">
                Se muestra en la parte superior de la página del evento. JPG, PNG o WebP. Máx. 5 MB.
              </p>
              <div v-if="currentHeroImageUrl && !removeHeroImage && !heroImagePreview" class="relative rounded-lg border overflow-hidden max-w-xs aspect-video">
                <img :src="currentHeroImageUrl" alt="Hero actual" class="size-full object-cover">
              </div>
              <div v-if="heroImagePreview" class="relative rounded-lg border overflow-hidden max-w-xs aspect-video">
                <img :src="heroImagePreview" alt="Nueva imagen" class="size-full object-cover">
              </div>
              <div class="flex flex-wrap items-center gap-4">
                <Input
                  id="hero_image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="cursor-pointer max-w-xs"
                  @change="onHeroImageChange"
                />
                <label v-if="currentHeroImageUrl || heroImagePreview" class="flex items-center gap-2 text-sm cursor-pointer">
                  <input v-model="removeHeroImage" type="checkbox" class="rounded border-input">
                  Quitar imagen hero
                </label>
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="description">Descripción</Label>
              <textarea
                id="description"
                v-model="form.description"
                rows="4"
                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Detalles del evento"
              />
            </div>

            <div class="grid gap-2">
              <Label for="kit_includes">El KIT incluye</Label>
              <textarea
                id="kit_includes"
                v-model="form.kit_includes"
                rows="2"
                class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ej: Camiseta Oficial, Medalla Finisher, Hidratación"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label for="event_date">Fecha inicio *</Label>
                <Input
                  id="event_date"
                  v-model="form.event_date"
                  type="date"
                  required
                />
              </div>
              <div class="grid gap-2">
                <Label for="event_time">Hora inicio</Label>
                <Input
                  id="event_time"
                  v-model="form.event_time"
                  type="time"
                />
              </div>
              <div class="grid gap-2">
                <Label for="event_end_date">Fecha fin (opcional)</Label>
                <Input
                  id="event_end_date"
                  v-model="form.event_end_date"
                  type="date"
                />
              </div>
              <div class="grid gap-2">
                <Label for="event_end_time">Hora fin</Label>
                <Input
                  id="event_end_time"
                  v-model="form.event_end_time"
                  type="time"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label for="inscription_deadline">Fecha límite inscripción (opcional)</Label>
                <Input
                  id="inscription_deadline"
                  v-model="form.inscription_deadline"
                  type="date"
                />
              </div>
              <div class="grid gap-2">
                <Label for="timezone">Zona horaria</Label>
                <Input id="timezone" v-model="form.timezone" placeholder="America/Bogota" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="grid gap-2">
                <Label for="location_city">Ciudad</Label>
                <Input id="location_city" v-model="form.location_city" placeholder="Ej: San Gil" />
              </div>
              <div class="grid gap-2">
                <Label for="location_region">Departamento/Región</Label>
                <Input id="location_region" v-model="form.location_region" placeholder="Ej: Santander" />
              </div>
              <div class="grid gap-2">
                <Label for="location_country">País</Label>
                <Input id="location_country" v-model="form.location_country" placeholder="Colombia" />
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="precio_base">Precio base (COP) *</Label>
              <Input
                id="precio_base"
                v-model.number="form.precio_base"
                type="number"
                min="0"
                step="1000"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label for="bank_name">Banco</Label>
                <Input id="bank_name" v-model="form.bank_name" />
              </div>
              <div class="grid gap-2">
                <Label for="bank_account">Cuenta bancaria</Label>
                <Input id="bank_account" v-model="form.bank_account" />
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="status">Estado</Label>
              <Select v-model="form.status">
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    Activo
                  </SelectItem>
                  <SelectItem value="inactive">
                    Inactivo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imágenes adicionales</CardTitle>
            <CardDescription>
              Cuadro de premiación, tabla de tallas, cronograma
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="grid gap-2">
                <Label>Cuadro de premiación</Label>
                <div v-if="premiacionImageUrl && !removePremiacionImage" class="rounded border overflow-hidden max-w-[200px]">
                  <img :src="premiacionImageUrl" alt="Premiación" class="w-full">
                </div>
                <Input type="file" accept="image/jpeg,image/png,image/webp" @change="onPremiacionChange" />
                <label v-if="premiacionImageUrl" class="flex items-center gap-2 text-sm cursor-pointer">
                  <input v-model="removePremiacionImage" type="checkbox" class="rounded border-input">
                  Quitar
                </label>
              </div>
              <div class="grid gap-2">
                <Label>Tabla medidas camisetas</Label>
                <div v-if="tallaCamisaImageUrl && !removeTallaCamisaImage" class="rounded border overflow-hidden max-w-[200px]">
                  <img :src="tallaCamisaImageUrl" alt="Tallas" class="w-full">
                </div>
                <Input type="file" accept="image/jpeg,image/png,image/webp" @change="onTallaCamisaChange" />
                <label v-if="tallaCamisaImageUrl" class="flex items-center gap-2 text-sm cursor-pointer">
                  <input v-model="removeTallaCamisaImage" type="checkbox" class="rounded border-input">
                  Quitar
                </label>
              </div>
              <div class="grid gap-2">
                <Label>Cronograma inscripciones</Label>
                <div v-if="cronogramaImageUrl && !removeCronogramaImage" class="rounded border overflow-hidden max-w-[200px]">
                  <img :src="cronogramaImageUrl" alt="Cronograma" class="w-full">
                </div>
                <Input type="file" accept="image/jpeg,image/png,image/webp" @change="onCronogramaChange" />
                <label v-if="cronogramaImageUrl" class="flex items-center gap-2 text-sm cursor-pointer">
                  <input v-model="removeCronogramaImage" type="checkbox" class="rounded border-input">
                  Quitar
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>Categorías</CardTitle>
                <CardDescription>
                  Define categorías por edad y precio
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" @click="addCategory">
                <Icon name="i-lucide-plus" class="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-for="(cat, i) in form.categories"
              :key="i"
              class="flex gap-4 items-end"
            >
              <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="grid gap-2">
                  <Label>Nombre</Label>
                  <Input v-model="cat.name" placeholder="Ej: Abierta" />
                </div>
                <div class="grid gap-2">
                  <Label>Edad mín.</Label>
                  <Input v-model.number="cat.edad_min" type="number" min="0" max="120" placeholder="—" />
                </div>
                <div class="grid gap-2">
                  <Label>Edad máx.</Label>
                  <Input v-model.number="cat.edad_max" type="number" min="0" max="120" placeholder="—" />
                </div>
                <div class="grid gap-2">
                  <Label>Precio (COP)</Label>
                  <Input v-model.number="cat.precio" type="number" min="0" step="1000" placeholder="45000" />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                :disabled="form.categories.length <= 1"
                @click="removeCategory(i)"
              >
                <Icon name="i-lucide-trash-2" class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div class="flex gap-2">
          <Button type="submit" :disabled="saving">
            <Icon v-if="saving" name="i-lucide-loader-2" class="mr-2 h-4 w-4 animate-spin" />
            Guardar cambios
          </Button>
          <Button type="button" variant="outline" @click="router.push('/admin/events')">
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>
