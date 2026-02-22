export interface User {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  company_id?: number | null
  company?: { id: number; name: string; slug: string } | null
  roles?: string[]
  permissions?: string[]
  created_at: string
  updated_at: string
}

export interface PaginatedUsers {
  data: User[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    /** Límite de usuarios por empresa (solo para company_admin) */
    max_users_per_company?: number
  }
}
