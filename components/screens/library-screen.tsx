"use client"

import type React from "react"
import { useMemo, useState, useEffect, useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Grid3X3, List, Heart, Clock, Music, User, FolderOpen, Download } from "lucide-react"
import { SongCard } from "@/components/cards/song-card"
import { PlaylistCard } from "@/components/cards/playlist-card"
import { ArtistCard } from "@/components/cards/artist-card"
import { cn } from "@/lib/utils"
import { getLikedSongs, getRecentlyPlayed } from "@/lib/storage"
import { useQueue } from "@/contexts/queue-context"
import { api } from "@/services/api"
import { useSettings } from "@/contexts/settings-context"
import { AuthModal } from "@/components/auth/auth-modal"
import type { Playlist, Song, Artist } from "@/types"

type Filter = "all" | "playlists" | "songs" | "artists"
type ViewMode = "grid" | "list"

const filters: { id: Filter; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "Todo", icon: FolderOpen },
  { id: "playlists", label: "Playlists", icon: Music },
  { id: "songs", label: "Canciones", icon: Heart },
  { id: "artists", label: "Artistas", icon: User },
]

export function LibraryScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [hydrated, setHydrated] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const { setQueue } = useQueue()
  const { userId, role } = useSettings()
  const queryClient = useQueryClient()

  const userStateQuery = useQuery({
    queryKey: ["userState", userId],
    queryFn: () => api.getUserState(userId),
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const localLikedIds = useMemo(() => getLikedSongs(), [])
  const localRecent = useMemo(() => getRecentlyPlayed(), [])

  const likedSongs = userStateQuery.data?.likedSongs ?? localRecent.filter((s) => localLikedIds.includes(s.id))
  const customPlaylists = userStateQuery.data?.customPlaylists ?? []
  const savedPlaylists = userStateQuery.data?.likedPlaylists ?? []
  const recentSongs =
    userStateQuery.data?.recentlyPlayed && userStateQuery.data.recentlyPlayed.length > 0
      ? userStateQuery.data.recentlyPlayed
      : localRecent

  const likedPlaylistIds = useMemo(
    () => new Set<string>(userStateQuery.data?.likedPlaylists?.map((playlist) => playlist.id) ?? []),
    [userStateQuery.data],
  )
  const likedArtistIds = useMemo(
    () => new Set<string>(userStateQuery.data?.likedArtists?.map((artist) => artist.id) ?? []),
    [userStateQuery.data],
  )

  const handleTogglePlaylistLike = useCallback(
    async (playlistId: string) => {
      if (!userId || role === "guest") {
        setAuthOpen(true)
        return
      }
      const add = !likedPlaylistIds.has(playlistId)
      await api.likePlaylist(userId, playlistId, add)
      queryClient.invalidateQueries(["userState", userId])
    },
    [userId, role, likedPlaylistIds, queryClient],
  )

  const handleToggleArtistLike = useCallback(
    async (artistId: string) => {
      if (!userId || role === "guest") {
        setAuthOpen(true)
        return
      }
      const add = !likedArtistIds.has(artistId)
      await api.likeArtist(userId, artistId, add)
      queryClient.invalidateQueries(["userState", userId])
    },
    [userId, role, likedArtistIds, queryClient],
  )

  const artists = useMemo(() => {
    const artistMap = new Map<string, Artist>()
    likedSongs.forEach((song) => {
      if (!artistMap.has(song.artist)) {
        artistMap.set(song.artist, {
          id: song.artist,
          name: song.artist,
          image: song.thumbnail || "/placeholder.svg?height=200&width=200&query=artist",
        })
      }
    })
    return Array.from(artistMap.values()).slice(0, 12)
  }, [likedSongs])

  const isLoading = userStateQuery.isPending && !userStateQuery.data

  const displayedLikedSongs = likedSongs.length > 0 ? likedSongs : recentSongs.slice(0, 5)

  useEffect(() => {
    setHydrated(true)
  }, [])
  const hasClientData = hydrated || Boolean(userStateQuery.data)
  const safeLikedSongs = hasClientData ? displayedLikedSongs : []

  useEffect(() => {
    setHydrated(true)
  }, [])

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Tu biblioteca</h1>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center hover:bg-card-hover transition-colors"
          >
            {viewMode === "grid" ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveFilter(id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              activeFilter === id ? "bg-foreground text-background" : "bg-card text-foreground hover:bg-card-hover",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Liked Songs */}
        {(activeFilter === "all" || activeFilter === "songs") && (
          <section>
            <button
              className="flex items-center gap-4 w-full p-4 bg-gradient-to-r from-primary/20 to-transparent rounded-xl mb-4 hover:from-primary/30 transition-colors"
              onClick={() => setQueue(displayedLikedSongs, 0)}
            >
              <div className="w-14 h-14 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold">Canciones que te gustan</h2>
                <p className="text-sm text-foreground-muted">
                  {hydrated ? `${displayedLikedSongs.length} canciones` : "…"}
                </p>
              </div>
            </button>

            {viewMode === "list" ? (
              <div className="space-y-1 bg-card/50 rounded-xl p-2">
                {safeLikedSongs.map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={index + 1}
                    showIndex
                    onPlay={() => setQueue(safeLikedSongs, index)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {safeLikedSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="group cursor-pointer"
                    onClick={() => setQueue(safeLikedSongs, index)}
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg">
                      <img
                        src={song.thumbnail || "/placeholder.svg?height=200&width=200&query=music"}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-medium text-sm truncate">{song.title}</p>
                    <p className="text-xs text-foreground-muted truncate">{song.artist}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Recent */}
        {(activeFilter === "all" || activeFilter === "songs") && recentSongs.length > 0 && (
          <section>
            <div className="flex items-center gap-3 p-3 bg-card rounded-xl mb-4">
              <div className="w-12 h-12 rounded-lg bg-card-hover flex items-center justify-center">
                <Clock className="w-6 h-6 text-foreground-muted" />
              </div>
              <div>
                <h2 className="font-bold">Reproducidos recientemente</h2>
                <p className="text-sm text-foreground-muted">Historial de reproduccion</p>
              </div>
            </div>
            {viewMode === "list" ? (
              <div className="space-y-1 bg-card/50 rounded-xl p-2">
                {recentSongs.slice(0, 10).map((song, index) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    index={index + 1}
                    showIndex
                    onPlay={() => setQueue(recentSongs, index)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {recentSongs.slice(0, 10).map((song, index) => (
                  <div
                    key={song.id}
                    className="group cursor-pointer"
                    onClick={() => setQueue(recentSongs, index)}
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg">
                      <img
                        src={song.thumbnail || "/placeholder.svg?height=200&width=200&query=music"}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-medium text-sm truncate">{song.title}</p>
                    <p className="text-xs text-foreground-muted truncate">{song.artist}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Custom Playlists */}
        {(activeFilter === "all" || activeFilter === "playlists") && (
          <section>
            <h2 className="text-lg font-bold mb-4">Tus playlists</h2>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {customPlaylists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            ) : (
              <div className="space-y-2 bg-card/50 rounded-xl p-2">
                {customPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors cursor-pointer"
                  >
                    <img
                      src={playlist.thumbnail || "/placeholder.svg?height=100&width=100&query=playlist"}
                      alt={playlist.title}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{playlist.title}</p>
                      <p className="text-sm text-foreground-muted truncate">
                        Playlist - {playlist.songCount ?? playlist.songs?.length ?? 0} canciones
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Saved/Imported Playlists */}
        {(activeFilter === "all" || activeFilter === "playlists") && savedPlaylists.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-5 h-5 text-foreground-muted" />
              <h2 className="text-lg font-bold">Playlists guardadas</h2>
            </div>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {savedPlaylists.map((playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    isLiked={likedPlaylistIds.has(playlist.id)}
                    onToggleLike={() => handleTogglePlaylistLike(playlist.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2 bg-card/50 rounded-xl p-2">
                {savedPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors cursor-pointer"
                  >
                    <img
                      src={playlist.thumbnail || "/placeholder.svg?height=100&width=100&query=playlist"}
                      alt={playlist.title}
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{playlist.title}</p>
                      <p className="text-sm text-foreground-muted truncate">
                        {playlist.source === "custom" ? "User" : "YouTube"} - {playlist.songCount} canciones
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Artists */}
        {(activeFilter === "all" || activeFilter === "artists") && artists.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4">Artistas seguidos</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    isLiked={likedArtistIds.has(artist.id)}
                    onToggleLike={() => handleToggleArtistLike(artist.id)}
                  />
              ))}
            </div>
          </section>
        )}

        {isLoading && <p className="text-foreground-muted text-sm">Cargando tu biblioteca...</p>}
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
