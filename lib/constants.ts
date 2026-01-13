export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export const STORAGE_KEYS = {
  USER_ID: "orpheus_user_id",
  SETTINGS: "orpheus_settings",
  QUEUE: "orpheus_queue",
  PLAYER_STATE: "orpheus_player_state",
  CACHE: "orpheus_cache",
  LIKED_SONGS: "orpheus_liked_songs",
  LIKED_PLAYLISTS: "orpheus_liked_playlists",
  RECENTLY_PLAYED: "orpheus_recently_played",
  RECENT_SEARCHES: "orpheus_recent_searches",
} as const

export const DEFAULT_SETTINGS = {
  language: "es" as const,
  theme: "dark" as const,
  accentColor: "blue" as const,
  streamQuality: "high" as const,
  proxyMode: "direct" as const,
  autoSkipSponsor: true,
  blockAds: false,
}

export const ACCENT_COLORS = {
  blue: {
    primary: "#3b82f6",
    accent: "#6366f1",
  },
  green: {
    primary: "#22c55e",
    accent: "#10b981",
  },
  violet: {
    primary: "#8b5cf6",
    accent: "#a855f7",
  },
  red: {
    primary: "#ef4444",
    accent: "#f43f5e",
  },
  orange: {
    primary: "#f97316",
    accent: "#fb923c",
  },
} as const

export const TABS = {
  HOME: "home",
  SEARCH: "search",
  LIBRARY: "library",
  SETTINGS: "settings",
} as const
