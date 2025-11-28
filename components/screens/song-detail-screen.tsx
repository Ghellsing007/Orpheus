"use client"

import { ArrowLeft, Play, Heart, Share2, ListPlus, Radio } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { SongCard } from "@/components/cards/song-card"
import { useQueue } from "@/contexts/queue-context"
import { formatDuration, cn } from "@/lib/utils"
import { getLikedSongs, toggleLikedSong } from "@/lib/storage"
import type { Song } from "@/types"
import { api } from "@/services/api"
import { useSettings } from "@/contexts/settings-context"

interface SongDetailScreenProps {
  songId: string
}

export function SongDetailScreen({ songId }: SongDetailScreenProps) {
  const router = useRouter()
  const { setQueue, addToQueue } = useQueue()
  const { userId } = useSettings()
  const [song, setSong] = useState<Song | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [lyrics, setLyrics] = useState<string[]>([])
  const [lyricsFound, setLyricsFound] = useState(true)
  const [relatedSongs, setRelatedSongs] = useState<Song[]>([])
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const loadSong = async () => {
      try {
        const detail = await api.getSong(songId)
        if (cancelled) return
        setSong(detail)
        setIsLiked(getLikedSongs().includes(detail.id))

        const [lyricsRes, recommendations, relatedFromSearch] = await Promise.all([
          api.getLyrics(detail.artist, detail.title).catch(() => ({
            found: false,
            lines: [],
            text: "",
            synced: false,
          })),
          api.getRecommendations(userId).catch(() => []),
          api.searchSongs(detail.artist).catch(() => []),
        ])

        if (cancelled) return
        setLyrics(lyricsRes.lines.map((l) => l.text))
        setLyricsFound(lyricsRes.found)

        const related = relatedFromSearch.filter((s) => s.id !== detail.id).slice(0, 5)
        setRelatedSongs(related)

        const sameArtist = recommendations.filter((s) => s.artist === detail.artist && s.id !== detail.id)
        const fallbackRecs = sameArtist.length > 0 ? sameArtist : recommendations.filter((s) => s.id !== detail.id)
        setRecommendedSongs(fallbackRecs.slice(0, 5))
      } catch (err) {
        if (!cancelled) {
          setError("No pudimos cargar la cancion")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadSong()
    return () => {
      cancelled = true
    }
  }, [songId, userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-foreground-muted">
          <p>Cargando cancion...</p>
        </div>
      </div>
    )
  }

  if (!song || error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-foreground-muted">
          <p>{error ?? "Cancion no encontrada"}</p>
        </div>
      </div>
    )
  }

  const handleLike = () => {
    const newLiked = toggleLikedSong(song.id)
    setIsLiked(newLiked)
    if (userId) {
      api.likeSong(userId, song.id, newLiked).catch(() => {})
    }
  }

  const handlePlay = () => {
    setQueue([song], 0)
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-background" />

        <div className="relative px-4 md:px-8 pt-4 pb-6">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center mb-4 hover:bg-black/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Cover */}
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 mb-6">
              <img
                src={song.thumbnail || "/placeholder.svg?height=400&width=400&query=album cover"}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{song.title}</h1>
            <p className="text-lg text-foreground-muted mb-1">{song.artist}</p>
            {song.album && (
              <p className="text-sm text-foreground-subtle">
                {song.album} - {formatDuration(song.duration)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 md:px-8 py-4 flex items-center justify-center gap-4">
        <button
          onClick={() => addToQueue(song)}
          className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors"
        >
          <ListPlus className="w-5 h-5" />
        </button>

        <button
          onClick={handleLike}
          className={cn(
            "w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors",
            isLiked && "text-primary",
          )}
        >
          <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
        </button>

        <button
          onClick={handlePlay}
          className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/30"
        >
          <Play className="w-7 h-7 text-white ml-0.5" fill="currentColor" />
        </button>

        <button className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors">
          <Share2 className="w-5 h-5" />
        </button>

        <button className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors">
          <Radio className="w-5 h-5" />
        </button>
      </div>

      {/* Lyrics Toggle */}
      <div className="px-4 md:px-8 mb-6">
        <button
          onClick={() => setShowLyrics(!showLyrics)}
          className={cn(
            "w-full py-4 rounded-xl font-medium transition-all",
            showLyrics ? "bg-primary text-primary-foreground" : "bg-card hover:bg-card-hover",
          )}
        >
          {showLyrics ? "Ocultar letra" : "Ver letra"}
        </button>
      </div>

      {/* Lyrics */}
      {showLyrics && (
        <div className="px-4 md:px-8 mb-8">
          <div className="bg-card rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Letra</h3>
            {lyrics.length === 0 ? (
              <p className="text-foreground-muted">
                {lyricsFound ? "Cargando letra..." : "Letra no disponible para esta cancion"}
              </p>
            ) : (
              <div className="space-y-3 text-foreground-muted">
                {lyrics.map((line, index) => (
                  <p key={`${line}-${index}`}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Related Songs */}
      <div className="px-4 md:px-8 space-y-6">
        {recommendedSongs.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Más de {song.artist}</h2>
            <div className="bg-card/50 rounded-xl p-2">
              {recommendedSongs.slice(0, 3).map((s, index) => (
                <SongCard key={s.id} song={s} onPlay={() => setQueue(recommendedSongs, index)} />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4">canciones relacionadas</h2>
          <div className="bg-card/50 rounded-xl p-2">
            {relatedSongs.map((s, index) => (
              <SongCard key={s.id} song={s} onPlay={() => setQueue(relatedSongs, index)} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
