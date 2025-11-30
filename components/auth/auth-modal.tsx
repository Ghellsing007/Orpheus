"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import { OrpheusLogo } from "@/components/ui/orpheus-logo"
import { AvatarInitials } from "@/components/ui/avatar-initials"
import { api } from "@/services/api"
import { saveSettings } from "@/lib/storage"
import { useSettings } from "@/contexts/settings-context"

type AuthMode = "login" | "register"

type AuthModalProps = {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const { setUserId, setProfile } = useSettings()
  const [mode, setMode] = useState<AuthMode>("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userIdInput, setUserIdInput] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrlInput, setAvatarUrlInput] = useState("")

  if (!open) return null

  const initialsName = displayName || username || "Orpheus"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === "register") {
        const newUserId = userIdInput.trim()
        if (!newUserId) {
          throw new Error("Necesitas definir un usuario o ID para registrarte.")
        }
        const res = await api.registerUser({
          userId: newUserId,
          displayName: displayName || username || "Mi Cuenta",
          username: username || undefined,
          email: email || undefined,
          phone: phone || undefined,
          avatarUrl: avatarUrlInput || undefined,
          role: "user",
        })
        setUserId(res.userId)
        setProfile(res)
        saveSettings({}) // trigger storage refresh
        onClose()
      } else {
        const id = userIdInput.trim()
        if (!id && !username && !email) {
          throw new Error("Ingresa tu usuario/ID, username o email para iniciar sesión.")
        }
        const res = await api.loginUser({
          userId: id || undefined,
          username: username || undefined,
          email: email || undefined,
        })
        if ((res.role ?? "guest") === "guest") {
          throw new Error("Debes registrarte para iniciar sesión.")
        }
        setUserId(res.userId)
        setProfile(res)
        onClose()
      }
    } catch (err: any) {
      setError(err?.message ?? "No pudimos completar la acción")
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <OrpheusLogo size={40} showText={false} />
            <div>
              <p className="text-sm font-semibold">
                {mode === "login" ? "Iniciar sesión en Orpheus" : "Crear tu cuenta"}
              </p>
              <p className="text-xs text-foreground-muted">
                {mode === "login" ? "Bienvenido de vuelta" : "Completa tus datos para empezar"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-card/80 flex items-center justify-center text-foreground-muted"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {mode === "register" && (
            <div className="flex items-center gap-3">
              {avatarUrlInput ? (
                <img
                  src={avatarUrlInput}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border border-border"
                />
              ) : (
                <AvatarInitials name={initialsName} size={48} />
              )}
              <div className="text-sm text-foreground-muted">
                Opcional: agrega un avatar con URL o usa las iniciales
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <label className="text-xs text-foreground-muted">
              Usuario o ID
              <input
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                placeholder={mode === "login" ? "user_123 o email/username" : "Define tu ID único"}
                className="mt-1 w-full h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>

            {mode === "register" && (
              <>
                <label className="text-xs text-foreground-muted">
                  Nombre a mostrar
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tu nombre"
                    className="mt-1 w-full h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <label className="text-xs text-foreground-muted">
                  Username (opcional)
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="usuario"
                    className="mt-1 w-full h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <label className="text-xs text-foreground-muted">
                  Email (opcional)
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="mt-1 w-full h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <label className="text-xs text-foreground-muted">
                  Teléfono (opcional)
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="mt-1 w-full h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <label className="text-xs text-foreground-muted">
                  Avatar URL (opcional)
                  <input
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 w-full h-10 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
              </>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Procesando..." : mode === "login" ? "Continuar" : "Registrarse"}
          </button>

          <div className="text-center text-xs text-foreground-muted">
            {mode === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-primary hover:underline font-semibold"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary hover:underline font-semibold"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
