import { STORAGE_KEYS, DEFAULT_SETTINGS } from "./constants"
import type { Settings, Song, QueueState } from "@/types"

// Generate or get userId
export function getUserId(): string {
  if (typeof window === "undefined") return ""

  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID)
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
  }
  return userId
}

export function regenerateUserId(): string {
  if (typeof window === "undefined") return ""

  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  localStorage.setItem(STORAGE_KEYS.USER_ID, userId)
  return userId
}

// Settings
export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Partial<Settings>): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS

  const current = getSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated))
  return updated
}

// Queue
export function getQueue(): QueueState {
  if (typeof window === "undefined") return { items: [], currentIndex: 0, history: [] }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUEUE)
    return stored ? JSON.parse(stored) : { items: [], currentIndex: 0, history: [] }
  } catch {
    return { items: [], currentIndex: 0, history: [] }
  }
}

export function saveQueue(queue: QueueState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue))
}

// Liked Songs
export function getLikedSongs(): string[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LIKED_SONGS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function toggleLikedSong(songId: string): boolean {
  if (typeof window === "undefined") return false

  const liked = getLikedSongs()
  const index = liked.indexOf(songId)
  const isLiked = index === -1

  if (isLiked) {
    liked.push(songId)
  } else {
    liked.splice(index, 1)
  }

  localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(liked))
  return isLiked
}

// Recently Played
export function getRecentlyPlayed(): Song[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addToRecentlyPlayed(song: Song): void {
  if (typeof window === "undefined") return

  const recent = getRecentlyPlayed()
  const filtered = recent.filter((s) => s.id !== song.id)
  const updated = [song, ...filtered].slice(0, 50)
  localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(updated))
}

// Recent Searches
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addRecentSearch(term: string): string[] {
  if (typeof window === "undefined") return []
  const normalized = term.trim()
  if (!normalized) return getRecentSearches()

  const recent = getRecentSearches().filter((t) => t.toLowerCase() !== normalized.toLowerCase())
  const updated = [normalized, ...recent].slice(0, 7)
  localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated))
  return updated
}

export function removeRecentSearch(term: string): string[] {
  if (typeof window === "undefined") return []
  const normalized = term.trim()
  const recent = getRecentSearches().filter((t) => t.toLowerCase() !== normalized.toLowerCase())
  localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(recent))
  return recent
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES)
}

// Export/Import State
export function exportState(): string {
  if (typeof window === "undefined") return "{}"

  const state = {
    userId: getUserId(),
    settings: getSettings(),
    queue: getQueue(),
    likedSongs: getLikedSongs(),
    recentlyPlayed: getRecentlyPlayed(),
    recentSearches: getRecentSearches(),
    exportedAt: new Date().toISOString(),
  }

  return JSON.stringify(state, null, 2)
}

export function importState(jsonString: string): boolean {
  if (typeof window === "undefined") return false

  try {
    const state = JSON.parse(jsonString)

    if (state.userId) localStorage.setItem(STORAGE_KEYS.USER_ID, state.userId)
    if (state.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings))
    if (state.queue) localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(state.queue))
    if (state.likedSongs) localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(state.likedSongs))
    if (state.recentlyPlayed) localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(state.recentlyPlayed))
    if (state.recentSearches) localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(state.recentSearches))

    return true
  } catch {
    return false
  }
}

export function clearCache(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem(STORAGE_KEYS.CACHE)

  if ("caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name))
    })
  }
}
