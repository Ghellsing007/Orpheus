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
  Download,
} from "lucide-react"
import Link from "next/link"
import { usePlayer } from "@/contexts/player-context"
import { useQueue } from "@/contexts/queue-context"
import { formatDuration, cn } from "@/lib/utils"
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
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const bgHintShownRef = useRef(false)

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

  const handleDownload = async () => {
    if (!currentSong) return
    setDownloading(true)
    setDownloadError(null)
    try {
      const id = encodeURIComponent(currentSong.ytid || currentSong.id)
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || window.location.origin).replace(/\/$/, "")
      const target = `${baseUrl}/download/mp3/${id}`

      const res = await fetch(target)
      if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`)
      }
      const blob = await res.blob()
      const disposition = res.headers.get("content-disposition") || ""
      const match = /filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i.exec(disposition || "")
      const filename = decodeURIComponent(match?.[1] || match?.[2] || `${currentSong.artist || "audio"} - ${currentSong.title || "track"}.mp3`)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setShowDownloadModal(false)
    } catch (err) {
      console.error(err)
      setDownloadError("No se pudo generar la descarga")
    } finally {
      setDownloading(false)
    }
  }

  const artistSlug = currentSong.channelId || currentSong.artist
  const artistHref = artistSlug ? `/artist/${encodeURIComponent(artistSlug)}` : null

  // Media Session metadata/control integration
  useLayoutEffect(() => {
    if (!("mediaSession" in navigator) || !currentSong) return
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        artwork: [
          { src: currentSong.thumbnail || "", sizes: "96x96", type: "image/png" },
          { src: currentSong.thumbnailHigh || currentSong.thumbnail || "", sizes: "256x256", type: "image/png" },
          { src: currentSong.thumbnailHigh || currentSong.thumbnail || "", sizes: "512x512", type: "image/png" },
        ].filter((a) => a.src),
      })
      navigator.mediaSession.setActionHandler("play", () => togglePlay())
      navigator.mediaSession.setActionHandler("pause", () => togglePlay())
      navigator.mediaSession.setActionHandler("previoustrack", () => playPrevious())
      navigator.mediaSession.setActionHandler("nexttrack", () => playNext())
      navigator.mediaSession.setActionHandler("stop", () => {
        if (isPlaying) togglePlay()
      })
      navigator.mediaSession.setActionHandler("seekbackward", (details: any) => {
        const delta = typeof details?.seekOffset === "number" ? details.seekOffset : 7
        seek(Math.max(0, currentTime - delta))
      })
      navigator.mediaSession.setActionHandler("seekforward", (details: any) => {
        const delta = typeof details?.seekOffset === "number" ? details.seekOffset : 7
        seek(Math.min(duration, currentTime + delta))
      })
      navigator.mediaSession.setActionHandler("seekto", (details: any) => {
        if (typeof details?.seekTime === "number") {
          seek(details.seekTime)
        }
      })
    } catch (_) {
      /* noop */
    }
  }, [currentSong, togglePlay, playPrevious, playNext, seek])

  // Escucha acciones provenientes de notificaciones (enviadas por el service worker)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data
      if (!data || data.type !== "MEDIA_ACTION") return
      if (data.action === "play" || data.action === "pause" || data.action === "playpause") togglePlay()
      if (data.action === "next" || data.action === "nexttrack") playNext()
      if (data.action === "prev" || data.action === "previoustrack") playPrevious()
      if (data.action === "seekto" && typeof data.seekTime === "number") seek(data.seekTime)
      if (data.action === "stop") {
        if (isPlaying) togglePlay()
      }
      if (data.action === "seekforward" && typeof data.seekOffset === "number") {
        seek(Math.min(duration, currentTime + data.seekOffset))
      }
      if (data.action === "seekbackward" && typeof data.seekOffset === "number") {
        seek(Math.max(0, currentTime - data.seekOffset))
      }
    }
    if (typeof navigator !== "undefined" && navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("message", handler)
    }
    return () => {
      if (typeof navigator !== "undefined" && navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener("message", handler)
      }
    }
  }, [togglePlay, playNext, playPrevious, seek])

  // Mostrar notificación con acciones (si el usuario dio permiso)
  useEffect(() => {
    const showNowPlayingNotification = async () => {
      if (!currentSong) return
      if (typeof Notification === "undefined") return
      if (Notification.permission === "default") {
        await Notification.requestPermission().catch(() => {})
      }
      if (Notification.permission !== "granted") return
      if (!("serviceWorker" in navigator)) return
      const reg = await navigator.serviceWorker.ready
      const actions = [
        { action: "prev", title: "Anterior" },
        { action: isPlaying ? "pause" : "play", title: isPlaying ? "Pausar" : "Reproducir" },
        { action: "next", title: "Siguiente" },
        { action: "stop", title: "Detener" },
      ]
      const artwork = currentSong.thumbnailHigh || currentSong.thumbnail
      const hint = "Si se detiene en segundo plano, pulsa play aquí para reanudar."
      reg.showNotification(currentSong.title, {
        body: bgHintShownRef.current ? currentSong.artist || "Orpheus" : `${currentSong.artist || "Orpheus"} · ${hint}`,
        tag: "orpheus-now-playing",
        renotify: true,
        data: {
          type: "MEDIA_NOTIFICATION",
          songId: currentSong.id,
          seekOffset: 7,
        },
        actions,
        silent: true,
        icon: artwork || "/icon-192.png",
        badge: "/icon-192.png",
        image: artwork || undefined,
      })
      if (!bgHintShownRef.current) {
        bgHintShownRef.current = true
      }
    }
    showNowPlayingNotification().catch(() => {})
  }, [currentSong, isPlaying])

  // Posiciona el menú para que no quede fuera de la pantalla (especialmente en el mini player).
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
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 glass border-t border-border">
        {/* Progress bar */}
        <div className="h-2 px-3 md:px-6 pt-2 pb-3">
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

        <div className="flex items-center gap-3 px-3 py-2 md:px-6 md:py-3">
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
              playPrevious()
            }}
            className="w-10 h-10 items-center justify-center text-foreground-muted hover:text-foreground transition-colors flex"
            onMouseDown={() => navigator.vibrate?.(10)}
          >
            <SkipBack className="w-5 h-5" />
          </button>

            <button
            onClick={() => {
              vibrateLight()
              togglePlay()
            }}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full gradient-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/25"
            onMouseDown={() => navigator.vibrate?.(10)}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary-foreground" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
              )}
            </button>

            <button
            onClick={() => {
              vibrateLight()
              playNext()
            }}
            className="w-10 h-10 items-center justify-center text-foreground-muted hover:text-foreground transition-colors flex"
            onMouseDown={() => navigator.vibrate?.(10)}
          >
            <SkipForward className="w-5 h-5" />
          </button>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((v) => !v)
              }}
              className="w-10 h-10 flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {menuOpen &&
              createPortal(
                <>
                  <div
                    className="fixed inset-0 z-[1400]"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(false)
                    }}
                  />
                  {menuPos && (
                    <div
                      className={cn(
                        "fixed z-[1500] w-56 bg-card border border-border rounded-xl shadow-xl py-2",
                        menuPos.origin === "bottom" ? "origin-bottom" : "origin-top",
                      )}
                      style={{ top: menuPos.top, left: menuPos.left }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card-hover transition-colors"
                      >
                        <Heart className={cn("w-4 h-4", isLiked && "fill-current text-primary")} />
                        {isLiked ? "Quitar de favoritos" : "Agregar a favoritos"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleShuffle()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card-hover transition-colors"
                      >
                        <Shuffle className={cn("w-4 h-4", shuffle && "text-primary")} />
                        {shuffle ? "Quitar aleatorio" : "Aleatorio"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          cycleRepeat()
                        }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card-hover transition-colors"
                  >
                    <Repeat className={cn("w-4 h-4", repeat !== "off" && "text-primary")} />
                    {repeat === "one" ? "Repetir pista" : repeat === "all" ? "Repetir todo" : "Repetir"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNowPlaying(true)
                      setActiveTab("queue")
                      setMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card-hover transition-colors"
                  >
                    <ListMusic className="w-4 h-4" />
                    Ver cola
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDownloadModal(true)
                          setMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card-hover transition-colors"
                        disabled={downloading}
                      >
                        <Download className="w-4 h-4" />
                        {downloading ? "Preparando..." : "Descargar"}
                      </button>
                    </div>
                  )}
                </>,
                document.body,
              )}
          </div>

          {/* Duration - Desktop only */}
          <div className="hidden md:flex items-center gap-2 text-sm text-foreground-muted min-w-[100px] justify-end">
            <span>{formatDuration(currentTime)}</span>
            <span>/</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
      </div>

      {/* Now Playing Sheet */}
      <NowPlayingSheet
        open={showNowPlaying}
        onClose={() => setShowNowPlaying(false)}
        initialTab={showQueueOnly ? "queue" : "playing"}
      />

      {/* Download Modal */}
      {showDownloadModal && currentSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowDownloadModal(false)
                setDownloadError(null)
              }}
              className="absolute right-3 top-3 text-foreground-muted hover:text-foreground"
            >
              ✕
            </button>
            <div className="flex items-center gap-4">
              <img
                src={currentSong.thumbnail || "/placeholder.svg"}
                alt={currentSong.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{currentSong.title}</p>
                {artistHref ? (
                  <Link
                    href={artistHref}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="text-sm text-foreground-muted truncate hover:text-primary transition-colors"
                  >
                    {currentSong.artist}
                  </Link>
                ) : (
                  <p className="text-sm text-foreground-muted truncate">{currentSong.artist}</p>
                )}
                <p className="text-xs text-foreground-muted mt-1">
                  {formatDuration(currentSong.duration)} • Audio MP3
                </p>
              </div>
            </div>
            {downloadError && <p className="text-destructive text-sm mt-3">{downloadError}</p>}
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDownloadModal(false)
                  setDownloadError(null)
                }}
                className="px-4 py-2 rounded-full bg-card-hover text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-4 py-2 rounded-full gradient-primary text-white text-sm font-semibold disabled:opacity-60"
              >
                {downloading ? "Preparando..." : "Descargar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
