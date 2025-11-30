"use client"

import { Home, Search, Library, Heart, Clock, Plus, LogIn, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { api } from "@/services/api"
import type { Song } from "@/types"
import { getRecentlyPlayed } from "@/lib/storage"
import { useSettings } from "@/contexts/settings-context"
import { OrpheusLogo } from "@/components/ui/orpheus-logo"

const navItems = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/search", icon: Search, label: "Buscar" },
]

const libraryItems = [
  { href: "/library", icon: Library, label: "Tu biblioteca" },
  { href: "/library/liked", icon: Heart, label: "Canciones favoritas" },
  { href: "/library/recent", icon: Clock, label: "Reproducido reciente" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { userId } = useSettings()
  const [recent, setRecent] = useState<Song[]>([])
  const [search, setSearch] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let cancelled = false
    const loadRecent = async () => {
      const local = getRecentlyPlayed()
      let items = local
      if (userId) {
        try {
          const state = await api.getUserState(userId)
          if (!cancelled) {
            items = state.recentlyPlayed && state.recentlyPlayed.length > 0 ? state.recentlyPlayed : local
          }
        } catch (_) {
          items = local
        }
      }
      if (!cancelled) setRecent(items.slice(0, 6))
    }
    loadRecent()
    return () => {
      cancelled = true
    }
  }, [userId])

  const handleCreatePlaylist = async () => {
    if (creating) return
    if (!userId) {
      alert("Inicia sesión para crear playlists.")
      return
    }
    const title = window.prompt("Nombre de la playlist")
    if (!title || !title.trim()) return
    setCreating(true)
    try {
      await api.createCustomPlaylist(userId, title.trim())
      alert("Playlist creada")
    } catch (err) {
      console.error("Error creando playlist", err)
      alert("No se pudo crear la playlist")
    } finally {
      setCreating(false)
    }
  }

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
          disabled={creating}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-foreground-muted hover:text-foreground hover:bg-card/60 transition-all mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="w-6 h-6 rounded-lg bg-card flex items-center justify-center border border-border">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-medium">{creating ? "Creando..." : "Crear playlist"}</span>
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
      </nav>

      {/* CTA */}
      <div className="px-4 py-5">
        <button className="w-full flex items-center justify-center gap-3 h-11 rounded-full bg-card border border-border text-foreground hover:bg-card/70 transition-colors">
          <LogIn className="w-4 h-4" />
          <span className="text-sm font-semibold">Iniciar sesión</span>
        </button>
        <p className="text-xs text-foreground-muted text-center mt-2">
          Inicia sesión para crear playlists y guardar tu música favorita
        </p>
      </div>

      {/* Recently Played */}
      <div className="px-4 space-y-3 flex-1 overflow-y-auto hide-scrollbar">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Escuchado recientemente</h3>
          <p className="text-xs text-foreground-muted">Vuelve a disfrutar tus favoritos</p>
        </div>
        <div className="space-y-2">
          {recent.map((song) => (
            <Link
              key={song.id}
              href={`/song/${encodeURIComponent(song.id)}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={song.thumbnail || "/placeholder.svg?height=80&width=80&query=music"}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-foreground">{song.title}</p>
                <p className="text-xs text-foreground-muted truncate">{song.artist}</p>
              </div>
            </Link>
          ))}
          {recent.length === 0 && <p className="text-xs text-foreground-muted">Aún no has reproducido canciones.</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border space-y-2 text-xs text-foreground-muted text-center">
        <Link href="/billing" className="block hover:text-foreground transition-colors">
          Planes y Facturación
        </Link>
        <Link href="/help" className="block hover:text-foreground transition-colors">
          ¿Necesitas ayuda?
        </Link>
        <p className="pt-2 text-[11px]">&copy; 2024 Orpheus</p>
      </div>
    </aside>
  )
}
