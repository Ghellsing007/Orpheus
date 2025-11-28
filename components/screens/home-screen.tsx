"use client"

import { Play, Sparkles } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { CarouselSection } from "@/components/sections/carousel-section"
import { PlaylistCard } from "@/components/cards/playlist-card"
import { SongCard } from "@/components/cards/song-card"
import { ArtistCard } from "@/components/cards/artist-card"
import { SkeletonCarousel, SkeletonHero } from "@/components/ui/skeleton-card"
import { useQueue } from "@/contexts/queue-context"
import { api } from "@/services/api"
import type { Artist, Playlist, Song } from "@/types"
import { useSettings } from "@/contexts/settings-context"
import { getRecentlyPlayed } from "@/lib/storage"

export function HomeScreen() {
  const { setQueue } = useQueue()
  const { userId } = useSettings()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [trending, setTrending] = useState<Song[]>([])
  const [recommendations, setRecommendations] = useState<Song[]>([])
  const [recent, setRecent] = useState<Song[]>([])

  const artists: Artist[] = useMemo(() => {
    const source = [...trending, ...recommendations]
    const unique = new Map<string, Artist>()
    source.forEach((song) => {
      if (!unique.has(song.artist)) {
        unique.set(song.artist, {
          id: song.artist,
          name: song.artist,
          image: song.thumbnail || "/placeholder.svg?height=200&width=200&query=artist",
        })
      }
    })
    return Array.from(unique.values()).slice(0, 10)
  }, [trending, recommendations])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [pls, topSongs, recs] = await Promise.all([
          api.getPlaylists({ type: "all", online: false }),
          api.searchSongs("top hits"),
          api.getRecommendations(userId).catch(() => []),
        ])
        if (cancelled) return
        setPlaylists(pls)
        setTrending(topSongs)
        setRecommendations(recs)

        const userState = await api.getUserState(userId).catch(() => null)
        if (!cancelled) {
          const recentFromApi = userState?.recentlyPlayed ?? []
          const fallbackRecent = recentFromApi.length > 0 ? recentFromApi : getRecentlyPlayed()
          setRecent(fallbackRecent)
        }
      } catch (err) {
        if (!cancelled) setError("No pudimos cargar los datos iniciales")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const handlePlayAll = () => {
    const list = trending.length > 0 ? trending : recommendations
    if (list.length > 0) setQueue(list, 0)
  }

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        <SkeletonHero />
        <div className="space-y-10 px-4 md:px-8">
          <SkeletonCarousel />
          <SkeletonCarousel />
          <SkeletonCarousel />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <div className="relative px-4 md:px-8 pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Bienvenido a Orpheus</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance leading-tight">
              Descubre nueva musica
            </h1>
            <p className="text-lg text-foreground-muted mb-8 max-w-lg leading-relaxed">
              Explora millones de canciones, crea playlists personalizadas y disfruta de la mejor experiencia musical.
            </p>
            <button
              onClick={handlePlayAll}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full gradient-primary text-white font-semibold text-lg hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-primary/30"
            >
              <Play className="w-6 h-6" fill="currentColor" />
              Comenzar a escuchar
            </button>
            {error && <p className="text-destructive mt-3 text-sm">{error}</p>}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="space-y-10 md:px-4">
        {/* Featured Playlists */}
        <CarouselSection title="Playlists destacadas" subtitle="Las mejores selecciones para ti">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </CarouselSection>

        {/* Trending */}
        {trending.length > 0 && (
          <CarouselSection title="Tendencias" subtitle="Lo mas escuchado ahora">
            {trending.map((song, index) => (
              <div key={song.id} className="w-40 flex-shrink-0 group">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg shadow-black/20">
                  <img
                    src={song.thumbnail || "/placeholder.svg?height=200&width=200&query=trending music"}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={() => setQueue(trending, index)}
                    className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-primary flex items-center justify-center shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                  >
                    <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
                  </button>
                </div>
                <h3 className="font-medium text-sm truncate">{song.title}</h3>
                <p className="text-xs text-foreground-muted truncate">{song.artist}</p>
              </div>
            ))}
          </CarouselSection>
        )}

        {/* Artists */}
        {artists.length > 0 && (
          <CarouselSection title="Artistas populares" subtitle="Descubre nuevos talentos">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </CarouselSection>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <section className="space-y-4">
            <div className="px-4 md:px-0">
              <h2 className="text-xl md:text-2xl font-bold">Recomendaciones para ti</h2>
              <p className="text-sm text-foreground-muted mt-1">Basado en lo que escuchas</p>
            </div>
            <div className="bg-card/50 rounded-xl p-2 mx-4 md:mx-0">
              {recommendations.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  index={index + 1}
                  showIndex
                  onPlay={() => setQueue(recommendations, index)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently Played */}
        {recent.length > 0 && (
          <CarouselSection title="Escuchado recientemente" subtitle="Vuelve a disfrutar tus favoritos">
            {recent.map((song, index) => (
              <div key={song.id} className="w-40 flex-shrink-0 group">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg shadow-black/20">
                  <img
                    src={song.thumbnail || "/placeholder.svg?height=200&width=200&query=recent music"}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={() => setQueue(recent, index)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                    </div>
                  </button>
                </div>
                <h3 className="font-medium text-sm truncate">{song.title}</h3>
                <p className="text-xs text-foreground-muted truncate">{song.artist}</p>
              </div>
            ))}
          </CarouselSection>
        )}

        {/* Mood Playlists */}
        {playlists.length > 0 && (
          <CarouselSection title="Mood Playlists" subtitle="Musica para cada momento">
            {[...playlists].reverse().map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} size="lg" />
            ))}
          </CarouselSection>
        )}
      </div>
    </div>
  )
}
