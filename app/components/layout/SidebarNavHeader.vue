<script setup lang="ts">
const { user } = useAuth()
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <NuxtLink to="/dashboard" class="block">
        <SidebarMenuButton size="lg" class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
          <div class="aspect-square size-8 flex items-center justify-center rounded-lg bg-emerald-500 text-white">
            <Icon name="i-lucide-calendar-plus" class="size-4" />
          </div>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-semibold">Tu Meta</span>
            <span class="truncate text-xs text-muted-foreground">{{ user?.name || 'Plataforma' }}</span>
          </div>
        </SidebarMenuButton>
      </NuxtLink>
    </SidebarMenuItem>
  </SidebarMenu>
</template>

<style scoped>

</style>
