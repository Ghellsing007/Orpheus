"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useRef, useEffect, useState } from "react"
import type { Song, PlayerState, RepeatMode, SponsorSegment } from "@/types"
import { addToRecentlyPlayed } from "@/lib/storage"
import { api } from "@/services/api"
import { useSettings } from "./settings-context"
import { loadYoutubeIframeAPI, type YTPlayer } from "@/lib/youtube"
import { cn } from "@/lib/utils"

type PlayerViewMode = "floating" | "expanded"

interface PlayerContextType extends PlayerState {
  // Playback controls
  play: (song?: Song) => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  previous: () => void
  seek: (time: number) => void

  // Settings
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  setPlaybackRate: (rate: number) => void

  // Segments
  setSegments: (segments: SponsorSegment[]) => void

  // Player ref + UI state
  playerRef: React.RefObject<YTPlayer | null>
  playerView: PlayerViewMode
  setPlayerView: (mode: PlayerViewMode) => void

  // Events
  registerOnEnded: (callback: () => void) => () => void
}

type PlayerAction =
  | { type: "SET_SONG"; song: Song | null }
  | { type: "SET_PLAYING"; isPlaying: boolean }
  | { type: "SET_TIME"; currentTime: number }
  | { type: "SET_DURATION"; duration: number }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "SET_MUTED"; isMuted: boolean }
  | { type: "SET_SHUFFLE"; shuffle: boolean }
  | { type: "SET_REPEAT"; repeat: RepeatMode }
  | { type: "SET_PLAYBACK_RATE"; rate: number }
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_ERROR"; error: string | null }

