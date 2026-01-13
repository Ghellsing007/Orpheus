"use client"

import { Search, X, TrendingUp, Trash2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { SongCard } from "@/components/cards/song-card"
import { PlaylistCard } from "@/components/cards/playlist-card"
import { ArtistCard } from "@/components/cards/artist-card"
import { cn } from "@/lib/utils"
import { useQueue } from "@/contexts/queue-context"
import { api } from "@/services/api"
import type { Artist, Playlist, Song } from "@/types"
import { addRecentSearch, clearRecentSearches, getRecentSearches, removeRecentSearch } from "@/lib/storage"
import { useVideoAvailability } from "@/hooks/use-video-availability"

type Tab = "all" | "songs" | "playlists" | "artists"

const categories = [
  { name: "Pop", color: "from-pink-500 to-rose-500", query: "pop" },
  { name: "Rock", color: "from-red-500 to-orange-500", query: "rock" },
  { name: "Hip Hop", color: "from-purple-500 to-indigo-500", query: "hip hop" },
  { name: "Electronica", color: "from-cyan-500 to-blue-500", query: "electronic" },
  { name: "R&B", color: "from-amber-500 to-yellow-500", query: "r&b" },
  { name: "Latino", color: "from-green-500 to-emerald-500", query: "latino" },
  { name: "Indie", color: "from-teal-500 to-cyan-500", query: "indie" },
  { name: "Jazz", color: "from-blue-600 to-indigo-600", query: "jazz" },
]

const LAST_SEARCH_KEY = "orpheus_last_search"

export function SearchScreen() {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const hydratedLast = useRef(false)
  const { setQueue } = useQueue()

  const buildArtists = (sourceSongs: Song[]): Artist[] => {
    const unique = new Map<string, Artist>()
    sourceSongs.forEach((song) => {
      const slug = song.channelId || song.artist
      if (!slug || unique.has(slug)) return
      unique.set(slug, {
        id: slug,
        ytid: slug,
        name: song.artist,
        image: song.thumbnail || "/placeholder.svg?height=200&width=200&query=artist",
      })
    })
    return Array.from(unique.values()).slice(0, 12)
  }

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query.trim()), 250)
    return () => clearTimeout(handler)
  }, [query])

  // Hydrate with the last search performed (once on mount)
  useEffect(() => {
    if (typeof window === "undefined" || hydratedLast.current) return
    const last = localStorage.getItem(LAST_SEARCH_KEY)
    if (last) {
      setQuery(last)
      setDebouncedQuery(last)
    }
    hydratedLast.current = true
  }, [])

  useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  const initialQuery = useQuery({
    queryKey: ["search", "initial"],
    queryFn: async () => {
      const [pls, topSongs] = await Promise.all([
        api.getPlaylists({ type: "all", online: false, limit: 24 }),
        api.searchSongs("top hits"),
      ])
      return { playlists: pls, songs: topSongs }
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  const suggestionsQuery = useQuery({
    queryKey: ["suggestions", debouncedQuery],
    queryFn: () => api.suggestions(debouncedQuery),
    enabled: Boolean(debouncedQuery),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const searchQuery = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      const [foundSongs, foundPlaylists] = await Promise.all([
        api.searchSongs(debouncedQuery),
        api.getPlaylists({ query: debouncedQuery, type: "all", online: true, limit: 30 }),
      ])
      return { songs: foundSongs, playlists: foundPlaylists }
    },
    enabled: Boolean(debouncedQuery),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  })

  const searchChannelsQuery = useQuery({
    queryKey: ["search-channels", debouncedQuery],
    queryFn: () => api.searchChannels(debouncedQuery),
    enabled: Boolean(debouncedQuery),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  })

  const suggestions = suggestionsQuery.data ?? []
  
  // Use progressive mode for faster results - shows songs immediately, only filters out explicitly blocked ones
  const rawSongs = query ? searchQuery.data?.songs ?? [] : initialQuery.data?.songs ?? []
  const { filteredSongs: songs, isInitialLoading: isFilteringSongs } = useVideoAvailability(rawSongs, "progressive", 15)
  
  const playlists = query ? searchQuery.data?.playlists ?? [] : initialQuery.data?.playlists ?? []
  
  const artists = useMemo(() => {
    if (debouncedQuery && searchChannelsQuery.data?.length) return searchChannelsQuery.data
    return buildArtists(songs.length > 0 ? songs : rawSongs)
  }, [debouncedQuery, searchChannelsQuery.data, songs, rawSongs])

  const isLoading = (query ? searchQuery.isPending : initialQuery.isPending) || isFilteringSongs
  const error = query && searchQuery.isError ? "No pudimos completar la busqueda" : null

  useEffect(() => {
    if (!debouncedQuery) return
    if (searchQuery.isSuccess) {
      setRecentSearches(addRecentSearch(debouncedQuery))
      if (typeof window !== "undefined") {
        localStorage.setItem(LAST_SEARCH_KEY, debouncedQuery)
      }
    }
  }, [debouncedQuery, searchQuery.isSuccess])

  const clearQuery = () => {
    setQuery("")
    setDebouncedQuery("")
    setShowSuggestions(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem(LAST_SEARCH_KEY)
    }
  }

  const handleRemoveRecent = (term: string) => {
    const updated = removeRecentSearch(term)
    setRecentSearches(updated)
  }

  const handleClearRecent = () => {
    clearRecentSearches()
    setRecentSearches([])
  }

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Que quieres escuchar?"
            className="w-full h-14 pl-12 pr-12 bg-card rounded-2xl text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          {query && (
            <button
              onClick={clearQuery}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-foreground-muted hover:text-foreground rounded-full hover:bg-card-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden fade-in">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(suggestion)
                  setShowSuggestions(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors text-left"
              >
                <Search className="w-4 h-4 text-foreground-muted" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {query ? (
        <>
          {isLoading && <div className="text-foreground-muted text-sm px-1">Buscando resultados...</div>}
          {error && (
            <div className="text-destructive text-sm px-1 pb-2">
              {error}
            </div>
          )}
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {(["all", "songs", "playlists", "artists"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeTab === tab ? "bg-foreground text-background" : "bg-card text-foreground hover:bg-card-hover",
                )}
              >
                {tab === "all" ? "Todo" : tab === "songs" ? "Canciones" : tab === "playlists" ? "Playlists" : "Artistas"}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="space-y-6">
            {(activeTab === "all" || activeTab === "songs") && songs.length > 0 && (
              <section>
                {activeTab === "all" && <h3 className="text-lg font-semibold mb-3">Canciones</h3>}
                <div className="space-y-1 bg-card/50 rounded-xl p-2">
                  {(activeTab === "all" ? songs.slice(0, 6) : songs).map((song, index) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      index={index + 1}
                      showIndex
                      onPlay={() => setQueue(songs, index)}
                    />
                  ))}
                </div>
              </section>
            )}

            {(activeTab === "all" || activeTab === "playlists") && playlists.length > 0 && (
              <section>
                {activeTab === "all" && <h3 className="text-lg font-semibold mb-3">Playlists</h3>}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {(activeTab === "all" ? playlists.slice(0, 6) : playlists).map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              </section>
            )}

            {(activeTab === "all" || activeTab === "artists") && artists.length > 0 && (
              <section>
                {activeTab === "all" && <h3 className="text-lg font-semibold mb-3">Artistas</h3>}
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                  {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                  ))}
                </div>
              </section>
            )}

            {/* Editorial Results (New) */}
            {activeTab === "all" && debouncedQuery && (
              <section className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Resultados en Revista
                </h3>
                <div className="space-y-4">
                  <Link href="/magazine" className="block p-4 bg-card/40 rounded-xl hover:bg-card/60 transition-all border border-transparent hover:border-primary/20">
                    <p className="font-bold text-sm">Explora artículos sobre "{debouncedQuery}" en Orpheus Mag</p>
                    <p className="text-xs text-foreground-muted mt-1">Nuestros redactores analizan las últimas tendencias musicales.</p>
                  </Link>
                </div>
              </section>
            )}

            {!isLoading && songs.length === 0 && playlists.length === 0 && artists.length === 0 && (
              <div className="text-center py-12 text-foreground-muted">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron resultados para "{query}"</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Categories */}
          <section>
            <h2 className="text-xl font-bold mb-4">Explorar categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setQuery(category.query)}
                  className={cn(
                    "aspect-[2/1] rounded-xl p-4 bg-gradient-to-br flex items-end transition-transform hover:scale-[1.02] active:scale-[0.98]",
                    category.color,
                  )}
                >
                  <span className="font-bold text-lg text-white drop-shadow-md">{category.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <section>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-foreground-muted" />
                  <h2 className="text-xl font-bold">Busquedas recientes</h2>
                </div>
                <button
                  onClick={handleClearRecent}
                  className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar todo
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-card rounded-full text-sm hover:bg-card-hover transition-colors flex items-center gap-2"
                  >
                    <span>{term}</span>
                    <span
                      role="button"
                      aria-label={`Eliminar ${term}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveRecent(term)
                      }}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Browse All */}
          <section>
            <h2 className="text-xl font-bold mb-4">Todas las canciones</h2>
            <div className="bg-card/50 rounded-xl p-2">
              {songs.slice(0, 6).map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  index={index + 1}
                  showIndex
                  onPlay={() => setQueue(songs, index)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
