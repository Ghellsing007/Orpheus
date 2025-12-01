"use client"

import type React from "react"

import { Play, Heart } from "lucide-react"
import Link from "next/link"
import type { Playlist } from "@/types"
import { cn } from "@/lib/utils"
import { useQueue } from "@/contexts/queue-context"

interface PlaylistCardProps {
  playlist: Playlist
  size?: "sm" | "md" | "lg"
  isLiked?: boolean
  onToggleLike?: () => void
}

export function PlaylistCard({
  playlist,
  size = "md",
  isLiked = false,
  onToggleLike,
}: PlaylistCardProps) {
  const { setQueue } = useQueue()

  const sizeClasses = {
    sm: "w-32",
    md: "w-40",
    lg: "w-48",
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (playlist.songs && playlist.songs.length > 0) {
      setQueue(playlist.songs, 0)
    }
  }

  return (
    <Link href={`/playlist/${playlist.id}`} className={`group flex-shrink-0 ${sizeClasses[size]}`}>
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg shadow-black/20">
        <img
          src={playlist.thumbnail || "/placeholder.svg?height=300&width=300&query=music playlist cover"}
          alt={playlist.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Like button */}
        {onToggleLike && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onToggleLike()
            }}
            className="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <Heart className={cn("w-5 h-5 transition-colors", isLiked ? "text-primary" : "text-white")} />
          </button>
        )}

        {/* Play button */}
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
        </button>
      </div>

      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{playlist.title}</h3>
      <p className="text-xs text-foreground-muted truncate mt-0.5">
        {playlist.songCount ? `${playlist.songCount} canciones` : "Playlist"}
      </p>
    </Link>
  )
}
