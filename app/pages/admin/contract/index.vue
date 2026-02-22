<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'default',
  middleware: 'permission',
  permissions: 'events.view'
})

const { $api } = useNuxtApp()
const router = useRouter()
const loading = ref(true)
const accepting = ref(false)
const contract = ref<{
  contract_text: string
  contract_version: string
  accepted: boolean
  accepted_at: string | null
  accepted_contract_text?: string | null
} | null>(null)

const fetchContract = async () => {
  loading.value = true
  try {
    const res = await $api<{ data: typeof contract.value }>('/admin/contract')
    contract.value = res.data
  }
  catch (e: any) {
    if (e?.statusCode === 404 || e?.status === 404) {
      toast.error('No tienes empresa asignada')
      router.push('/admin/company')
    }
    else {
      toast.error('Error al cargar el contrato')
    }
  }
  finally {
    loading.value = false
  }
}

const handleAccept = async () => {
  accepting.value = true
  try {
    await $api('/admin/contract/accept', { method: 'POST' })
    toast.success('Contrato aceptado correctamente')
    useState<boolean | null>('contract.accepted', () => null).value = true
    await fetchContract()
    router.push('/dashboard')
  }
  catch (e: any) {
    toast.error(e?.data?.message || 'Error al aceptar el contrato')
  }
  finally {
    accepting.value = false
  }
}

onMounted(fetchContract)
</script>

<template>
  <div class="w-full max-w-4xl mx-auto space-y-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight text-foreground">
        Contrato de Prestación de Servicios
      </h2>
      <p class="text-muted-foreground mt-1">
        {{ contract?.accepted ? 'Contrato aceptado. A continuación el documento firmado.' : 'Debes aceptar el contrato para utilizar la plataforma y crear eventos.' }}
      </p>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Icon name="i-lucide-loader-2" class="size-8 animate-spin text-muted-foreground" />
    </div>

    <template v-else-if="contract">
      <div v-if="contract.accepted" class="space-y-4">
        <div class="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p class="font-medium text-emerald-800 dark:text-emerald-200">
            Contrato aceptado el {{ contract.accepted_at ? new Date(contract.accepted_at).toLocaleString('es-CO') : '' }}
          </p>
        </div>

        <Card v-if="contract.accepted_contract_text">
          <CardHeader>
            <CardTitle class="text-foreground">Documento aceptado</CardTitle>
            <CardDescription>
              Este es el texto del contrato que aceptaste y firmaste electrónicamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-muted/30 p-6 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
              {{ contract.accepted_contract_text }}
            </div>
            <div class="mt-4">
              <Button variant="outline" @click="router.push('/dashboard')">
                Volver al Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <div v-else class="flex justify-start">
          <Button variant="outline" @click="router.push('/dashboard')">
            Volver al Dashboard
          </Button>
        </div>
      </div>

      <Card v-else>
        <CardHeader>
          <CardTitle class="text-foreground">Lee y acepta el contrato</CardTitle>
          <CardDescription>
            La aceptación mediante clic tiene validez legal en Colombia (Ley 527 de 1999).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-muted/30 p-6 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {{ contract.contract_text }}
          </div>

          <div class="mt-6 flex flex-col gap-4">
            <p class="text-sm text-muted-foreground">
              Al hacer clic en "Aceptar contrato" confirmas que has leído, comprendido y aceptas los términos establecidos.
            </p>
            <Button
              size="lg"
              :disabled="accepting"
              @click="handleAccept"
            >
              <Icon v-if="accepting" name="i-lucide-loader-2" class="mr-2 size-4 animate-spin" />
              Aceptar contrato
            </Button>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
