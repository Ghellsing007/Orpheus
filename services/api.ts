import { API_BASE_URL } from "@/lib/constants"
import type {
  Song,
  Playlist,
  Artist,
  SponsorSegment,
  Lyrics,
  HomePreview,
  HomeSection,
  SongPreview,
} from "@/types"
import type { UserProfile } from "@/types/user"

type CuratedResolved = {
  trendingSongs?: (HomePreview | SongPreview)[]
  featuredPlaylists?: HomePreview[]
  popularArtists?: HomePreview[]
  moodPlaylists?: HomePreview[]
}

type ApiSong = {
  id?: number
  ytid: string
  title: string
  artist: string
  channelId?: string
  image?: string
  lowResImage?: string
  highResImage?: string
  thumbnail?: string
  duration: number
  isLive?: boolean
}

type ApiPlaylist = {
  ytid: string
  id?: string
  title: string
  image?: string
  source?: string
  list?: ApiSong[]
  songs?: ApiSong[]
  isAlbum?: boolean
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL.replace(/\/$/, "")
  }

  private async fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  private mapSong(input: ApiSong): Song {
    const thumbnail =
      input.thumbnail ||
      input.highResImage ||
      input.image ||
      input.lowResImage ||
      ""
    return {
      id: input.ytid || String(input.id ?? ""),
      ytid: input.ytid,
      title: input.title,
      artist: input.artist,
      duration: input.duration,
      thumbnail,
      thumbnailHigh: input.highResImage || thumbnail,
      image: input.image,
      lowResImage: input.lowResImage,
      highResImage: input.highResImage,
      isLive: input.isLive,
      channelId: (input as any).channelId || (input as any).artistId,
      source: "orpheus",
    }
  }

  private mapPlaylist(input: ApiPlaylist): Playlist {
    const rawSongs = input.songs ?? input.list ?? []
    const songs = rawSongs.map((song) => this.mapSong(song))
    return {
      id: input.ytid || input.id || "",
      ytid: input.ytid || input.id,
      title: input.title,
      thumbnail: input.image || songs?.[0]?.thumbnail || "",
      image: input.image,
      songCount: songs?.length ?? 0,
      source: input.source === "user-created" ? "custom" : "orpheus",
      songs,
      list: songs,
      isAlbum: input.isAlbum,
    }
  }

  private mapChannel(input: any): Artist {
    const playlists = (input.playlists || []).map((pl: any) =>
      this.mapPlaylist({
        ytid: pl.ytid || pl.id,
        id: pl.ytid || pl.id,
        title: pl.title,
        image: pl.image,
        source: "orpheus",
        list: pl.list,
        isAlbum: pl.isAlbum,
      }),
    )

    return {
      id: input.ytid || input.id || "",
      ytid: input.ytid || input.id,
      name: input.title || input.name || "",
      image: input.image || "",
      banner: input.banner,
      handle: input.handle,
      description: input.description,
      subscribers: input.subscribers,
      topSongs: (input.topSongs || []).map((s: any) => this.mapSong(s)),
      playlists,
      related: (input.related || []).map((a: any) => this.mapChannel(a)),
    }
  }

  // Health check
  async health(): Promise<{ status: string }> {
    return this.fetchJson("/health")
  }

  // Search
  async searchSongs(query: string): Promise<Song[]> {
    const data = await this.fetchJson<{ items: ApiSong[] }>(`/search?q=${encodeURIComponent(query)}`)
    return (data.items || []).map((song) => this.mapSong(song))
  }

  async suggestions(query: string): Promise<string[]> {
    const data = await this.fetchJson<{ items: string[] }>(`/suggestions?q=${encodeURIComponent(query)}`)
    return data.items || []
  }

  // Playlists
  async getPlaylists(params: { query?: string; type?: string; online?: boolean; page?: number; limit?: number }): Promise<Playlist[]> {
    const searchParams = new URLSearchParams()
    if (params.query) searchParams.set("query", params.query)
    if (params.type) searchParams.set("type", params.type)
    if (params.online !== undefined) searchParams.set("online", String(params.online))
    if (params.page) searchParams.set("page", String(params.page))
    if (params.limit) searchParams.set("limit", String(params.limit))

    const data = await this.fetchJson<{ items: ApiPlaylist[] }>(`/playlists?${searchParams.toString()}`)
    return (data.items || []).map((playlist) => this.mapPlaylist(playlist))
  }

  async getPlaylist(id: string, userId?: string): Promise<Playlist> {
    const params = userId ? `?userId=${userId}` : ""
    const data = await this.fetchJson<ApiPlaylist>(`/playlists/${id}${params}`)
    return this.mapPlaylist(data)
  }

  // Songs
  async getSong(id: string): Promise<Song> {
    const data = await this.fetchJson<ApiSong>(`/songs/${encodeURIComponent(id)}`)
    return this.mapSong(data)
  }

  async loadSongResilient(id: string): Promise<Song> {
    try {
      return await this.getSong(id)
    } catch (e) {
      console.warn(`getSong failed for ${id}, trying fallback...`)
      const songs = await this.getSongsByIds([id])
      if (songs.length > 0) return songs[0]

      const searchResults = await this.searchSongs(id)
      const found = searchResults.find(s => s.ytid === id || s.id === id)
      if (found) return found

      throw e
    }
  }

  async getSongsByIds(ids: string[]): Promise<Song[]> {
    if (ids.length === 0) return []
    const params = new URLSearchParams({ ids: ids.join(",") })
    const data = await this.fetchJson<{ items: ApiSong[] }>(`/media/songs?${params.toString()}`)
    return (data.items || []).map((song) => this.mapSong(song))
  }

  async getPlaylistsByIds(ids: string[]): Promise<Playlist[]> {
    if (ids.length === 0) return []
    const params = new URLSearchParams({ ids: ids.join(",") })
    const data = await this.fetchJson<{ items: ApiPlaylist[] }>(`/media/playlists?${params.toString()}`)
    return (data.items || []).map((playlist) => this.mapPlaylist(playlist))
  }

  async getArtistsByIds(ids: string[]): Promise<Artist[]> {
    if (ids.length === 0) return []
    const params = new URLSearchParams({ ids: ids.join(",") })
    const data = await this.fetchJson<{ items: any[] }>(`/media/artists?${params.toString()}`)
    return (data.items || []).map((artist) => this.mapChannel(artist))
  }

  async getStreamUrl(id: string, quality = "high", mode: "url" | "redirect" | "proxy" = "url", proxy = false) {
    const params = new URLSearchParams({ quality, mode, proxy: String(proxy) })
    const response = await fetch(`${this.baseUrl}/songs/${id}/stream?${params.toString()}`, {
      redirect: "follow",
    })

    if (mode === "redirect") {
      if (response.url) return response.url
      throw new Error("Stream redirect sin URL")
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    if (!data?.url) throw new Error("Stream URL no disponible")
    return data.url as string
  }

  async getSegments(id: string): Promise<SponsorSegment[]> {
    const data = await this.fetchJson<{ items: { start: number; end: number }[] }>(`/songs/${id}/segments`)
    return (data.items || []).map((segment) => ({
      startTime: segment.start,
      endTime: segment.end,
      category: "sponsor",
    }))
  }

  // Lyrics
  async getLyrics(artist: string, title: string): Promise<Lyrics> {
    const params = new URLSearchParams({ artist, title })
    const data = await this.fetchJson<{ lyrics: string | null; found: boolean }>(`/lyrics?${params.toString()}`)
    const text = data.lyrics ?? ""
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ time: 0, text: line }))

    return {
      found: data.found,
      text,
      lines,
      synced: false,
    }
  }

  // Recommendations
  async getRecommendations(userId?: string): Promise<Song[]> {
    const endpoint = userId ? `/recommendations?userId=${userId}` : "/recommendations"
    const data = await this.fetchJson<{ items: ApiSong[] }>(endpoint)
    return (data.items || []).map((song) => this.mapSong(song))
  }

  // User State
  async getUserState(userId: string) {
    const data = await this.fetchJson<{
      likedSongs: ApiSong[]
      likedPlaylists: ApiPlaylist[]
      likedArtists: any[]
      recentlyPlayed: ApiSong[]
      customPlaylists: ApiPlaylist[]
      playlistFolders: any[]
      youtubePlaylists: string[] // Keep key for API compatibility
    }>(`/users/${userId}/state`)

    return {
      likedSongs: (data.likedSongs || []).map((song) => this.mapSong(song)),
      likedPlaylists: (data.likedPlaylists || []).map((pl) => this.mapPlaylist(pl)),
      likedArtists: (data.likedArtists || []).map((artist) => this.mapChannel(artist)),
      recentlyPlayed: (data.recentlyPlayed || []).map((song) => this.mapSong(song)),
      customPlaylists: (data.customPlaylists || []).map((pl) => this.mapPlaylist(pl)),
      playlistFolders: data.playlistFolders || [],
      youtubePlaylists: data.youtubePlaylists || [],
    }
  }

  async likeSong(userId: string, songId: string, add: boolean): Promise<void> {
    await this.fetchJson(`/users/${userId}/likes/song`, {
      method: "POST",
      body: JSON.stringify({ songId, add }),
    })
  }

  async likePlaylist(userId: string, playlistId: string, add: boolean): Promise<void> {
    await this.fetchJson(`/users/${userId}/likes/playlist`, {
      method: "POST",
      body: JSON.stringify({ playlistId, add }),
    })
  }

  async likeArtist(userId: string, artistId: string, add: boolean): Promise<void> {
    await this.fetchJson(`/users/${userId}/likes/artist`, {
      method: "POST",
      body: JSON.stringify({ artistId, add }),
    })
  }

  async addToRecently(userId: string, songId: string): Promise<void> {
    await this.fetchJson(`/users/${userId}/recently`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    })
  }

  async importYoutubePlaylist(userId: string, playlistId: string): Promise<Playlist[]> {
    const data = await this.fetchJson<{ youtubePlaylists: string[] }>(`/users/${userId}/playlists/youtube`, {
      method: "POST",
      body: JSON.stringify({ playlistId }),
    })
    return data.youtubePlaylists as unknown as Playlist[]
  }

  async createCustomPlaylist(userId: string, title: string, image?: string): Promise<Playlist[]> {
    const payload: { title: string; image?: string } = { title }
    if (image) payload.image = image
    const data = await this.fetchJson<{ customPlaylists: ApiPlaylist[] }>(`/users/${userId}/playlists/custom`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return (data.customPlaylists || []).map((pl) => this.mapPlaylist(pl))
  }

  async addSongToPlaylist(userId: string, playlistId: string, songId: string): Promise<void> {
    await this.fetchJson(`/users/${userId}/playlists/custom/${playlistId}/songs`, {
      method: "POST",
      body: JSON.stringify({ songId }),
    })
  }

  async searchChannels(query: string) {
    const data = await this.fetchJson<{ items: any[] }>(`/channel/search?q=${encodeURIComponent(query)}`)
    return (data.items || []).map((item) => this.mapChannel(item))
  }

  async getChannel(id: string) {
    const data = await this.fetchJson<any>(`/channel/${id}`)
    return this.mapChannel(data)
  }

  async getCuratedHome(): Promise<{
    sections: HomeSection[]
    previews: Record<string, HomePreview>
    status: Record<string, number>
    updatedAt: string
    resolved?: CuratedResolved
  }> {
    const data = await this.fetchJson<{
      sections: HomeSection[]
      previews: Record<string, HomePreview>
      status: Record<string, number>
      updatedAt: string
      resolved?: CuratedResolved
    }>("/home/curated")
    return data
  }

  async registerUser(payload: {
    userId: string
    displayName?: string
    username?: string
    email?: string
    avatarUrl?: string
    phone?: string
    role?: string
  }): Promise<UserProfile> {
    const data = await this.fetchJson<UserProfile>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return data
  }

  async loginUser(payload: { userId?: string; username?: string; email?: string }): Promise<UserProfile> {
    const data = await this.fetchJson<UserProfile>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return data
  }

  async updateProfile(payload: {
    userId: string
    displayName?: string
    username?: string
    email?: string
    avatarUrl?: string
    phone?: string
  }): Promise<UserProfile> {
    const data = await this.fetchJson<UserProfile>("/auth/profile", {
      method: "POST",
      body: JSON.stringify(payload),
    })
    return data
  }
}

export const api = new ApiService()
