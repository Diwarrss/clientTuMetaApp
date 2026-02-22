import type { NavMenu, NavMenuItems } from '~/types/nav'

export const navMenu: NavMenu[] = [
  {
    heading: 'General',
    items: [
      {
        title: 'Dashboard',
        icon: 'i-lucide-home',
        link: '/dashboard',
      },
    ],
  },
  {
    heading: 'Eventos',
    items: [
      {
        title: 'Eventos',
        icon: 'i-lucide-calendar',
        link: '/admin/events',
        permission: 'events.view',
      },
      {
        title: 'Inscripciones',
        icon: 'i-lucide-clipboard-list',
        link: '/admin/registrations',
        permission: 'manage_registrations',
      },
      {
        title: 'Mi empresa',
        icon: 'i-lucide-building-2',
        link: '/admin/company',
        permission: 'events.view',
      },
      {
        title: 'Contrato',
        icon: 'i-lucide-file-signature',
        link: '/admin/contract',
        permission: 'events.view',
      },
    ],
  },
  {
    heading: 'Administración',
    items: [
      {
        title: 'Usuarios',
        icon: 'i-lucide-users',
        link: '/admin/users',
        permission: 'users.view',
      },
      {
        title: 'Roles y Permisos',
        icon: 'i-lucide-shield-check',
        link: '/admin/roles',
        permission: 'roles.view',
      },
      {
        title: 'Auditoría',
        icon: 'i-lucide-file-text',
        link: '/admin/audit',
        permission: 'admin.access',
      },
    ],
  },
  {
    heading: 'Configuración',
    items: [
      {
        title: 'Mi perfil',
        icon: 'i-lucide-user',
        link: '/settings/profile',
      },
      {
        title: 'Apariencia',
        icon: 'i-lucide-paintbrush',
        link: '/settings/appearance',
      },
    ],
  },
]

export const navMenuBottom: NavMenuItems = []
