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
