"use client"

// Minimal typings for the YouTube IFrame API without pulling an external package.
export type YTPlayerState = -1 | 0 | 1 | 2 | 3 | 5

export type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  loadVideoById: (args: { videoId: string; startSeconds?: number; suggestedQuality?: string }) => void
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void
  mute: () => void
  unMute: () => void
  isMuted: () => boolean
  setVolume: (volume: number) => void
  getVolume: () => number
  getDuration: () => number
  getCurrentTime: () => number
  getPlayerState: () => YTPlayerState
  setPlaybackRate: (rate: number) => void
  setPlaybackQuality: (quality: string) => void
  destroy: () => void
}

export type YTIframeAPI = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId?: string
      playerVars?: Record<string, unknown>
      events?: {
        onReady?: (event: { target: YTPlayer }) => void
        onStateChange?: (event: { data: YTPlayerState; target: YTPlayer }) => void
        onError?: (event: { data: number }) => void
      }
    },
  ) => YTPlayer
  PlayerState: {
    UNSTARTED: -1
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }
}

declare global {
  interface Window {
    YT?: YTIframeAPI
    onYouTubeIframeAPIReady?: () => void
  }
}

let loader: Promise<YTIframeAPI> | null = null

/**
 * Loads the YouTube IFrame API once and returns the global YT object.
 */
export function loadYoutubeIframeAPI(): Promise<YTIframeAPI> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API only available in the browser"))
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  if (loader) return loader

  loader = new Promise<YTIframeAPI>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>("script[src='https://www.youtube.com/iframe_api']")

    const handleReady = () => {
      if (window.YT?.Player) {
        resolve(window.YT)
      } else {
        reject(new Error("No se pudo inicializar la API de YouTube"))
      }
    }

    window.onYouTubeIframeAPIReady = handleReady

    const script = existingScript ?? document.createElement("script")
    script.src = "https://www.youtube.com/iframe_api"
    script.async = true
    script.onerror = () => {
      loader = null
      reject(new Error("No se pudo cargar YouTube IFrame API"))
    }

    if (!existingScript) {
      document.body.appendChild(script)
    } else {
      // If the script tag already exists, re-attach error handling while it finishes loading.
      existingScript.onerror = script.onerror
    }
  })

  return loader
}

/**
 * Cache for video availability — only populated when a real playback error occurs.
 * key: videoId, value: { available: boolean, timestamp: number }
 */
const AVAILABILITY_CACHE_KEY = "yt_availability_cache_v3"
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

type AvailabilityCache = Record<string, { available: boolean; timestamp: number }>

function getStoredCache(): AvailabilityCache {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem(AVAILABILITY_CACHE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function updateStoredCache(videoId: string, available: boolean) {
  if (typeof window === "undefined") return
  try {
    const cache = getStoredCache()
    cache[videoId] = { available, timestamp: Date.now() }
    localStorage.setItem(AVAILABILITY_CACHE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.warn("No se pudo actualizar el caché de disponibilidad", e)
  }
}

/**
 * Checks if a video is already known to be blocked from a previous real playback error.
 * This does NOT create any IFrame — it only reads the localStorage cache.
 * Returns true if the video is known to be blocked, false otherwise.
 */
export function isKnownBlocked(videoId: string): boolean {
  const cache = getStoredCache()
  const cached = cache[videoId]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return !cached.available
  }
  return false
}
