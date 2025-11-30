// =============== CORE TYPES ===============

export interface Song {
  id: string
  ytid?: string
  title: string
  artist: string
  album?: string
  duration: number // seconds
  thumbnail: string
  thumbnailHigh?: string
  image?: string
  lowResImage?: string
  highResImage?: string
  isLive?: boolean
  channelId?: string
  source: "youtube" | "local"
  streamUrl?: string
}

export interface Playlist {
  id: string
  ytid?: string
  title: string
  description?: string
  thumbnail: string
  image?: string
  songCount: number
  source: "youtube" | "user" | "custom"
  songs?: Song[]
  createdAt?: string
  updatedAt?: string
  list?: Song[]
  isAlbum?: boolean
}

export interface Artist {
  id: string
  ytid?: string
  name: string
  image: string
  banner?: string
  handle?: string
  description?: string
  subscribers?: number
  monthlyListeners?: number
  isFollowing?: boolean
  topSongs?: Song[]
  playlists?: Playlist[]
  related?: Artist[]
  albums?: Album[]
  singles?: Album[]
}

export interface Album {
  id: string
  title: string
  artist: string
  thumbnail: string
  releaseDate?: string
  songs?: Song[]
  type: "album" | "single" | "ep"
}

// =============== PLAYER TYPES ===============

export type RepeatMode = "off" | "one" | "all"

export interface PlayerState {
  currentSong: Song | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  shuffle: boolean
  repeat: RepeatMode
  playbackRate: number
  isLoading: boolean
  error: string | null
}

export interface QueueState {
  items: Song[]
  currentIndex: number
  history: Song[]
}

// =============== SPONSORBLOCK ===============

export interface SponsorSegment {
  startTime: number
  endTime: number
  category?: "sponsor" | "intro" | "outro" | "selfpromo" | "music_offtopic"
}

// =============== LYRICS ===============

export interface LyricLine {
  time: number
  text: string
}

export interface Lyrics {
  found: boolean
  text: string
  lines: LyricLine[]
  synced: boolean
}

// =============== USER STATE ===============

export interface UserState {
  userId: string
  likedSongs: string[]
  likedPlaylists: string[]
  recentlyPlayed: Song[]
  customPlaylists: Playlist[]
  importedPlaylists: Playlist[]
}

export type UserRole = "guest" | "user" | "admin"

// =============== SETTINGS ===============

export type AccentColor = "blue" | "green" | "violet" | "red" | "orange"
export type Theme = "dark" | "light"
export type StreamQuality = "low" | "medium" | "high"
export type Language = "es" | "en"

export interface Settings {
  language: Language
  theme: Theme
  accentColor: AccentColor
  streamQuality: StreamQuality
  proxyMode: "direct" | "proxy" | "redirect"
  autoSkipSponsor: boolean
}

export type HomeSectionType = "featuredPlaylists" | "trendingSongs" | "popularArtists" | "moodPlaylists" | "recommendations"

export interface HomeSection {
  type: HomeSectionType
  itemIds: string[]
  collectionIds: string[]
}

export interface SongPreview {
  ytid: string
  title: string
  artist: string
  thumbnail?: string
  image?: string
  lowResImage?: string
  highResImage?: string
  duration?: number
  isLive?: boolean
}

export interface HomePreview {
  ytid: string
  title: string
  type: "song" | "playlist" | "artist"
  thumbnail?: string
  image?: string
  songCount?: number
  songs?: SongPreview[]
  artist?: string
  duration?: number
  isLive?: boolean
  mood?: string
  banner?: string
  subscribers?: number
  source?: "youtube" | "custom" | "curated-fallback"
}

// =============== API TYPES ===============

export interface SearchResult {
  songs: Song[]
  playlists: Playlist[]
}

export interface ApiResponse<T> {
  data: T
  error?: string
}
