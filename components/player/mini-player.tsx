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
import { useMemo, useState, useRef, useLayoutEffect } from "react"
import { createPortal } from "react-dom"
import { NowPlayingSheet } from "./now-playing-sheet"
import { getLikedSongs, toggleLikedSong } from "@/lib/storage"

export function MiniPlayer() {
  const { currentSong, isPlaying, currentTime, duration, togglePlay, shuffle, repeat, toggleShuffle, cycleRepeat } =
    usePlayer()
  const { playNext, playPrevious } = useQueue()
  const [showNowPlaying, setShowNowPlaying] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; origin: "top" | "bottom" } | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const isLiked = useMemo(() => getLikedSongs().includes(currentSong.id), [currentSong.id])

  const handleLike = () => {
    toggleLikedSong(currentSong.id)
    setMenuOpen(false)
  }

  const handleDownload = async () => {
    if (!currentSong) return
    setDownloading(true)
    setDownloadError(null)
    try {
      const id = encodeURIComponent(currentSong.ytid || currentSong.id)
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || window.location.origin).replace(/\/$/, "")
      const target = `${baseUrl}/download/mp3/${id}`
      window.open(target, "_blank", "noopener")
      setShowDownloadModal(false)
    } catch (_) {
      setDownloadError("No se pudo generar la descarga")
    } finally {
      setDownloading(false)
    }
  }

  const artistSlug = currentSong.channelId || currentSong.artist
  const artistHref = artistSlug ? `/artist/${encodeURIComponent(artistSlug)}` : null

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
        <div className="h-1 bg-progress-buffer">
          <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progress}%` }} />
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
              onClick={playPrevious}
              className="hidden md:flex w-10 h-10 items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full gradient-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/25"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-primary-foreground" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
              )}
            </button>

            <button
              onClick={playNext}
              className="hidden md:flex w-10 h-10 items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
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
      <NowPlayingSheet open={showNowPlaying} onClose={() => setShowNowPlaying(false)} />

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
