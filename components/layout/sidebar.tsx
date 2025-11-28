"use client"

import { Home, Search, Library, Settings, Plus, Heart, Clock } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { api } from "@/services/api"
import type { Playlist } from "@/types"

const mainNav = [
  { href: "/", icon: Home, label: "Inicio" },
  { href: "/search", icon: Search, label: "Buscar" },
]

const libraryNav = [
  { href: "/library", icon: Library, label: "Tu biblioteca" },
  { href: "/library/liked", icon: Heart, label: "Canciones favoritas" },
  { href: "/library/recent", icon: Clock, label: "Reproducido reciente" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  useEffect(() => {
    api
      .getPlaylists({ type: "all", online: false })
      .then((items) => setPlaylists(items.slice(0, 8)))
      .catch(() => setPlaylists([]))
  }, [])

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-full bg-background-elevated border-r border-border">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">O</span>
          </div>
          <span className="text-xl font-bold gradient-text">Orpheus</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-1">
        {mainNav.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all",
                isActive ? "bg-card text-foreground" : "text-foreground-muted hover:text-foreground hover:bg-card/50",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-4 h-px bg-border" />

      {/* Library Section */}
      <nav className="px-3 space-y-1">
        {libraryNav.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                isActive ? "bg-card text-foreground" : "text-foreground-muted hover:text-foreground hover:bg-card/50",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Create Playlist Button */}
      <div className="px-3 mt-2">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-card/50 transition-all">
          <div className="w-5 h-5 rounded bg-foreground-muted flex items-center justify-center">
            <Plus className="w-3 h-3 text-background" />
          </div>
          <span className="text-sm font-medium">Crear playlist</span>
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 my-4 h-px bg-border" />

      {/* Playlists */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 hide-scrollbar">
        <div className="space-y-1">
          {playlists.map((playlist) => (
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-card/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                <img
                  src={playlist.thumbnail || "/placeholder.svg"}
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-foreground">{playlist.title}</p>
                <p className="text-xs text-foreground-subtle truncate">Playlist · {playlist.songCount} canciones</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
            pathname === "/settings"
              ? "bg-card text-foreground"
              : "text-foreground-muted hover:text-foreground hover:bg-card/50",
          )}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Ajustes</span>
        </Link>
      </div>
    </aside>
  )
}
