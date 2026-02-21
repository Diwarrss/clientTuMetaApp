<script setup lang="ts">
definePageMeta({
  middleware: 'permission',
  permissions: 'manage_registrations',
})

interface Registration {
  id: number
  event: { id: number; name: string; slug: string; event_date: string; company?: { id: number; name: string; slug: string } } | null
  user: { id: number; name: string; email: string } | null
  category: { id: number; name: string } | null
  identificacion: string
  eps: string | null
  talla_camisa: string | null
  comprobante_url: string | null
  estado: string
  notas_admin: string | null
  created_at: string
}

const { $api } = useNuxtApp()

const registrations = ref<Registration[]>([])
const meta = ref({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
const loading = ref(true)
const search = ref('')
const estadoFilter = ref('')
const eventFilter = ref('')

const fetchRegistrations = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (search.value) params.search = search.value
    if (estadoFilter.value) params.estado = estadoFilter.value
    if (eventFilter.value) params.event_id = eventFilter.value
    params.page = String(meta.value.current_page)
    params.per_page = String(meta.value.per_page)

    const res = await $api<{ data: Registration[]; meta: typeof meta.value }>('/admin/registrations', {
      query: params,
    })
    registrations.value = res.data
    meta.value = res.meta
  }
  catch (e) {
    console.error(e)
  }
  finally {
    loading.value = false
  }
}

const events = ref<Array<{ id: number; name: string; slug: string }>>([])
const fetchEvents = async () => {
  try {
    const res = await $api<{ data: Array<{ id: number; name: string; slug: string }> }>('/admin/events')
    events.value = res.data
  }
  catch {
    events.value = []
  }
}

const comprobanteDialogOpen = ref(false)
const selectedComprobanteUrl = ref<string | null>(null)

function openComprobante(url: string | null) {
  selectedComprobanteUrl.value = url
  comprobanteDialogOpen.value = !!url
}

const rejectDialogOpen = ref(false)
const rejectNotes = ref('')
const registrationToReject = ref<Registration | null>(null)

function openRejectDialog(reg: Registration) {
  registrationToReject.value = reg
  rejectNotes.value = ''
  rejectDialogOpen.value = true
}

async function confirmReject() {
  if (!registrationToReject.value) return
  try {
    await $api(`/admin/registrations/${registrationToReject.value.id}/status`, {
      method: 'PUT',
      body: { estado: 'rejected', notas_admin: rejectNotes.value },
    })
    rejectDialogOpen.value = false
    registrationToReject.value = null
    await fetchRegistrations()
  }
  catch (e) {
    console.error(e)
  }
}

async function approveRegistration(reg: Registration) {
  try {
    await $api(`/admin/registrations/${reg.id}/status`, {
      method: 'PUT',
      body: { estado: 'approved' },
    })
    await fetchRegistrations()
  }
  catch (e) {
    console.error(e)
  }
}

function estadoBadgeVariant(estado: string) {
  switch (estado) {
    case 'approved': return 'default'
    case 'rejected': return 'destructive'
    default: return 'secondary'
  }
}

function estadoLabel(estado: string) {
  switch (estado) {
    case 'approved': return 'Aprobada'
    case 'rejected': return 'Rechazada'
    default: return 'Pendiente'
  }
}

onMounted(() => {
  fetchEvents()
  fetchRegistrations()
})

watch([search, estadoFilter, eventFilter], () => {
  meta.value.current_page = 1
  fetchRegistrations()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="text-2xl font-bold tracking-tight">
        Inscripciones
      </h2>
    </div>

    <div class="flex flex-wrap gap-4">
      <Input
        v-model="search"
        placeholder="Buscar por nombre, email o identificación..."
        class="max-w-sm"
      />
      <Select v-model="estadoFilter">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">
            Todos
          </SelectItem>
          <SelectItem value="pending">
            Pendiente
          </SelectItem>
          <SelectItem value="approved">
            Aprobada
          </SelectItem>
          <SelectItem value="rejected">
            Rechazada
          </SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="eventFilter">
        <SelectTrigger class="w-[200px]">
          <SelectValue placeholder="Evento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">
            Todos
          </SelectItem>
          <SelectItem v-for="e in events" :key="e.id" :value="String(e.id)">
            {{ e.name }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <Card>
      <CardContent class="p-0">
        <div v-if="loading" class="flex justify-center py-12">
          <Icon name="i-lucide-loader-2" class="size-8 animate-spin text-muted-foreground" />
        </div>
        <div v-else-if="registrations.length === 0" class="py-12 text-center text-muted-foreground">
          No hay inscripciones
        </div>
        <div v-else class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Participante</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Identificación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead class="w-[120px]">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="reg in registrations" :key="reg.id">
                <TableCell>
                  <NuxtLink :to="`/${reg.event?.slug}`" class="hover:underline">
                    {{ reg.event?.name }}
                  </NuxtLink>
                  <div v-if="reg.event?.company" class="text-xs text-muted-foreground">
                    {{ reg.event.company.name }}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{{ reg.user?.name }}</div>
                  <div class="text-xs text-muted-foreground">
                    {{ reg.user?.email }}
                  </div>
                </TableCell>
                <TableCell>{{ reg.category?.name }}</TableCell>
                <TableCell>{{ reg.identificacion }}</TableCell>
                <TableCell>
                  <Badge :variant="estadoBadgeVariant(reg.estado)">
                    {{ estadoLabel(reg.estado) }}
                  </Badge>
                </TableCell>
                <TableCell class="text-sm text-muted-foreground">
                  {{ new Date(reg.created_at).toLocaleDateString('es-CO') }}
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Button
                      v-if="reg.comprobante_url"
                      variant="outline"
                      size="icon"
                      @click="openComprobante(reg.comprobante_url)"
                    >
                      <Icon name="i-lucide-image" class="size-4" />
                    </Button>
                    <template v-if="reg.estado === 'pending'">
                      <Button
                        variant="default"
                        size="sm"
                        @click="approveRegistration(reg)"
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        @click="openRejectDialog(reg)"
                      >
                        Rechazar
                      </Button>
                    </template>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <Dialog v-model:open="comprobanteDialogOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comprobante de pago</DialogTitle>
        </DialogHeader>
        <div v-if="selectedComprobanteUrl" class="flex justify-center">
          <img
            v-if="selectedComprobanteUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)"
            :src="selectedComprobanteUrl"
            alt="Comprobante"
            class="max-h-[70vh] rounded-lg object-contain"
          >
          <a
            v-else
            :href="selectedComprobanteUrl"
            target="_blank"
            rel="noopener"
            class="text-primary hover:underline"
          >
            Ver comprobante (PDF)
          </a>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="rejectDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar inscripción</DialogTitle>
          <DialogDescription>
            Las notas son obligatorias al rechazar. Indica el motivo al participante.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="reject-notes">Notas (motivo del rechazo)</Label>
            <Textarea
              id="reject-notes"
              v-model="rejectNotes"
              placeholder="Ej: El comprobante no corresponde al valor del evento..."
              rows="4"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="rejectDialogOpen = false">
            Cancelar
          </Button>
          <Button
            variant="destructive"
            :disabled="!rejectNotes.trim()"
            @click="confirmReject"
          >
            Rechazar inscripción
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
