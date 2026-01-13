"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import {
  Globe,
  Palette,
  Moon,
  Sun,
  Check,
  Volume2,
  Zap,
  Save,
  Upload,
  Trash2,
  RefreshCw,
  ChevronRight,
  Shield,
  ShieldCheck,
} from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import { cn } from "@/lib/utils"
import type { AccentColor, Language, StreamQuality, Theme } from "@/types"
import { ACCENT_COLORS } from "@/lib/constants"
import { useTranslations } from "@/hooks/use-translations"

export function SettingsScreen() {
  const settings = useSettings()
  const { t } = useTranslations()
  const [appVersion, setAppVersion] = useState("v1.0.0")
  const [notification, setNotification] = useState("")
  const [showAdModal, setShowAdModal] = useState(false)

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: "es", label: "Español", flag: "🇪🇸" },
    { id: "en", label: "English", flag: "🇺🇸" },
  ]

  const accentColors: { id: AccentColor; label: string }[] = [
    { id: "blue", label: "Azul" },
    { id: "green", label: "Verde" },
    { id: "violet", label: "Violeta" },
    { id: "red", label: "Rojo" },
    { id: "orange", label: "Naranja" },
  ]

  const qualities: { id: StreamQuality; label: string; description: string }[] = [
    { id: "low", label: "Baja", description: "~64 kbps - Ahorra datos" },
    { id: "medium", label: "Media", description: "~128 kbps - Equilibrado" },
    { id: "high", label: "Alta", description: "~256 kbps - Mejor calidad" },
  ]

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(""), 3000)
  }

  useEffect(() => {
    fetch("/version.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Version not found")
        return res.json()
      })
      .then((data) => {
        if (data?.version) {
          setAppVersion(data.version)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold">{t("settings")}</h1>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 fade-in">
          {notification}
        </div>
      )}

      {/* Language */}
      <section className="space-y-3">
        <div className="flex items-center gap-3 text-foreground-muted">
          <Globe className="w-5 h-5" />
          <span className="font-medium">{t("language")}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {languages.map(({ id, label, flag }) => (
            <button
              key={id}
              onClick={() => settings.setLanguage(id)}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                settings.language === id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-card-hover",
              )}
            >
              <span className="flex items-center gap-2">
                <span>{flag}</span>
                <span>{label}</span>
              </span>
              {settings.language === id && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section className="space-y-3">
        <div className="flex items-center gap-3 text-foreground-muted">
          <Palette className="w-5 h-5" />
          <span className="font-medium">{t("theme")}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => settings.setTheme("dark")}
            className={cn(
              "flex items-center justify-center gap-3 px-4 py-4 rounded-xl transition-all",
              settings.theme === "dark" ? "bg-primary text-primary-foreground shadow-lg" : "bg-card hover:bg-card-hover",
            )}
          >
            <Moon className="w-5 h-5" />
            <span className="font-medium">{t("dark")}</span>
          </button>
          <button
            onClick={() => settings.setTheme("light")}
            className={cn(
              "flex items-center justify-center gap-3 px-4 py-4 rounded-xl transition-all",
              settings.theme === "light" ? "bg-primary text-primary-foreground shadow-lg" : "bg-card hover:bg-card-hover",
            )}
          >
            <Sun className="w-5 h-5" />
            <span className="font-medium">{t("light")}</span>
          </button>
        </div>
      </section>

      {/* Accent Color */}
      <section className="space-y-3">
        <div className="flex items-center gap-3 text-foreground-muted">
          <div className="w-5 h-5 rounded-full border-2 border-current" />
          <span className="font-medium">{t("accentColor")}</span>
        </div>
        <div className="flex gap-3 flex-wrap">
          {accentColors.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => settings.setAccentColor(id)}
              className={cn(
                "w-12 h-12 rounded-full transition-all relative hover:scale-110",
                settings.accentColor === id && "ring-2 ring-offset-2 ring-offset-background ring-foreground",
              )}
              style={{ backgroundColor: ACCENT_COLORS[id].primary }}
              title={label}
            >
              {settings.accentColor === id && <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />}
            </button>
          ))}
        </div>
      </section>

      {/* Audio Quality */}
      <section className="space-y-3">
        <div className="flex items-center gap-3 text-foreground-muted">
          <Volume2 className="w-5 h-5" />
          <span className="font-medium">{t("quality")}</span>
        </div>
        <div className="space-y-2">
          {qualities.map(({ id, label, description }) => (
            <button
              key={id}
              onClick={() => settings.setStreamQuality(id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                settings.streamQuality === id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-card-hover",
              )}
            >
              <div className="text-left">
                <div className="font-medium">{label}</div>
                <div
                  className={cn(
                    "text-sm",
                    settings.streamQuality === id ? "text-primary-foreground/80" : "text-foreground-muted",
                  )}
                >
                  {description}
                </div>
              </div>
              {settings.streamQuality === id && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </section>

      {/* Auto Skip Sponsor */}
      <section className="space-y-3">
        <button
          onClick={() => settings.updateSettings({ autoSkipSponsor: !settings.autoSkipSponsor })}
          className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-card hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-foreground-muted" />
            <div className="text-left">
              <div className="font-medium">{t("autoSkipSponsor")}</div>
              <div className="text-sm text-foreground-muted">Usa SponsorBlock para saltar segmentos</div>
            </div>
          </div>
          <div
            className={cn(
              "w-12 h-7 rounded-full transition-colors relative",
              settings.autoSkipSponsor ? "bg-primary" : "bg-card-hover",
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white transition-transform",
                settings.autoSkipSponsor ? "translate-x-6" : "translate-x-1",
              )}
            />
          </div>
        </button>
      </section>

      {/* Ad Blocker */}
      <section className="space-y-3">
        <button
          onClick={() => {
            if (!settings.blockAds) {
              setShowAdModal(true)
            } else {
              settings.setBlockAds(false)
            }
          }}
          className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-card hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div className="text-left">
              <div className="font-medium">{t("blockAds")}</div>
              <div className="text-sm text-foreground-muted">{t("blockAdsDesc")}</div>
            </div>
          </div>
          <div
            className={cn(
              "w-12 h-7 rounded-full transition-colors relative",
              settings.blockAds ? "bg-primary" : "bg-card-hover",
            )}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white transition-transform",
                settings.blockAds ? "translate-x-6" : "translate-x-1",
              )}
            />
          </div>
        </button>
      </section>

      {/* User ID */}
      <section className="text-center text-sm text-foreground-muted py-4">
        <p>User ID: {settings.userId || "Cargando..."}</p>
        <p className="mt-1">Orpheus {appVersion}</p>
      </section>

      {/* Ad Block Modal */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-6 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{t("adBlockTitle")}</h3>
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {t("adBlockMessage")}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  settings.setBlockAds(true)
                  setShowAdModal(false)
                }}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all active:scale-95"
              >
                {t("adBlockConfirm")}
              </button>
              <button
                onClick={() => setShowAdModal(false)}
                className="w-full py-3 bg-card-hover text-foreground rounded-xl font-medium hover:bg-card transition-all active:scale-95"
              >
                {t("adBlockCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
