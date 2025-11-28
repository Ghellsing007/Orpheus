"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Settings, AccentColor, Theme, StreamQuality, Language } from "@/types"
import {
  getSettings,
  saveSettings,
  getUserId,
  regenerateUserId,
  clearCache,
  exportState,
  importState,
} from "@/lib/storage"
import { DEFAULT_SETTINGS, ACCENT_COLORS } from "@/lib/constants"

interface SettingsContextType extends Settings {
  userId: string
  updateSettings: (settings: Partial<Settings>) => void
  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  setAccentColor: (color: AccentColor) => void
  setStreamQuality: (quality: StreamQuality) => void
  regenerateSession: () => void
  exportData: () => string
  importData: (json: string) => boolean
  clearAllCache: () => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    setSettings(getSettings())
    setUserId(getUserId())
  }, [])

  // Apply accent color to CSS variables
  useEffect(() => {
    const colors = ACCENT_COLORS[settings.accentColor]
    document.documentElement.style.setProperty("--color-primary", colors.primary)
    document.documentElement.style.setProperty("--color-accent", colors.accent)
  }, [settings.accentColor])

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    const updated = saveSettings(newSettings)
    setSettings(updated)
  }, [])

  const setLanguage = useCallback(
    (language: Language) => {
      updateSettings({ language })
    },
    [updateSettings],
  )

  const setTheme = useCallback(
    (theme: Theme) => {
      updateSettings({ theme })
      document.documentElement.classList.toggle("dark", theme === "dark")
      document.documentElement.classList.toggle("light", theme === "light")
    },
    [updateSettings],
  )

  const setAccentColor = useCallback(
    (accentColor: AccentColor) => {
      updateSettings({ accentColor })
    },
    [updateSettings],
  )

  const setStreamQuality = useCallback(
    (streamQuality: StreamQuality) => {
      updateSettings({ streamQuality })
    },
    [updateSettings],
  )

  const regenerateSession = useCallback(() => {
    const newId = regenerateUserId()
    setUserId(newId)
  }, [])

  const exportData = useCallback(() => {
    return exportState()
  }, [])

  const importData = useCallback((json: string) => {
    const success = importState(json)
    if (success) {
      setSettings(getSettings())
      setUserId(getUserId())
    }
    return success
  }, [])

  const clearAllCache = useCallback(() => {
    clearCache()
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        userId,
        updateSettings,
        setLanguage,
        setTheme,
        setAccentColor,
        setStreamQuality,
        regenerateSession,
        exportData,
        importData,
        clearAllCache,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
