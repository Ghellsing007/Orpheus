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
 * Cache for video availability to avoid redundant checks.
 * key: videoId, value: { available: boolean, timestamp: number }
 */
const AVAILABILITY_CACHE_KEY = "yt_availability_cache_v2"
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
 * Checks if a YouTube video is available and not restricted.
 * Uses a hidden iframe player to verify.
 */
export async function checkVideoAvailability(videoId: string, priority = false): Promise<boolean> {
  const cache = getStoredCache()
  const cached = cache[videoId]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.available
  }

  try {
    const YT = await loadYoutubeIframeAPI()

    return new Promise((resolve) => {
      const container = document.createElement("div")
      container.style.position = "absolute"
      container.style.width = "0"
      container.style.height = "0"
      container.style.pointerEvents = "none"
      container.style.opacity = "0"
      container.id = `checker-${videoId}-${Math.random().toString(36).substr(2, 9)}`
      document.body.appendChild(container)

      let resolved = false
      const timeout = setTimeout(() => {
        if (!resolved) {
          cleanup(false)
        }
      }, 2500) // Reducido de 5s a 2.5s para mayor rapidez

      const cleanup = (result: boolean) => {
        if (resolved) return
        resolved = true
        clearTimeout(timeout)
        updateStoredCache(videoId, result)
        player.destroy()
        container.remove()
        resolve(result)
      }

      const player = new YT.Player(container, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            // Intentar reproducir para forzar la verificación de restricciones
            event.target.playVideo()

            // Si después de un momento no ha cambiado a PLAYING o BUFFERING, 
            // y no ha dado error, podría estar bloqueado silenciosamente
            setTimeout(() => {
              if (!resolved) {
                const state = event.target.getPlayerState()
                // Si sigue en UNSTARTED (-1) o CUED (5) después de playVideo, algo va mal
                if (state === -1 || state === 5) {
                  cleanup(false)
                }
              }
            }, 800) // Reducido de 1500ms a 800ms
          },
          onStateChange: (event) => {
            // Si llega a PLAYING (1) o BUFFERING (3), el video es reproducible
            if (resolved) return
            if (event.data === 1 || event.data === 3) {
              cleanup(true)
            }
          },
          onError: (event) => {
            // Captura errores de restricción de inserción (101, 150)
            cleanup(false)
          },
        },
      })
    })
  } catch (error) {
    console.error(`Error verificando disponibilidad para ${videoId}:`, error)
    return true // Assume available if API fails to load to avoid false negatives
  }
}
