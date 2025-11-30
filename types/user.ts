export type UserProfile = {
  userId: string
  displayName?: string | null
  username?: string | null
  email?: string | null
  avatarUrl?: string | null
  role?: "guest" | "user" | "admin" | string
  phone?: string | null
}
