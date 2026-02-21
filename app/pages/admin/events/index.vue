<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
  middleware: 'permission',
  permissions: 'events.view',
})

interface EventItem {
  id: number
  name: string
  slug: string
  company: { id: number; name: string; slug: string } | null
  event_date: string
  status: string
  precio_base: number
  registrations_count: number
}

const { $api } = useNuxtApp()
const router = useRouter()
const { hasPermission } = usePermissions()

const events = ref<EventItem[]>([])
const loading = ref(false)

const canCreate = computed(() => hasPermission('events.create'))
const canEdit = computed(() => hasPermission('events.edit'))
const canDelete = computed(() => hasPermission('events.delete'))

async function fetchEvents() {
  loading.value = true
  try {
    const res = await $api<{ data: EventItem[] }>('/admin/events')
    events.value = res.data
  }
  catch (error) {
    console.error('Error al cargar eventos:', error)
    toast.error('Error al cargar eventos')
  }
  finally {
    loading.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}

async function handleDelete(ev: EventItem) {
  if (!confirm(`¿Eliminar el evento "${ev.name}"? No se puede deshacer.`)) {
    return
  }
  try {
    await $api(`/admin/events/${ev.id}`, { method: 'DELETE' })
    toast.success('Evento eliminado correctamente')
    await fetchEvents()
  }
  catch (error: any) {
    const msg = error?.data?.message || 'Error al eliminar el evento'
    toast.error(msg)
  }
}

onMounted(() => {
  fetchEvents()
})
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">
        Eventos
      </h2>
      <PermissionGate permission="events.create">
        <Button @click="router.push('/admin/events/create')">
          <Icon name="i-lucide-plus" class="mr-2 h-4 w-4" />
          Nuevo evento
        </Button>
      </PermissionGate>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Lista de eventos</CardTitle>
        <CardDescription>
          Crea y gestiona los eventos deportivos. Los usuarios pueden inscribirse a uno o varios eventos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center py-12">
          <Icon name="i-lucide-loader-2" class="size-8 animate-spin text-muted-foreground" />
        </div>

        <div v-else-if="events.length === 0" class="py-12 text-center text-muted-foreground">
          <Icon name="i-lucide-calendar-x" class="size-12 mx-auto mb-4 opacity-50" />
          <p>No hay eventos creados.</p>
          <PermissionGate permission="events.create">
            <Button variant="outline" class="mt-4" @click="router.push('/admin/events/create')">
              Crear primer evento
            </Button>
          </PermissionGate>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="ev in events"
            :key="ev.id"
            class="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
          >
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold truncate">
                {{ ev.name }}
              </h3>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ formatDate(ev.event_date) }}
              </p>
              <div class="flex gap-2 mt-2">
                <Badge v-if="ev.company" variant="secondary">
                  {{ ev.company.name }}
                </Badge>
                <Badge :variant="ev.status === 'active' ? 'default' : 'outline'">
                  {{ ev.status === 'active' ? 'Activo' : 'Inactivo' }}
                </Badge>
                <span class="text-sm text-muted-foreground">
                  {{ ev.registrations_count }} inscripciones
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-emerald-600">
                {{ formatPrice(ev.precio_base) }}
              </span>
              <PermissionGate permission="events.edit">
                <Button variant="outline" size="icon" @click="router.push(`/admin/events/${ev.id}/edit`)">
                  <Icon name="i-lucide-pencil" class="h-4 w-4" />
                </Button>
              </PermissionGate>
              <PermissionGate permission="events.delete">
                <Button
                  variant="outline"
                  size="icon"
                  @click="handleDelete(ev)"
                >
                  <Icon name="i-lucide-trash-2" class="h-4 w-4 text-destructive" />
                </Button>
              </PermissionGate>
              <NuxtLink :to="`/${ev.slug}`" target="_blank">
                <Button variant="ghost" size="icon">
                  <Icon name="i-lucide-external-link" class="h-4 w-4" />
                </Button>
              </NuxtLink>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
