export default defineNuxtRouteMiddleware(async (to) => {
  const guestOnly = new Set(['/login', '/forgot-password', '/reset-password', '/register'])
  const protectedPrefixes = ['/dashboard', '/admin', '/settings', '/users', '/roles', '/audit']

  const isProtected = protectedPrefixes.some(prefix => to.path === prefix || to.path.startsWith(`${prefix}/`))

  // En el servidor
  if (import.meta.server) {
    return
  }

  const { user, fetchUser } = useAuth()

  // Páginas solo para invitados (login, register): si ya está logueado, redirigir
  if (guestOnly.has(to.path)) {
    const checked = useState<boolean>('auth.checked', () => false)
    if (!checked.value) {
      try {
        await fetchUser()
      } catch {
        user.value = null
      } finally {
        checked.value = true
      }
    }
    if (user.value) {
      return navigateTo('/dashboard')
    }
    return
  }

  // Rutas protegidas: requieren autenticación
  if (isProtected) {
    const checked = useState<boolean>('auth.checked', () => false)
    if (!checked.value) {
      try {
        await fetchUser()
      } catch {
        user.value = null
        checked.value = true
        return navigateTo('/login')
      } finally {
        checked.value = true
      }
    }
    if (!user.value) {
      return navigateTo('/login')
    }
  }
})
