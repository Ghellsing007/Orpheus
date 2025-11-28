"use client"

import { Play, Pause, SkipBack, SkipForward, ChevronUp } from "lucide-react"
import { usePlayer } from "@/contexts/player-context"
import { useQueue } from "@/contexts/queue-context"
import { formatDuration } from "@/lib/utils"
import { useState } from "react"
import { NowPlayingSheet } from "./now-playing-sheet"

export function MiniPlayer() {
  const { currentSong, isPlaying, currentTime, duration, togglePlay } = usePlayer()
  const { playNext, playPrevious } = useQueue()
  const [showNowPlaying, setShowNowPlaying] = useState(false)

  if (!currentSong) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

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
              <p className="text-foreground-muted text-xs md:text-sm truncate">{currentSong.artist}</p>
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
    </>
  )
}
