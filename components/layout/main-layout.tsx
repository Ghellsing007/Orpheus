"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { MiniPlayer } from "@/components/player/mini-player"
import { usePlayer } from "@/contexts/player-context"
import { AdSlot } from "@/components/ui/ad-slot"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { currentSong } = usePlayer()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto pb-32 md:pb-24">{children}</div>

          {/* Mini Player */}
          {currentSong && <MiniPlayer />}

          {/* Bottom Navigation - Mobile only */}
          <BottomNav />
        </div>

        {/* Ad Column - Desktop only */}
        <aside className="hidden xl:flex w-72 border-l border-border/50 flex-col p-4 gap-4 bg-card/5">
          <AdSlot type="sidebar" className="h-full max-h-[600px]" />
          <div className="flex-1 flex items-center justify-center border border-dashed border-border/40 rounded-xl">
             <span className="text-[10px] text-foreground-muted rotate-90">Sponsorship Space</span>
          </div>
        </aside>
      </main>
    </div>
  )
}
