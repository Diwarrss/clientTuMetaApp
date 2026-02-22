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
        title: 'Ajustes',
        icon: 'i-lucide-settings',
        children: [
          {
            title: 'Perfil',
            icon: 'i-lucide-circle',
            link: '/settings/profile',
          },
          {
            title: 'Cuenta',
            icon: 'i-lucide-circle',
            link: '/settings/account',
          },
          {
            title: 'Apariencia',
            icon: 'i-lucide-circle',
            link: '/settings/appearance',
          },
          {
            title: 'Notificaciones',
            icon: 'i-lucide-circle',
            link: '/settings/notifications',
          },
          {
            title: 'Pantalla',
            icon: 'i-lucide-circle',
            link: '/settings/display',
          },
        ],
      },
    ],
  },
]

export const navMenuBottom: NavMenuItems = []
