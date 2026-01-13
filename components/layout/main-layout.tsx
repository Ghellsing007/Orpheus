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
        {/* Desktop Quick Settings Button */}
        <div className="absolute top-6 right-8 z-30 hidden md:block">
          <Link 
            href="/settings"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/40 backdrop-blur-md border border-border hover:bg-card/60 hover:scale-105 active:scale-95 transition-all text-sm font-medium"
          >
            <Settings className="w-4 h-4" />
            {t("config")}
          </Link>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Ad Info Banner - Global */}
          {!settings.blockAds && (
            <div className="mx-4 md:mx-8 mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center gap-3 text-xs text-foreground-muted fade-in z-20">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <p className="leading-relaxed">
                  {t("adBannerText")}
                </p>
              </div>
              <Link 
                href="/settings"
                className="shrink-0 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
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
