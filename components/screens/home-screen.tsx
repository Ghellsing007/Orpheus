"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Play, Sparkles } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { CarouselSection } from "@/components/sections/carousel-section"
import { PlaylistCard } from "@/components/cards/playlist-card"
import { SongCard } from "@/components/cards/song-card"
import { ArtistCard } from "@/components/cards/artist-card"
import { SkeletonCarousel, SkeletonHero } from "@/components/ui/skeleton-card"
import { useQueue } from "@/contexts/queue-context"
import { api } from "@/services/api"
import type { Artist, Playlist, Song, HomePreview, HomeSection, HomeSectionType, SongPreview } from "@/types"
import { useSettings } from "@/contexts/settings-context"
import { getRecentlyPlayed } from "@/lib/storage"

type CuratedResolvedPayload = {
  trendingSongs?: (HomePreview | SongPreview)[]
  featuredPlaylists?: HomePreview[]
  popularArtists?: HomePreview[]
  moodPlaylists?: HomePreview[]
}

export function HomeScreen() {
  const { setQueue } = useQueue()
  const { userId } = useSettings()
  const curatedQuery = useQuery({
    queryKey: ["home", "curated"],
    queryFn: () => api.getCuratedHome(),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", userId],
    queryFn: () => api.getRecommendations(userId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const userStateQuery = useQuery({
    queryKey: ["userState", userId],
    queryFn: () => api.getUserState(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const curatedSections = curatedQuery.data?.sections ?? []
  const curatedPreviews = curatedQuery.data?.previews ?? {}
  const resolved = (curatedQuery.data?.resolved ?? {}) as CuratedResolvedPayload

  const trending = useMemo(() => {
    const fromResolved =
      (resolved?.trendingSongs ?? [])
        .map((preview) => previewToSong(preview as HomePreview | SongPreview))
        .filter((song): song is Song => Boolean(song)) || []
    if (fromResolved.length > 0) return fromResolved
    return buildSongsFromSection(curatedSections, curatedPreviews, "trendingSongs")
  }, [curatedSections, curatedPreviews, resolved])

  const playlists = useMemo(() => {
    const fromResolved =
      (resolved?.featuredPlaylists ?? [])
        .map((preview) => previewToPlaylist(preview as HomePreview))
        .filter((playlist): playlist is Playlist => Boolean(playlist)) || []
    if (fromResolved.length > 0) return fromResolved
    return buildPlaylistsFromSection(curatedSections, curatedPreviews, "featuredPlaylists")
  }, [curatedSections, curatedPreviews, resolved])

  const moodPlaylists = useMemo(() => {
    const fromResolved =
      (resolved?.moodPlaylists ?? [])
        .map((preview: any) => ({
          title: (preview as HomePreview).mood || (preview as HomePreview).title,
          songs:
            (preview as HomePreview).songs
              ?.map((song) => previewToSong(song))
              .filter((song): song is Song => Boolean(song)) ?? [],
        }))
        .filter((mood) => mood.songs.length > 0) || []
    if (fromResolved.length > 0) return fromResolved
    return buildMoodPlaylists(curatedSections, curatedPreviews)
  }, [curatedSections, curatedPreviews, resolved])

  const artists = useMemo(() => {
    const fromResolved =
      (resolved?.popularArtists ?? [])
        .map((preview) => previewToArtist(preview as HomePreview))
        .filter((artist): artist is Artist => Boolean(artist)) || []
    if (fromResolved.length > 0) return fromResolved
    return buildArtistsFromSection(curatedSections, curatedPreviews)
  }, [curatedSections, curatedPreviews, resolved])

  const recommendations = recommendationsQuery.data ?? []
  const recentFromApi = userStateQuery.data?.recentlyPlayed ?? []
  const recent = recentFromApi.length > 0 ? recentFromApi : getRecentlyPlayed()

  const isLoading = curatedQuery.isPending && !curatedQuery.data
  const error =
    (curatedQuery.isError && "No pudimos cargar datos curados") ||
    (recommendationsQuery.isError && "No pudimos cargar recomendaciones") ||
    null

  const handlePlayAll = () => {
    const list = trending.length > 0 ? trending : recommendations
    if (list.length > 0) setQueue(list, 0)
  }

const fallbackArtists =
    artists.length > 0
      ? artists
      : trending.slice(0, 10).map((song) => ({
          id: song.channelId || song.artist,
          name: song.artist,
          image: song.thumbnail || "/placeholder.svg?height=200&width=200&query=artist",
        }))

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
                    className="absolute inset-0 flex items-end justify-end p-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                    </div>
                  </button>
                </div>
                <h3 className="font-medium text-sm truncate">{song.title}</h3>
                {artistHrefFromSong(song) ? (
                  <Link
                    href={artistHrefFromSong(song)!}
                    className="text-xs text-foreground-muted truncate hover:text-primary transition-colors"
                  >
                    {song.artist}
                  </Link>
                ) : (
                  <p className="text-xs text-foreground-muted truncate">{song.artist}</p>
                )}
              </div>
            ))}
          </CarouselSection>
        )}

        {/* Artists */}
        {fallbackArtists.length > 0 && (
          <CarouselSection title="Artistas populares" subtitle="Descubre nuevos talentos">
            {fallbackArtists.map((artist) => (
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
                  key={`${song.ytid || song.id || 'rec'}-${index}`}
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
                    className="absolute inset-0 bg-black/30 sm:bg-black/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end justify-end p-2"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                    </div>
                  </button>
                </div>
                <h3 className="font-medium text-sm truncate">{song.title}</h3>
                {artistHrefFromSong(song) ? (
                  <Link
                    href={artistHrefFromSong(song)!}
                    className="text-xs text-foreground-muted truncate hover:text-primary transition-colors"
                  >
                    {song.artist}
                  </Link>
                ) : (
                  <p className="text-xs text-foreground-muted truncate">{song.artist}</p>
                )}
              </div>
            ))}
          </CarouselSection>
        )}

        {/* Mood Playlists */}
        {moodPlaylists.length > 0 && (
          <CarouselSection title="Mood Playlists" subtitle="Musica para cada momento">
            {moodPlaylists.map((mood, idx) => (
              <div key={`${mood.title}-${idx}`} className="w-full space-y-2">
              <h3 className="text-lg font-semibold px-2">{mood.title}</h3>
              <div className="bg-card/50 rounded-xl p-2 space-y-1">
                {mood.songs.map((song, index) => (
                  <SongCard
                    key={`${song.id}-${index}`}
                    song={song}
                    onPlay={() => setQueue(mood.songs, index)}
                    showPlayButton={false}
                  />
                ))}
              </div>
            </div>
          ))}
          </CarouselSection>
        )}
      </div>
    </div>
  )
}

