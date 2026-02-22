<script setup lang="ts">
const { user } = useAuth()
const { $api } = useNuxtApp()
const route = useRoute()

const contractAccepted = useState<boolean | null>('contract.accepted', () => null)

const showBanner = computed(() => {
  const isSuperAdmin = user.value?.roles?.includes('super_admin') ?? false
  const isContractPage = route.path === '/admin/contract'
  return !isSuperAdmin && !isContractPage && contractAccepted.value === false
})

async function fetchContract() {
  try {
    const res = await $api<{ data: { accepted: boolean } }>('/admin/contract')
    contractAccepted.value = res.data.accepted
  }
  catch {
    contractAccepted.value = true
  }
}

onMounted(fetchContract)
</script>

<template>
  <div
    v-if="showBanner"
    class="rounded-lg border border-amber-500/40 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="font-medium text-amber-800 dark:text-amber-200">
          Debes aceptar el contrato de prestación de servicios
        </p>
        <p class="mt-1 text-sm text-amber-700 dark:text-slate-400">
          Para crear eventos y utilizar la plataforma necesitas aceptar primero el contrato legal.
        </p>
      </div>
      <div class="shrink-0">
        <NuxtLink to="/admin/contract">
          <Button variant="default">
            Aceptar contrato
          </Button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
