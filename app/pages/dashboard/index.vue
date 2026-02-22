<script setup lang="ts">
const { user } = useAuth()
const { roles, permissions, isAdmin } = usePermissions()
const { $api } = useNuxtApp()

const loading = ref(true)
const stats = ref<{
  companies: Array<{
    company_name: string
    total_sales: number
    total_commission: number
    pending_amount: number
    next_payment_due: string | null
    next_payment_amount: number | null
    next_payment_period: string | null
  }>
  summary: {
    total_sales: number
    total_commission: number
    pending_amount: number
  }
  bank_account: {
    bank: string
    account_number: string
    account_type: string
  }
  commission_rate: number
} | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await $api<{ data: typeof stats.value }>('/admin/dashboard')
    stats.value = res.data
  }
  catch {
    stats.value = null
  }
  finally {
    loading.value = false
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
}

onMounted(fetchData)
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">
        Dashboard
      </h2>
    </div>

    <main class="@container/main flex flex-1 flex-col gap-4 md:gap-8">
      <!-- Tarjetas de comisiones -->
      <div v-if="stats && (stats.summary.total_sales > 0 || stats.summary.pending_amount > 0)" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Ventas totales</CardDescription>
            <CardTitle class="text-2xl">
              {{ formatCurrency(stats.summary.total_sales) }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-xs text-muted-foreground">
              Suma de inscripciones aprobadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Comisión ({{ stats.commission_rate }}%)</CardDescription>
            <CardTitle class="text-2xl">
              {{ formatCurrency(stats.summary.total_commission) }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-xs text-muted-foreground">
              Total generado por la plataforma
            </p>
          </CardContent>
        </Card>
        <Card class="border-amber-500/30">
          <CardHeader>
            <CardDescription>Pendiente de pago</CardDescription>
            <CardTitle class="text-2xl text-amber-400">
              {{ formatCurrency(stats.summary.pending_amount) }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-xs text-muted-foreground">
              Comisiones por consignar
            </p>
          </CardContent>
        </Card>
        <Card v-if="stats.summary.pending_amount > 0">
          <CardHeader>
            <CardDescription>Próximo vencimiento</CardDescription>
            <CardTitle class="text-lg">
              {{ stats.companies[0]?.next_payment_due ? new Date(stats.companies[0].next_payment_due).toLocaleDateString('es-CO') : '—' }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-xs text-muted-foreground">
              {{ stats.companies[0]?.next_payment_period ?? 'Sin período pendiente' }}
            </p>
            <p v-if="stats.companies[0]?.next_payment_amount" class="mt-2 font-semibold text-amber-400">
              {{ formatCurrency(stats.companies[0].next_payment_amount) }}
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Cuenta bancaria para consignación -->
      <Card v-if="stats && stats.summary.pending_amount > 0" class="border-emerald-500/20">
        <CardHeader>
          <CardTitle>Consignar comisión</CardTitle>
          <CardDescription>
            Realiza la consignación o transferencia a la siguiente cuenta
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-2">
          <p><span class="text-muted-foreground">Banco:</span> {{ stats.bank_account.bank }}</p>
          <p><span class="text-muted-foreground">Cuenta:</span> {{ stats.bank_account.account_number }}</p>
          <p><span class="text-muted-foreground">Tipo:</span> {{ stats.bank_account.account_type }}</p>
          <p class="text-xs text-muted-foreground mt-2">
            Incluye como referencia el período (mes y año) al que corresponde el pago.
          </p>
        </CardContent>
      </Card>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Bienvenido</CardDescription>
            <CardTitle class="text-xl">
              {{ user?.name ?? 'Usuario' }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              Gestiona inscripciones, aprueba comprobantes y mantén el control de tus eventos deportivos.
            </p>
          </CardContent>
          <CardFooter>
            <Button as-child>
              <NuxtLink to="/admin/registrations">
                Ver inscripciones
                <Icon name="i-lucide-arrow-right" class="ml-2 size-4" />
              </NuxtLink>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <PermissionGate admin-only>
        <Card>
          <CardHeader>
            <CardTitle>Información de Acceso</CardTitle>
            <CardDescription>
              Roles y permisos del usuario actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div>
                <div class="mb-2 text-sm font-medium">Roles:</div>
                <div class="flex flex-wrap gap-2">
                  <Badge v-for="role in roles" :key="role" variant="default">
                    {{ role }}
                  </Badge>
                  <Badge v-if="roles.length === 0" variant="outline">
                    Sin roles asignados
                  </Badge>
                </div>
              </div>
              <div>
                <div class="mb-2 text-sm font-medium">Permisos ({{ permissions.length }}):</div>
                <div class="flex max-h-32 flex-wrap gap-1 overflow-y-auto">
                  <Badge v-for="permission in permissions" :key="permission" variant="outline" class="text-xs">
                    {{ permission }}
                  </Badge>
                  <Badge v-if="permissions.length === 0" variant="outline">
                    Sin permisos asignados
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PermissionGate>
    </main>
  </div>
</template>
