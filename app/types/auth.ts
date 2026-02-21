export interface AuthUser {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
  company_id?: number | null
  company?: { id: number; name: string; slug: string } | null
  roles?: string[]
  permissions?: string[]
}
