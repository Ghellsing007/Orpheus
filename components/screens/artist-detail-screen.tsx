"use client"

import { ArrowLeft, Play, UserPlus, UserCheck, Share2, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { SongCard } from "@/components/cards/song-card"
import { PlaylistCard } from "@/components/cards/playlist-card"
import { CarouselSection } from "@/components/sections/carousel-section"
import { mockArtists, mockPlaylists, mockSongs } from "@/services/mock-data"
import { useQueue } from "@/contexts/queue-context"
import { formatNumber, cn } from "@/lib/utils"
import type { Artist } from "@/types"

interface ArtistDetailScreenProps {
  artistId: string
}

export function ArtistDetailScreen({ artistId }: ArtistDetailScreenProps) {
  const router = useRouter()
  const { setQueue } = useQueue()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    const found = mockArtists.find((a) => a.id === artistId)
    setArtist(found || null)
    setIsFollowing(found?.isFollowing || false)
  }, [artistId])

  if (!artist) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-foreground-muted">
          <p>Artista no encontrado</p>
        </div>
      </div>
    )
  }

  const topSongs = artist.topSongs || mockSongs.slice(0, 5)
  const relatedPlaylists = mockPlaylists.slice(0, 4)

  const handlePlayAll = () => {
    if (topSongs.length > 0) {
      setQueue(topSongs, 0)
    }
  }

  return (
    <div className="pb-8">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80">
        <div className="absolute inset-0">
          <img
            src={artist.image || "/placeholder.svg?height=400&width=800&query=artist banner"}
            alt={artist.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Artist Info */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-6">
          <p className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-1">Artista</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">{artist.name}</h1>
          {artist.monthlyListeners && (
            <p className="text-foreground-muted">{formatNumber(artist.monthlyListeners)} oyentes mensuales</p>
          )}
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
          onClick={() => setIsFollowing(!isFollowing)}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all",
            isFollowing
              ? "bg-card text-foreground hover:bg-card-hover"
              : "bg-foreground text-background hover:opacity-90",
          )}
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-5 h-5" />
              Siguiendo
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Seguir
            </>
          )}
        </button>

        <button className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors">
          <Share2 className="w-5 h-5" />
        </button>

        <button className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-8 md:px-4">
        {/* Popular Songs */}
        <section className="px-4 md:px-0">
          <h2 className="text-xl font-bold mb-4">Canciones populares</h2>
          <div className="bg-card/50 rounded-xl p-2">
            {topSongs.map((song, index) => (
              <SongCard
                key={song.id}
                song={song}
                index={index + 1}
                showIndex
                onPlay={() => setQueue(topSongs, index)}
              />
            ))}
          </div>
        </section>

        {/* Appears On */}
        <CarouselSection title="Aparece en" subtitle="Playlists con este artista">
          {relatedPlaylists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </CarouselSection>

        {/* Related Artists */}
        <section className="px-4 md:px-0">
          <h2 className="text-xl font-bold mb-4">Artistas similares</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {mockArtists
              .filter((a) => a.id !== artist.id)
              .slice(0, 5)
              .map((relatedArtist) => (
                <button
                  key={relatedArtist.id}
                  onClick={() => router.push(`/artist/${relatedArtist.id}`)}
                  className="text-center flex-shrink-0 w-28 group"
                >
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-2 shadow-lg">
                    <img
                      src={relatedArtist.image || "/placeholder.svg?height=150&width=150&query=artist"}
                      alt={relatedArtist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {relatedArtist.name}
                  </p>
                </button>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
