"use client"

import { Search, X, TrendingUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { SongCard } from "@/components/cards/song-card"
import { PlaylistCard } from "@/components/cards/playlist-card"
import { ArtistCard } from "@/components/cards/artist-card"
import { cn } from "@/lib/utils"
import { useQueue } from "@/contexts/queue-context"
import { api } from "@/services/api"
import type { Artist, Playlist, Song } from "@/types"

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

const recentSearches = ["The Weeknd", "Dua Lipa", "Pop Mix", "Workout", "Chill"]

export function SearchScreen() {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("all")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [songs, setSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [initialSongs, setInitialSongs] = useState<Song[]>([])
  const [initialPlaylists, setInitialPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setQueue } = useQueue()

  const buildArtists = (sourceSongs: Song[]): Artist[] => {
    const unique = new Map<string, Artist>()
    sourceSongs.forEach((song) => {
      if (!unique.has(song.artist)) {
        unique.set(song.artist, {
          id: song.artist,
          name: song.artist,
          image: song.thumbnail || "/placeholder.svg?height=200&width=200&query=artist",
        })
      }
    })
    return Array.from(unique.values()).slice(0, 12)
  }

  // Load initial content for empty state
  useEffect(() => {
    let cancelled = false
    const loadInitial = async () => {
      try {
        const [pls, topSongs] = await Promise.all([
          api.getPlaylists({ type: "all", online: false }),
          api.searchSongs("top hits"),
        ])
        if (cancelled) return
        setInitialPlaylists(pls)
        setInitialSongs(topSongs)
        setArtists(buildArtists(topSongs))
        setSongs(topSongs)
        setPlaylists(pls)
      } catch {
        // Ignore initial errors
      }
    }
    loadInitial()
    return () => {
      cancelled = true
    }
  }, [])

  // Suggestions
  useEffect(() => {
    if (!query) {
      setSuggestions([])
      return
    }
    const timeout = setTimeout(async () => {
      try {
        const items = await api.suggestions(query)
        setSuggestions(items)
      } catch {
        setSuggestions([])
      }
    }, 200)
    return () => clearTimeout(timeout)
  }, [query])

  // Search (debounced)
  useEffect(() => {
    if (!query) {
      setSongs(initialSongs)
      setPlaylists(initialPlaylists)
      setArtists(buildArtists(initialSongs))
      setError(null)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    const handler = setTimeout(async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [foundSongs, foundPlaylists] = await Promise.all([
          api.searchSongs(query),
          api.getPlaylists({ query, type: "all", online: true }),
        ])
        if (controller.signal.aborted) return
        setSongs(foundSongs)
        setPlaylists(foundPlaylists)
        setArtists(buildArtists(foundSongs))
      } catch (err) {
        if (!controller.signal.aborted) setError("No pudimos completar la busqueda")
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }, 250)

    return () => {
      controller.abort()
      clearTimeout(handler)
    }
  }, [query, initialSongs, initialPlaylists])

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
              onClick={() => setQuery("")}
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
          <section>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-foreground-muted" />
              <h2 className="text-xl font-bold">Busquedas recientes</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-card rounded-full text-sm hover:bg-card-hover transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          {/* Browse All */}
          <section>
            <h2 className="text-xl font-bold mb-4">Todas las canciones</h2>
            <div className="bg-card/50 rounded-xl p-2">
              {(initialSongs.length > 0 ? initialSongs : songs).slice(0, 6).map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  index={index + 1}
                  showIndex
                  onPlay={() => setQueue(initialSongs.length > 0 ? initialSongs : songs, index)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
