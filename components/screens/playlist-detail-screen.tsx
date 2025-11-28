"use client"

import { ArrowLeft, Play, Shuffle, Heart, MoreVertical, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { SongCard } from "@/components/cards/song-card"
import { useQueue } from "@/contexts/queue-context"
import { formatDuration, cn } from "@/lib/utils"
import type { Playlist } from "@/types"
import { api } from "@/services/api"
import { useSettings } from "@/contexts/settings-context"

interface PlaylistDetailScreenProps {
  playlistId: string
}

export function PlaylistDetailScreen({ playlistId }: PlaylistDetailScreenProps) {
  const router = useRouter()
  const { setQueue } = useQueue()
  const { userId } = useSettings()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const load = async () => {
      try {
        const data = await api.getPlaylist(playlistId, userId)
        if (cancelled) return
        // Ensure songs are set from list if needed
        const songs = data.songs || data.list || []
        setPlaylist({ ...data, songs })
      } catch (err) {
        if (!cancelled) setError("No pudimos cargar la playlist")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [playlistId, userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-foreground-muted">
          <p>Cargando playlist...</p>
        </div>
      </div>
    )
  }

  if (!playlist || error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-foreground-muted">
          <p>{error ?? "Playlist no encontrada"}</p>
        </div>
      </div>
    )
  }

  const songs = playlist.songs || playlist.list || []
  const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0)
  const toggleLike = () => {
    const next = !isLiked
    setIsLiked(next)
    if (userId) {
      api.likePlaylist(userId, playlist.id, next).catch(() => {})
    }
  }

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs, 0)
    }
  }

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5)
      setQueue(shuffled, 0)
    }
  }

  return (
    <div className="pb-8">
      {/* Header with gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-background" />

        <div className="relative px-4 md:px-8 pt-4 pb-6">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center mb-4 hover:bg-black/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end">
            {/* Cover */}
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-xl overflow-hidden shadow-2xl shadow-black/50 flex-shrink-0">
              <img
                src={playlist.thumbnail || "/placeholder.svg?height=300&width=300&query=playlist cover"}
                alt={playlist.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <p className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-2">Playlist</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{playlist.title}</h1>
              {playlist.description && <p className="text-foreground-muted mb-3">{playlist.description}</p>}
              <p className="text-sm text-foreground-muted">
                {songs.length} canciones - {formatDuration(totalDuration)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 md:px-8 py-4 flex items-center gap-4">
        <button
          onClick={handlePlayAll}
          className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/30"
        >
          <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
        </button>

        <button
          onClick={handleShuffle}
          className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors"
        >
          <Shuffle className="w-5 h-5" />
        </button>

        <button
          onClick={toggleLike}
          className={cn(
            "w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors",
            isLiked && "text-primary",
          )}
        >
          <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
        </button>

        <button className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors">
          <Share2 className="w-5 h-5" />
        </button>

        <button className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors ml-auto">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Songs */}
      <div className="px-4 md:px-8">
        <div className="bg-card/50 rounded-xl p-2">
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <SongCard key={song.id} song={song} index={index + 1} showIndex onPlay={() => setQueue(songs, index)} />
            ))
          ) : (
            <div className="text-center py-12 text-foreground-muted">
              <p>Esta playlist está vacía</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