const initialState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  shuffle: false,
  repeat: "off",
  playbackRate: 1,
  isLoading: false,
  error: null,
}

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "SET_SONG":
      return { ...state, currentSong: action.song, currentTime: 0, duration: 0 }
    case "SET_PLAYING":
      return { ...state, isPlaying: action.isPlaying }
    case "SET_TIME":
      return { ...state, currentTime: action.currentTime }
    case "SET_DURATION":
      return { ...state, duration: action.duration }
    case "SET_VOLUME":
      return { ...state, volume: action.volume }
    case "SET_MUTED":
      return { ...state, isMuted: action.isMuted }
    case "SET_SHUFFLE":
      return { ...state, shuffle: action.shuffle }
    case "SET_REPEAT":
      return { ...state, repeat: action.repeat }
    case "SET_PLAYBACK_RATE":
      return { ...state, playbackRate: action.rate }
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading }
    case "SET_ERROR":
      return { ...state, error: action.error }
    default:
      return state
  }
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState)
  const playerRef = useRef<YTPlayer | null>(null)
  const playerContainerRef = useRef<HTMLDivElement | null>(null)
  const segmentsRef = useRef<SponsorSegment[]>([])
  const endedCallbacksRef = useRef(new Set<() => void>())
  const volumeRef = useRef(initialState.volume)
  const mutedRef = useRef(initialState.isMuted)
  const rateRef = useRef(initialState.playbackRate)
  const [playerReady, setPlayerReady] = useState(false)
  const [playerView, setPlayerView] = useState<PlayerViewMode>("floating")
  const { streamQuality, userId } = useSettings()

  const registerOnEnded = useCallback((callback: () => void) => {
    endedCallbacksRef.current.add(callback)
    return () => endedCallbacksRef.current.delete(callback)
  }, [])

  const applyVolume = useCallback((volume: number, muted: boolean) => {
    const player = playerRef.current
    if (!player) return

    if (muted) {
      player.mute()
      player.setVolume(0)
      return
    }

    player.unMute()
    player.setVolume(Math.round(Math.min(Math.max(volume, 0), 1) * 100))
  }, [])

  const play = useCallback((song?: Song) => {
    if (song) {
      dispatch({ type: "SET_SONG", song })
      dispatch({ type: "SET_LOADING", isLoading: true })
      dispatch({ type: "SET_ERROR", error: null })
      addToRecentlyPlayed(song)
    }
    if (!song && !state.currentSong) return

    if (playerRef.current) {
      playerRef.current.playVideo()
    }
    dispatch({ type: "SET_PLAYING", isPlaying: true })
  }, [state.currentSong])

  const pause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo()
    }
    dispatch({ type: "SET_PLAYING", isPlaying: false })
  }, [])

  const togglePlay = useCallback(() => {
    if (!state.currentSong) return
    const shouldPlay = !state.isPlaying
    if (playerRef.current) {
      if (shouldPlay) {
        playerRef.current.playVideo()
      } else {
        playerRef.current.pauseVideo()
      }
    }
    dispatch({ type: "SET_PLAYING", isPlaying: !state.isPlaying })
  }, [state.currentSong, state.isPlaying])

  const next = useCallback(() => {
    // Will be handled by queue context
  }, [])

  const previous = useCallback(() => {
    if (state.currentTime > 3) {
      playerRef.current?.seekTo(0, true)
    }
    // Will be handled by queue context
  }, [state.currentTime])

  const seek = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true)
    }
    dispatch({ type: "SET_TIME", currentTime: time })
  }, [])

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: "SET_VOLUME", volume })
    if (volume > 0 && state.isMuted) {
      dispatch({ type: "SET_MUTED", isMuted: false })
      applyVolume(volume, false)
      return
    }
    if (volume === 0 && !state.isMuted) {
      dispatch({ type: "SET_MUTED", isMuted: true })
      applyVolume(volume, true)
      return
    }
    applyVolume(volume, state.isMuted)
  }, [applyVolume, state.isMuted])

  const toggleMute = useCallback(() => {
    dispatch({ type: "SET_MUTED", isMuted: !state.isMuted })
    applyVolume(state.volume, !state.isMuted)
  }, [applyVolume, state.isMuted, state.volume])

  const toggleShuffle = useCallback(() => {
    dispatch({ type: "SET_SHUFFLE", shuffle: !state.shuffle })
  }, [state.shuffle])

  const cycleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ["off", "all", "one"]
    const currentIndex = modes.indexOf(state.repeat)
    const nextIndex = (currentIndex + 1) % modes.length
    dispatch({ type: "SET_REPEAT", repeat: modes[nextIndex] })
  }, [state.repeat])

  const setPlaybackRate = useCallback((rate: number) => {
    dispatch({ type: "SET_PLAYBACK_RATE", rate })
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate)
    }
  }, [])

  const setSegments = useCallback((segments: SponsorSegment[]) => {
    segmentsRef.current = segments
  }, [])

  useEffect(() => {
    volumeRef.current = state.volume
  }, [state.volume])

  useEffect(() => {
    mutedRef.current = state.isMuted
  }, [state.isMuted])

  useEffect(() => {
    rateRef.current = state.playbackRate
  }, [state.playbackRate])

  // Init YouTube player
  useEffect(() => {
    let cancelled = false

    if (typeof window === "undefined") return

    loadYoutubeIframeAPI()
      .then((YT) => {
        if (cancelled || !playerContainerRef.current) return
        playerRef.current = new YT.Player(playerContainerRef.current, {
          playerVars: {
            controls: 0,
            rel: 0,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (cancelled) return
              setPlayerReady(true)
              applyVolume(volumeRef.current, mutedRef.current)
              if (playerRef.current) {
                playerRef.current.setPlaybackRate(rateRef.current)
              }
            },
            onStateChange: (event) => {
              if (cancelled) return
              const status = event.data

              if (status === 1) {
                dispatch({ type: "SET_PLAYING", isPlaying: true })
                dispatch({ type: "SET_LOADING", isLoading: false })
                const duration = playerRef.current?.getDuration?.() ?? 0
                if (duration) dispatch({ type: "SET_DURATION", duration })
              }

              if (status === 2) {
                dispatch({ type: "SET_PLAYING", isPlaying: false })
              }

              if (status === 0) {
                dispatch({ type: "SET_PLAYING", isPlaying: false })
                endedCallbacksRef.current.forEach((cb) => cb())
              }

              if (status === 3) {
                dispatch({ type: "SET_LOADING", isLoading: true })
              }

              if (status === 5) {
                dispatch({ type: "SET_LOADING", isLoading: false })
                dispatch({ type: "SET_TIME", currentTime: 0 })
              }
            },
            onError: () => {
              if (cancelled) return
              dispatch({ type: "SET_ERROR", error: "No se pudo cargar el video" })
              dispatch({ type: "SET_PLAYING", isPlaying: false })
              dispatch({ type: "SET_LOADING", isLoading: false })
            },
          },
        })
      })
      .catch(() => {
        if (!cancelled) {
          dispatch({ type: "SET_ERROR", error: "No pudimos inicializar el reproductor" })
        }
      })

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [applyVolume])

  // Load video when the song changes
  useEffect(() => {
    if (!state.currentSong || !playerReady || !playerRef.current) return

    const videoId = state.currentSong.ytid || state.currentSong.id
    if (!videoId) {
      dispatch({ type: "SET_ERROR", error: "Esta pista no tiene un video de YouTube" })
      return
    }

    dispatch({ type: "SET_LOADING", isLoading: true })
    dispatch({ type: "SET_ERROR", error: null })
    dispatch({ type: "SET_TIME", currentTime: 0 })
    dispatch({ type: "SET_DURATION", duration: state.currentSong.duration })

    try {
      const quality =
        streamQuality === "high" ? "hd720" : streamQuality === "medium" ? "large" : streamQuality === "low" ? "small" : undefined

      playerRef.current.loadVideoById({
        videoId,
        startSeconds: 0,
        suggestedQuality: quality,
      })
      if (quality) playerRef.current.setPlaybackQuality(quality)
      playerRef.current.playVideo()
      dispatch({ type: "SET_PLAYING", isPlaying: true })
    } catch (error) {
      dispatch({ type: "SET_ERROR", error: "No se pudo cargar el video" })
      dispatch({ type: "SET_PLAYING", isPlaying: false })
      dispatch({ type: "SET_LOADING", isLoading: false })
    }

    api
      .getSegments(state.currentSong.id)
      .then((segments) => setSegments(segments))
      .catch(() => setSegments([]))

    if (userId) {
      api.addToRecently(userId, state.currentSong.id).catch(() => {})
    }
  }, [playerReady, state.currentSong, streamQuality, userId, setSegments])

  // Update current time & skip sponsor blocks
  useEffect(() => {
    if (!playerReady) return

    const interval = window.setInterval(() => {
      const player = playerRef.current
      if (!player) return

      const currentTime = player.getCurrentTime?.() ?? 0
      const duration = player.getDuration?.() ?? 0
      dispatch({ type: "SET_TIME", currentTime })
      if (duration) {
        dispatch({ type: "SET_DURATION", duration })
      }

      for (const segment of segmentsRef.current) {
        if (currentTime >= segment.startTime && currentTime < segment.endTime) {
          player.seekTo(segment.endTime, true)
          break
        }
      }
    }, 500)

    return () => window.clearInterval(interval)
  }, [playerReady])

  // Keep volume/mute/play state in sync when toggling controls
  useEffect(() => {
    applyVolume(state.volume, state.isMuted)
  }, [applyVolume, state.isMuted, state.volume])

  useEffect(() => {
    const player = playerRef.current
    if (!player || !playerReady) return
    const status = player.getPlayerState?.()
    if (state.isPlaying && status !== 1) {
      player.playVideo()
    }
    if (!state.isPlaying && status === 1) {
      player.pauseVideo()
    }
  }, [playerReady, state.isPlaying])

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        play,
        pause,
        togglePlay,
        next,
        previous,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        setPlaybackRate,
        setSegments,
        playerRef,
        playerView,
        setPlayerView,
        registerOnEnded,
      }}
    >
      {children}
      <div
        className={cn(
          "fixed z-50 transition-all duration-500 ease-in-out rounded-2xl overflow-hidden bg-black/40 backdrop-blur-lg border border-border/60 shadow-2xl [&>div>iframe]:w-full [&>div>iframe]:h-full [&>div>iframe]:rounded-2xl",
          !state.currentSong
            ? "opacity-0 scale-95 pointer-events-none"
            : playerView === "expanded"
              ? "top-24 left-1/2 -translate-x-1/2 w-[90vw] max-w-[560px] aspect-video opacity-100"
              : "bottom-0 right-0 translate-x-[160%] translate-y-[160%] w-40 md:w-48 aspect-video opacity-100",
        )}
      >
        <div ref={playerContainerRef} className="w-full h-full bg-gradient-to-br from-primary/30 via-background to-background" />
      </div>
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider")
  }
  return context
}
