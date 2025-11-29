"use client"

import type React from "react"

import { Play, MoreVertical, Heart, ListPlus, Radio, Share2 } from "lucide-react"
import Link from "next/link"
import type { Song } from "@/types"
import { formatDuration, cn } from "@/lib/utils"
import { useQueue } from "@/contexts/queue-context"
import { usePlayer } from "@/contexts/player-context"
import { useState, useEffect } from "react"
import { getLikedSongs, toggleLikedSong } from "@/lib/storage"

interface SongCardProps {
  song: Song
  index?: number
  showIndex?: boolean
  onPlay?: () => void
  compact?: boolean
}

export function SongCard({ song, index, showIndex = false, onPlay, compact = false }: SongCardProps) {
  const { setQueue, addToQueue } = useQueue()
  const { currentSong, isPlaying } = usePlayer()
  const [showMenu, setShowMenu] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const isCurrentSong = currentSong?.id === song.id

  useEffect(() => {
    setIsLiked(getLikedSongs().includes(song.id))
  }, [song.id])

  const handlePlay = () => {
    if (onPlay) {
      onPlay()
    } else {
      setQueue([song], 0)
    }
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newLiked = toggleLikedSong(song.id)
    setIsLiked(newLiked)
  }

  const handleAddToQueue = () => {
    addToQueue(song)
    setShowMenu(false)
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer",
        isCurrentSong ? "bg-primary/10" : "hover:bg-card",
        compact && "p-1.5",
      )}
      onClick={handlePlay}
    >
      {showIndex && (
        <span
          className={cn(
            "w-5 text-center text-sm",
            isCurrentSong ? "text-primary font-semibold" : "text-foreground-muted",
          )}
        >
          {isCurrentSong && isPlaying ? (
            <span className="flex justify-center">
              <span className="w-1 h-3 bg-primary rounded-full animate-pulse mx-px" />
              <span
                className="w-1 h-3 bg-primary rounded-full animate-pulse mx-px"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-1 h-3 bg-primary rounded-full animate-pulse mx-px"
                style={{ animationDelay: "0.4s" }}
              />
            </span>
          ) : (
            index
          )}
        </span>
      )}

      {/* Thumbnail */}
      <div className={cn("relative rounded overflow-hidden flex-shrink-0", compact ? "w-10 h-10" : "w-12 h-12")}>
        <img
          src={song.thumbnail || "/placeholder.svg?height=100&width=100&query=song album art"}
          alt={song.title}
          className="w-full h-full object-cover"
        />
        <div
          className={cn(
            "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity",
            isCurrentSong ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <Play className="w-4 h-4 text-white" fill="currentColor" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium text-sm truncate", isCurrentSong && "text-primary")}>{song.title}</p>
        {song.channelId ? (
          <Link
            href={`/artist/${song.channelId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-foreground-muted truncate hover:text-primary transition-colors"
          >
            {song.artist}
          </Link>
        ) : (
          <p className="text-xs text-foreground-muted truncate">{song.artist}</p>
        )}
      </div>

      {/* Like button */}
      <button
        onClick={handleLike}
        className={cn(
          "w-8 h-8 flex items-center justify-center transition-all",
          isLiked
            ? "text-primary opacity-100"
            : "text-foreground-muted opacity-0 group-hover:opacity-100 hover:text-foreground",
        )}
      >
        <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
      </button>

      {/* Duration */}
      <span className="text-xs text-foreground-muted w-10 text-right hidden sm:block">
        {formatDuration(song.duration)}
      </span>

      {/* More menu */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="w-8 h-8 flex items-center justify-center text-foreground-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(false)
              }}
            />
            <div className="absolute right-0 top-full mt-1 z-50 w-52 bg-card border border-border rounded-xl shadow-xl py-2 fade-in">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToQueue()
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card-hover transition-colors"
              >
                <ListPlus className="w-4 h-4" />
                Añadir a la cola
              </button>
              <button
                onClick={handleLike}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card-hover transition-colors"
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current text-primary")} />
                {isLiked ? "Quitar de favoritos" : "Añadir a favoritos"}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card-hover transition-colors">
                <Radio className="w-4 h-4" />
                Ir a la radio
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card-hover transition-colors">
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
