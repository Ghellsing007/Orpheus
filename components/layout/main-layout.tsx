"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { BottomNav } from "./bottom-nav"
import { MiniPlayer } from "@/components/player/mini-player"
import { usePlayer } from "@/contexts/player-context"
import { AdSlot } from "@/components/ui/ad-slot"
import Link from "next/link"
import { Settings, Info } from "lucide-react"
import { useTranslations } from "@/hooks/use-translations"
import { useSettings } from "@/contexts/settings-context"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { currentSong } = usePlayer()
  const { t } = useTranslations()
  const settings = useSettings()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Header Bar - Desktop only (Quick Settings) */}
          <div className="hidden md:flex items-center justify-end px-8 py-4 z-30">
            <Link 
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/40 backdrop-blur-md border border-border hover:bg-card/60 hover:scale-105 active:scale-95 transition-all text-xs font-semibold uppercase tracking-wider text-foreground-muted"
            >
              <Settings className="w-3.5 h-3.5" />
              {t("config")}
            </Link>
          </div>
          {/* Ad Info Banner - Global */}
          {!settings.blockAds && (
            <div className="mx-4 md:mx-8 mb-4 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-center gap-4 text-xs text-foreground-muted shadow-lg shadow-primary/5 fade-in z-20">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <p className="leading-relaxed font-medium">
                  {t("adBannerText")}
                </p>
              </div>
              <Link 
                href="/settings"
                className="shrink-0 px-5 py-2.5 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95"
              >
                {t("adBannerSettings")}
              </Link>
            </div>
          )}

          <div className="flex-1 overflow-y-auto pb-32 md:pb-24">{children}</div>

          {/* Mini Player */}
          {currentSong && <MiniPlayer />}

          {/* Bottom Navigation - Mobile only */}
          <BottomNav />
        </div>

       
      </main>
    </div>
  )
}
