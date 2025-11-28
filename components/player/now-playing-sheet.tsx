"use client"

import type React from "react"
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  Mic2,
  Volume2,
  VolumeX,
  ChevronDown,
} from "lucide-react"
import { usePlayer } from "@/contexts/player-context"
import { useQueue } from "@/contexts/queue-context"
import { formatDuration, cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { getLikedSongs, toggleLikedSong } from "@/lib/storage"
import { api } from "@/services/api"

interface NowPlayingSheetProps {
  open: boolean
  onClose: () => void
}

type Tab = "playing" | "lyrics" | "queue"

export function NowPlayingSheet({ open, onClose }: NowPlayingSheetProps) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    setPlayerView,
  } = usePlayer()
  const { playNext, playPrevious, items, currentIndex, playFromQueue, removeFromQueue } = useQueue()
  const [activeTab, setActiveTab] = useState<Tab>("playing")
  const [isLiked, setIsLiked] = useState(false)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const [lyrics, setLyrics] = useState<string[]>([])
  const [lyricsFound, setLyricsFound] = useState(true)

  useEffect(() => {
    if (currentSong) {
      setIsLiked(getLikedSongs().includes(currentSong.id))
    }
  }, [currentSong])

  // Fetch lyrics for the current song
  useEffect(() => {
    if (!currentSong) return
    let cancelled = false
    setLyrics([])
    setLyricsFound(true)

    api
      .getLyrics(currentSong.artist, currentSong.title)
      .then((res) => {
        if (cancelled) return
        setLyrics(res.lines.map((l) => l.text))
        setLyricsFound(res.found)
      })
      .catch(() => {
        if (!cancelled) setLyricsFound(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentSong])

  // Update current lyric based on time (approximate spread across lines)
  useEffect(() => {
    if (!lyrics.length || duration === 0) return
    const ratio = Math.min(1, currentTime / duration)
    const index = Math.floor(ratio * lyrics.length)
    setCurrentLyricIndex(Math.min(index, lyrics.length - 1))
  }, [currentTime, duration, lyrics.length])

  useEffect(() => {
    if (!lyrics.length) {
      setCurrentLyricIndex(0)
      return
    }
  }, [lyrics])

  useEffect(() => {
    if (!open) {
      setPlayerView("floating")
      return
    }
    setPlayerView(activeTab === "playing" ? "expanded" : "floating")
  }, [open, activeTab, setPlayerView])

  const handleLike = () => {
    if (currentSong) {
      const newLiked = toggleLikedSong(currentSong.id)
      setIsLiked(newLiked)
    }
  }

  if (!open || !currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seek(percent * duration)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background slide-up">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-foreground-muted hover:text-foreground rounded-full hover:bg-card transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          <span className="text-sm font-medium text-foreground-muted">Reproduciendo ahora</span>
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col px-6 pb-6 overflow-hidden">
          {activeTab === "playing" && (
            <>
              {/* Album Art */}
              <div className="flex-1 flex items-center justify-center py-6">
                <div className="relative w-full max-w-[320px] md:max-w-[540px] aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-border/60 bg-card/70">
                  <img
                    src={currentSong.thumbnail || "/placeholder.svg?height=400&width=400&query=album art"}
                    alt={currentSong.title}
                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/50 to-background/80" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
                    <p className="text-sm text-foreground-muted">El video de YouTube se centra aqui al desplegar.</p>
                    <p className="text-xs text-foreground-subtle">
                      Al minimizar se mueve como vista flotante sin pausar la reproduccion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Song Info */}
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold truncate">{currentSong.title}</h2>
                    <p className="text-foreground-muted text-lg truncate">{currentSong.artist}</p>
                  </div>
                  <button
                    onClick={handleLike}
                    className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-full transition-all",
                      isLiked ? "text-primary" : "text-foreground-muted hover:text-foreground",
                    )}
                  >
                    <Heart className={cn("w-7 h-7", isLiked && "fill-current")} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-1.5 bg-card rounded-full cursor-pointer group" onClick={handleSeek}>
                    <div
                      className="h-full bg-primary rounded-full relative transition-all"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-foreground-muted">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between py-2">
                  <button
                    onClick={toggleShuffle}
                    className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-full transition-all",
                      shuffle ? "text-primary" : "text-foreground-muted hover:text-foreground",
                    )}
                  >
                    <Shuffle className="w-6 h-6" />
                  </button>

                  <button
                    onClick={playPrevious}
                    className="w-14 h-14 flex items-center justify-center text-foreground hover:scale-110 transition-transform"
                  >
                    <SkipBack className="w-8 h-8" fill="currentColor" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-18 h-18 rounded-full gradient-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-primary/30"
                    style={{ width: "72px", height: "72px" }}
                  >
                    {isPlaying ? (
                      <Pause className="w-10 h-10 text-white" fill="currentColor" />
                    ) : (
                      <Play className="w-10 h-10 text-white ml-1" fill="currentColor" />
                    )}
                  </button>

                  <button
                    onClick={playNext}
                    className="w-14 h-14 flex items-center justify-center text-foreground hover:scale-110 transition-transform"
                  >
                    <SkipForward className="w-8 h-8" fill="currentColor" />
                  </button>

                  <button
                    onClick={cycleRepeat}
                    className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-full transition-all",
                      repeat !== "off" ? "text-primary" : "text-foreground-muted hover:text-foreground",
                    )}
                  >
                    {repeat === "one" ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className="text-foreground-muted hover:text-foreground transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-card rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "lyrics" && (
            <div className="flex-1 overflow-y-auto py-6">
              {lyrics.length === 0 ? (
                <div className="text-center text-foreground-muted">
                  {lyricsFound ? "Cargando letra..." : "Letra no disponible"}
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  {lyrics.map((line, index) => (
                    <p
                      key={`${line}-${index}`}
                      className={cn(
                        "text-lg transition-all duration-300",
                        index === currentLyricIndex
                          ? "text-primary font-bold text-2xl"
                          : index < currentLyricIndex
                            ? "text-foreground-muted"
                            : "text-foreground-subtle",
                      )}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "queue" && (
            <div className="flex-1 overflow-y-auto py-4">
              <h3 className="text-lg font-bold mb-4">Cola de reproducción ({items.length})</h3>
              <div className="space-y-1">
                {items.map((song, index) => (
                  <div
                    key={`${song.id}-${index}`}
                    onClick={() => playFromQueue(index)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                      index === currentIndex ? "bg-primary/20" : "hover:bg-card",
                    )}
                  >
                    <span className="w-6 text-center text-sm text-foreground-muted">
                      {index === currentIndex && isPlaying ? (
                        <span className="flex justify-center">
                          <span className="w-1 h-3 bg-primary rounded-full animate-pulse mx-px" />
                          <span
                            className="w-1 h-3 bg-primary rounded-full animate-pulse mx-px"
                            style={{ animationDelay: "0.2s" }}
                          />
                        </span>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <img
                      src={song.thumbnail || "/placeholder.svg?height=100&width=100&query=music"}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium truncate", index === currentIndex && "text-primary")}>
                        {song.title}
                      </p>
                      <p className="text-sm text-foreground-muted truncate">{song.artist}</p>
                    </div>
                    <span className="text-sm text-foreground-muted">{formatDuration(song.duration)}</span>
                    {index !== currentIndex && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromQueue(index)
                        }}
                        className="w-8 h-8 flex items-center justify-center text-foreground-muted hover:text-destructive rounded-full hover:bg-card transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="flex border-t border-border">
          {[
            { id: "playing" as Tab, icon: Play, label: "Reproduciendo" },
            { id: "lyrics" as Tab, icon: Mic2, label: "Letra" },
            { id: "queue" as Tab, icon: ListMusic, label: "Cola" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 transition-colors",
                activeTab === id ? "text-primary" : "text-foreground-muted hover:text-foreground",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
