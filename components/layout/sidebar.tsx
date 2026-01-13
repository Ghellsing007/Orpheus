"use client"

import { Home, Search, Library, Heart, Clock, Plus, LogIn, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useSettings } from "@/contexts/settings-context"
import { OrpheusLogo } from "@/components/ui/orpheus-logo"
import { AuthModal } from "@/components/auth/auth-modal"
import { AvatarInitials } from "@/components/ui/avatar-initials"
import { CreatePlaylistModal } from "@/components/playlists/create-playlist-modal"
import { AdSlot } from "@/components/ui/ad-slot"

const navItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/search", icon: Search, label: "Buscar" },
  { href: "/community", icon: Search, label: "Comunidad" }, // Icon will be changed manually later or kept for now
  { href: "/magazine", icon: Search, label: "Revista" },
]

const libraryItems = [
  { href: "/library", icon: Library, label: "Tu biblioteca" },
  { href: "/library/liked", icon: Heart, label: "Canciones favoritas" },
  { href: "/library/recent", icon: Clock, label: "Reproducido reciente" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { userId, setUserId, profile, setProfile, role } = useSettings()
  const [authOpen, setAuthOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [appVersion, setAppVersion] = useState<string | null>(null)

  const handleCreatePlaylist = async () => {
    if (!userId || role === "guest") {
      setAuthOpen(true)
      return
    }
    setCreateOpen(true)
  }

  const handleProtectedNav = (e: React.MouseEvent, requiresAuth: boolean) => {
    if (requiresAuth && role === "guest") {
      e.preventDefault()
      setAuthOpen(true)
    }
  }

  useEffect(() => {
    fetch("/version.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("version not found")
        return res.json()
      })
      .then((data) => {
        if (data?.version) setAppVersion(data.version)
      })
      .catch(() => {})
  }, [])

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-full bg-background-elevated border-r border-border">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <OrpheusLogo />
      </div>

      {/* Navigation */}
      <nav className="px-2 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleProtectedNav(e, false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                isActive
                  ? "bg-primary/20 text-foreground shadow-sm border border-primary/20"
                  : "text-foreground-muted hover:text-foreground hover:bg-card/60",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium flex-1 text-sm">{label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mx-4 my-4 h-px bg-border" />

      {/* Library */}
      <nav className="px-2 space-y-1">
        {libraryItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleProtectedNav(e, true)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                isActive
                  ? "bg-primary/20 text-foreground shadow-sm border border-primary/20"
                  : "text-foreground-muted hover:text-foreground hover:bg-card/60",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium flex-1 text-sm">{label}</span>
            </Link>
          )
        })}

        <button
          onClick={handleCreatePlaylist}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-foreground-muted hover:text-foreground hover:bg-card/60 transition-all mt-1"
        >
          <div className="w-6 h-6 rounded-lg bg-card flex items-center justify-center border border-border">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-medium">Crear playlist</span>
        </button>
      </nav>

      <div className="mx-4 my-4 h-px bg-border" />

      {/* Settings */}
      <nav className="px-2 space-y-1">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
            pathname === "/settings"
              ? "bg-primary/20 text-foreground shadow-sm border border-primary/20"
              : "text-foreground-muted hover:text-foreground hover:bg-card/60",
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Ajustes</span>
        </Link>
        <div className="px-4 mt-2">
          <AdSlot type="sidebar" className="h-32" />
        </div>
      </nav>

      {/* CTA */}
      <div className="px-4 py-5">
        {role !== "guest" && userId ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-border" />
            ) : (
              <AvatarInitials name={profile?.displayName || profile?.username || userId} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.displayName || profile?.username || userId}</p>
              <p className="text-xs text-foreground-muted truncate">Sesión activa</p>
            </div>
            <button
              onClick={() => {
                setUserId("")
                setProfile(null)
              }}
              className="text-xs text-foreground-muted hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setAuthOpen(true)}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-full bg-card border border-border text-foreground hover:bg-card/70 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-semibold">Iniciar sesión</span>
            </button>
            <p className="text-xs text-foreground-muted text-center mt-2">
              Inicia sesión para crear playlists y guardar tu música favorita
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border space-y-2 text-xs text-foreground-muted text-center">
        <Link href="/billing" className="block hover:text-foreground transition-colors">
          Planes y Facturación
        </Link>
        <Link href="/help" className="block hover:text-foreground transition-colors">
          ¿Necesitas ayuda?
        </Link>
        <div className="flex justify-center gap-2 flex-wrap">
          <Link href="/legal/privacy" className="hover:text-foreground underline underline-offset-2">Privacidad</Link>
          <span className="text-foreground-subtle">•</span>
          <Link href="/legal/terms" className="hover:text-foreground underline underline-offset-2">Términos</Link>
          <span className="text-foreground-subtle">•</span>
          <Link href="/legal/copyright" className="hover:text-foreground underline underline-offset-2">DMCA</Link>
        </div>
        <Link href="/contact" className="block hover:text-foreground transition-colors pt-1">
          Contacto
        </Link>
        <p className="pt-2 text-[11px]">&copy; 2024 Orpheus</p>
        {appVersion && (
          <p className="text-[11px]">Versión {appVersion}</p>
        )}
        <p className="text-[11px]">
          Powered by{" "}
          <a href="https://www.gvslabs.cloud/" target="_blank" rel="noreferrer" className="hover:text-foreground underline-offset-2 hover:underline">
            GVSLabs
          </a>
        </p>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <CreatePlaylistModal open={createOpen} onClose={() => setCreateOpen(false)} userId={userId} />
    </aside>
  )
}
