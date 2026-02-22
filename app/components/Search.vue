<script setup lang="ts">
import type { NavGroup, NavLink, NavMenu } from '~/types/nav'
import { navMenu } from '@/constants/menus'

const { metaSymbol } = useShortcuts()
const { hasPermission, hasAnyPermission, isAdmin } = usePermissions()
const { user } = useAuth()

const openCommand = ref(false)
const router = useRouter()
const search = ref('')

function canAccess(item: NavLink | NavGroup): boolean {
  if (import.meta.server || !user.value) return false
  if (isAdmin.value) return true
  if (item.adminOnly) return false
  if (!item.permission && !item.anyPermission && !item.role && !item.anyRole) return true
  if (item.permission && !hasPermission(item.permission)) return false
  if (item.anyPermission?.length && !hasAnyPermission(item.anyPermission)) return false
  return true
}

function flattenNavItems(): { title: string; link: string; icon?: string }[] {
  const items: { title: string; link: string; icon?: string }[] = []
  for (const section of navMenu) {
    for (const item of section.items) {
      if ('children' in item) {
        for (const child of item.children) {
          if (canAccess(child) && 'link' in child) {
            items.push({ title: child.title, link: child.link, icon: child.icon })
          }
        }
      } else if (canAccess(item) && 'link' in item) {
        items.push({ title: item.title, link: item.link, icon: item.icon })
      }
    }
  }
  return items
}

const allNavItems = computed(() => flattenNavItems())

const filteredItems = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return allNavItems.value
  return allNavItems.value.filter(i => i.title.toLowerCase().includes(q))
})

function handleSelect(link: string) {
  router.push(link)
  openCommand.value = false
  search.value = ''
}
</script>

<template>
  <SidebarMenuButton as-child tooltip="Buscar en menú">
    <Button variant="outline" size="sm" class="text-xs" @click="openCommand = !openCommand">
      <Icon name="i-lucide-search" />
      <span class="font-normal group-data-[collapsible=icon]:hidden">Buscar en menú</span>
      <div class="ml-auto flex items-center space-x-0.5 group-data-[collapsible=icon]:hidden">
        <Kbd>{{ metaSymbol }}</Kbd>
        <Kbd>K</Kbd>
      </div>
    </Button>
  </SidebarMenuButton>

  <CommandDialog v-model:open="openCommand">
    <CommandInput v-model="search" placeholder="Buscar página..." />
    <CommandList>
      <CommandEmpty>No se encontraron resultados.</CommandEmpty>
      <CommandGroup heading="Menú">
        <CommandItem
          v-for="item in filteredItems"
          :key="item.link"
          :value="item.title"
          class="gap-2"
          @select="handleSelect(item.link)"
        >
          <Icon :name="item.icon || 'i-lucide-circle'" class="size-4" />
          {{ item.title }}
        </CommandItem>
      </CommandGroup>
    </CommandList>
  </CommandDialog>
</template>

<style scoped>

</style>