const placeholderImage = "/placeholder.svg?height=300&width=300&query=music"

function buildSongsFromSection(
  sections: HomeSection[],
  previews: Record<string, HomePreview>,
  sectionType: HomeSectionType,
): Song[] {
  const section = sections.find((s) => s.type === sectionType)
  return (section?.itemIds ?? [])
    .map((id) => previewToSong(previews[id]))
    .filter((song): song is Song => Boolean(song))
}

function buildPlaylistsFromSection(
  sections: HomeSection[],
  previews: Record<string, HomePreview>,
  sectionType: HomeSectionType,
): Playlist[] {
  const section = sections.find((s) => s.type === sectionType)
  return (section?.collectionIds ?? [])
    .map((id) => previewToPlaylist(previews[id]))
    .filter((playlist): playlist is Playlist => Boolean(playlist))
}

function buildMoodPlaylists(
  sections: HomeSection[],
  previews: Record<string, HomePreview>,
): { title: string; songs: Song[] }[] {
  const section = sections.find((s) => s.type === "moodPlaylists")
  return (section?.collectionIds ?? [])
    .map((id) => previews[id])
    .filter((preview): preview is HomePreview => Boolean(preview))
    .map((preview) => ({
      title: preview.mood || preview.title,
      songs: (preview.songs ?? []).map((song) => previewToSong(song)).filter((song): song is Song => Boolean(song)),
    }))
}

function buildArtistsFromSection(
  sections: HomeSection[],
  previews: Record<string, HomePreview>,
): Artist[] {
  const section = sections.find((s) => s.type === "popularArtists")
  return (section?.itemIds ?? [])
    .map((id) => previewToArtist(previews[id]))
    .filter((artist): artist is Artist => Boolean(artist))
}

function previewToSong(preview?: HomePreview | SongPreview): Song | null {
  if (!preview) return null
  const thumbnail = preview.thumbnail || preview.image || placeholderImage
  return {
    id: preview.ytid,
    ytid: preview.ytid,
    title: preview.title,
    artist: preview.artist || "",
    duration: preview.duration ?? 0,
    thumbnail,
    thumbnailHigh: preview.image || thumbnail,
    image: preview.image,
    lowResImage: preview.thumbnail,
    highResImage: preview.image,
    isLive: preview.isLive,
    source: "youtube",
  }
}

function previewToPlaylist(preview?: HomePreview): Playlist | null {
  if (!preview) return null
  const songs = (preview.songs ?? []).map((song) => previewToSong(song)).filter((song): song is Song => Boolean(song))
  const thumbnail = preview.thumbnail || preview.image || placeholderImage
  return {
    id: preview.ytid,
    ytid: preview.ytid,
    title: preview.title,
    thumbnail,
    image: preview.image,
    songCount: preview.songCount ?? songs.length,
    source: preview.songCount != null ? "youtube" : "youtube",
    songs,
    list: songs,
  }
}

function previewToArtist(preview?: HomePreview): Artist | null {
  if (!preview) return null
  const image = preview.image || preview.thumbnail || "/placeholder.svg?height=200&width=200&query=artist"
  return {
    id: preview.ytid,
    ytid: preview.ytid,
    name: preview.title,
    image,
    banner: preview.banner,
    subscribers: preview.subscribers,
    topSongs: [],
    playlists: [],
    related: [],
  }
}

function artistHrefFromSong(song: Song): string | null {
  const slug = song.channelId || song.artist
  if (!slug) return null
  return `/artist/${encodeURIComponent(slug)}`
}
