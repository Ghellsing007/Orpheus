"use client"

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronUp,
  MoreVertical,
  Heart,
  Shuffle,
  Repeat,
  ListMusic,
  Share2,
} from "lucide-react"
import Link from "next/link"
import { usePlayer } from "@/contexts/player-context"
import { useQueue } from "@/contexts/queue-context"
import { formatDuration, cn, shareContent } from "@/lib/utils"
import { useMemo, useState, useRef, useLayoutEffect, useEffect } from "react"
import { createPortal } from "react-dom"
import { NowPlayingSheet } from "./now-playing-sheet"
import { getLikedSongs, toggleLikedSong } from "@/lib/storage"

export function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
    seek,
  } = usePlayer()
  const { playNext, playPrevious } = useQueue()
  const [showNowPlaying, setShowNowPlaying] = useState(false)
  const [showQueueOnly, setShowQueueOnly] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; origin: "top" | "bottom" } | null>(null)

  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const isLiked = useMemo(() => getLikedSongs().includes(currentSong.id), [currentSong.id])

  const handleLike = () => {
    toggleLikedSong(currentSong.id)
    setMenuOpen(false)
  }

  const vibrateLight = () => {
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return
    const isCoarse = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches
    if (!isCoarse) return
    navigator.vibrate(15)
  }

  const artistSlug = currentSong.channelId || currentSong.artist
  const artistHref = artistSlug ? `/artist/${encodeURIComponent(artistSlug)}` : null

  // Media Session metadata - Confiamos en el comportamiento estándar del navegador
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !currentSong) return

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        artwork: [
          { src: currentSong.thumbnail || "", sizes: "96x96", type: "image/png" },
          { src: currentSong.thumbnail || "", sizes: "192x192", type: "image/png" },
          { src: currentSong.thumbnail || "", sizes: "512x512", type: "image/png" },
        ],
      })

      navigator.mediaSession.setActionHandler("play", togglePlay)
      navigator.mediaSession.setActionHandler("pause", togglePlay)
      navigator.mediaSession.setActionHandler("previoustrack", playPrevious)
      navigator.mediaSession.setActionHandler("nexttrack", playNext)
    } catch (_) {
      /* noop */
    }
  }, [currentSong, togglePlay, playPrevious, playNext])

  // Escucha acciones provenientes de notificaciones (enviadas por el service worker)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data
      if (!data || data.type !== "MEDIA_ACTION") return
      if (data.action === "play" || data.action === "pause" || data.action === "playpause") togglePlay()
      if (data.action === "next" || data.action === "nexttrack") playNext()
      if (data.action === "prev" || data.action === "previoustrack") playPrevious()
    }
    if (typeof navigator !== "undefined" && navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("message", handler)
    }
    return () => {
      if (typeof navigator !== "undefined" && navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener("message", handler)
      }
    }
  }, [togglePlay, playNext, playPrevious])

  // Posiciona el menú para que no quede fuera de la pantalla
  useLayoutEffect(() => {
    if (!menuOpen) return
    const btn = menuButtonRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const estimatedHeight = 260
    const estimatedWidth = 240
    const spaceBelow = window.innerHeight - rect.bottom
    const openDown = spaceBelow > estimatedHeight + 12
    const top = openDown ? rect.bottom + 8 : Math.max(8, rect.top - estimatedHeight - 8)
    const left = Math.min(Math.max(8, rect.left - estimatedWidth + rect.width), window.innerWidth - estimatedWidth - 8)
    setMenuPos({ top, left, origin: openDown ? "top" : "bottom" })
  }, [menuOpen])

  return (
    <>
      <div className="w-full glass border-t border-border flex-shrink-0">
        <div className="flex flex-col gap-3">
          {/* Progress bar */}
          <div className="px-3 md:px-6 pt-3 pb-5">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onChange={(e) => seek(Number.parseFloat(e.target.value))}
              className="w-full h-1 bg-card rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-runnable-track]:bg-card [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-track]:bg-card [&::-moz-range-track]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full"
              style={{
                accentColor: "var(--primary)",
                background: `linear-gradient(to right, var(--primary) ${progress}%, var(--card) ${progress}%)`,
              }}
            />
          </div>

          <div className="flex items-center gap-3 px-3 pb-2 md:px-6 md:pb-4">
            {/* Song Info */}
            <button
              onClick={() => setShowNowPlaying(true)}
              className="flex items-center gap-3 flex-1 min-w-0 text-left group"
            >
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={currentSong.thumbnail || "/placeholder.svg"}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ChevronUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm md:text-base truncate">{currentSong.title}</p>
                {artistHref ? (
                  <Link
                    href={artistHref}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="text-foreground-muted text-xs md:text-sm truncate hover:text-primary transition-colors"
                  >
                    {currentSong.artist}
                  </Link>
                ) : (
                  <p className="text-foreground-muted text-xs md:text-sm truncate">{currentSong.artist}</p>
                )}
              </div>
            </button>

            {/* Controls */}
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => {
                  vibrateLight()
                  toggleShuffle()
                }}
                className={cn(
                  "hidden sm:flex w-10 h-10 items-center justify-center rounded-full transition-colors",
                  shuffle ? "text-primary" : "text-foreground-muted hover:text-foreground",
                )}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  vibrateLight()
                  playPrevious()
                }}
                className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  vibrateLight()
                  togglePlay()
                }}
                className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  vibrateLight()
                  playNext()
                }}
                className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary transition-colors"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              <button
                ref={menuButtonRef}
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(!menuOpen)
                }}
                className="w-10 h-10 flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Portal */}
      {menuOpen &&
        menuPos &&
        createPortal(
          <div className="fixed inset-0 z-[99999]" onClick={() => setMenuOpen(false)}>
            <div
              className={cn(
                "absolute w-[240px] bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-2 py-3 animate-in fade-in zoom-in duration-200",
                menuPos.origin === "top" ? "origin-top" : "origin-bottom",
              )}
              style={{
                top: menuPos.top,
                left: menuPos.left,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 mb-2 border-b border-border/50">
                <p className="font-semibold text-sm truncate">{currentSong.title}</p>
                <p className="text-xs text-foreground-muted truncate">{currentSong.artist}</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={handleLike}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  <Heart className={cn("w-4 h-4", isLiked ? "fill-primary text-primary" : "text-foreground-muted")} />
                  {isLiked ? "Quitar de favoritos" : "Añadir a favoritos"}
                </button>

                <button
                  onClick={() => {
                    shareContent({
                      title: currentSong.title,
                      text: `Escuchando ${currentSong.title} de ${currentSong.artist} en Orpheus`,
                      url: `/song/${currentSong.id}`
                    })
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  <Share2 className="w-4 h-4 text-foreground-muted" />
                  Compartir canción
                </button>

                <button
                  onClick={() => {
                    vibrateLight()
                    cycleRepeat()
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  <Repeat className={cn("w-4 h-4", repeat !== "off" ? "text-primary" : "text-foreground-muted")} />
                  Modo: {repeat === "off" ? "Apagado" : repeat === "one" ? "Repetir una" : "Repetir todas"}
                </button>

                <button
                  onClick={() => {
                    setShowQueueOnly(true)
                    setShowNowPlaying(true)
                    setMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  <ListMusic className="w-4 h-4 text-foreground-muted" />
                  Ver cola
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showNowPlaying && (
        <NowPlayingSheet
          open={showNowPlaying}
          initialTab={showQueueOnly ? "queue" : "playing"}
          onClose={() => {
            setShowNowPlaying(false)
            setShowQueueOnly(false)
          }}
        />
      )}
    </>
  )
}
