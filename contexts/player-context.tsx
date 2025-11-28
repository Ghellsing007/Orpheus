"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from "react"
import type { Song, PlayerState, RepeatMode, SponsorSegment } from "@/types"
import { addToRecentlyPlayed } from "@/lib/storage"
import { api } from "@/services/api"
import { useSettings } from "./settings-context"

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

  // Audio ref
  audioRef: React.RefObject<HTMLAudioElement | null>
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
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const segmentsRef = useRef<SponsorSegment[]>([])
  const { streamQuality, proxyMode, userId } = useSettings()

  const play = useCallback((song?: Song) => {
    if (song) {
      dispatch({ type: "SET_SONG", song })
      dispatch({ type: "SET_LOADING", isLoading: true })
      addToRecentlyPlayed(song)
    }
    dispatch({ type: "SET_PLAYING", isPlaying: true })
  }, [])

  const pause = useCallback(() => {
    dispatch({ type: "SET_PLAYING", isPlaying: false })
  }, [])

  const togglePlay = useCallback(() => {
    dispatch({ type: "SET_PLAYING", isPlaying: !state.isPlaying })
  }, [state.isPlaying])

  const next = useCallback(() => {
    // Will be handled by queue context
  }, [])

  const previous = useCallback(() => {
    if (state.currentTime > 3) {
      audioRef.current?.currentTime && (audioRef.current.currentTime = 0)
    }
    // Will be handled by queue context
  }, [state.currentTime])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
    dispatch({ type: "SET_TIME", currentTime: time })
  }, [])

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: "SET_VOLUME", volume })
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [])

  const toggleMute = useCallback(() => {
    dispatch({ type: "SET_MUTED", isMuted: !state.isMuted })
    if (audioRef.current) {
      audioRef.current.muted = !state.isMuted
    }
  }, [state.isMuted])

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
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }, [])

  const setSegments = useCallback((segments: SponsorSegment[]) => {
    segmentsRef.current = segments
  }, [])

  // Load stream URL + segments when song changes
  useEffect(() => {
    const song = state.currentSong
    if (!song) return
    let cancelled = false

    const loadStream = async () => {
      dispatch({ type: "SET_LOADING", isLoading: true })
      try {
        const mode = proxyMode === "redirect" ? "redirect" : proxyMode === "proxy" ? "proxy" : "url"
        const streamUrl = await api.getStreamUrl(song.id, streamQuality, mode, proxyMode === "proxy")

        if (cancelled) return
        if (audioRef.current) {
          audioRef.current.src = streamUrl
          audioRef.current.load()
          await audioRef.current.play()
        }
        dispatch({ type: "SET_PLAYING", isPlaying: true })

        const segments = await api.getSegments(song.id).catch(() => [])
        if (!cancelled) {
          setSegments(segments)
        }

        if (userId) {
          api.addToRecently(userId, song.id).catch(() => {})
        }
      } catch (error) {
        if (!cancelled) {
          dispatch({ type: "SET_ERROR", error: "No se pudo cargar el stream" })
          dispatch({ type: "SET_PLAYING", isPlaying: false })
        }
      } finally {
        if (!cancelled) {
          dispatch({ type: "SET_LOADING", isLoading: false })
        }
      }
    }

    loadStream()

    return () => {
      cancelled = true
    }
  }, [state.currentSong, streamQuality, proxyMode, userId, setSegments])

  // Handle time update and sponsor skip
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      dispatch({ type: "SET_TIME", currentTime: audio.currentTime })

      // Auto-skip sponsor segments
      for (const segment of segmentsRef.current) {
        if (audio.currentTime >= segment.startTime && audio.currentTime < segment.endTime) {
          audio.currentTime = segment.endTime
          break
        }
      }
    }

    const handleLoadedMetadata = () => {
      dispatch({ type: "SET_DURATION", duration: audio.duration })
      dispatch({ type: "SET_LOADING", isLoading: false })
    }

    const handleEnded = () => {
      dispatch({ type: "SET_PLAYING", isPlaying: false })
    }

    const handleError = () => {
      dispatch({ type: "SET_ERROR", error: "Error loading audio" })
      dispatch({ type: "SET_LOADING", isLoading: false })
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [])

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (state.isPlaying) {
      audio.play().catch(() => {
        dispatch({ type: "SET_PLAYING", isPlaying: false })
      })
    } else {
      audio.pause()
    }
  }, [state.isPlaying])

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
        audioRef,
      }}
    >
      {children}
      <audio ref={audioRef} preload="metadata" />
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
