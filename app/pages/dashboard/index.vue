<script setup lang="ts">
const { user } = useAuth()
const { roles, permissions, isAdmin } = usePermissions()
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">
        Dashboard
      </h2>
    </div>
    <main class="@container/main flex flex-1 flex-col gap-4 md:gap-8">
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
