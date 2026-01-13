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
} from "lucide-react"
import { useSettings } from "@/contexts/settings-context"
import { cn } from "@/lib/utils"
import type { AccentColor, Language, StreamQuality, Theme } from "@/types"
import { ACCENT_COLORS } from "@/lib/constants"

export function SettingsScreen() {
  const settings = useSettings()
  const [appVersion, setAppVersion] = useState("v1.0.0")
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importData, setImportData] = useState("")
  const [notification, setNotification] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleExport = () => {
    const data = settings.exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `orpheus-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showNotification("Datos exportados correctamente")
  }

  const handleImport = () => {
    const success = settings.importData(importData)
    if (success) {
      setShowImportModal(false)
      setImportData("")
      showNotification("Datos importados correctamente")
    } else {
      showNotification("Error al importar datos")
    }
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImportData(e.target?.result as string)
      }
      reader.readAsText(file)
    }
  }

  const handleClearCache = () => {
    settings.clearAllCache()
    showNotification("Caché limpiado correctamente")
  }

  const handleRegenerateSession = () => {
    settings.regenerateSession()
    showNotification("Sesión regenerada")
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
      <h1 className="text-2xl md:text-3xl font-bold">Ajustes</h1>

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
          <span className="font-medium">Idioma</span>
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
          {settings.theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span className="font-medium">Tema</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["dark", "light"] as Theme[]).map((theme) => (
            <button
              key={theme}
              onClick={() => settings.setTheme(theme)}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                settings.theme === theme ? "bg-primary text-primary-foreground" : "bg-card hover:bg-card-hover",
              )}
            >
              <span className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{theme === "dark" ? "Oscuro" : "Claro"}</span>
              </span>
              {settings.theme === theme && <Check className="w-5 h-5" />}
            </button>
          ))}
        </div>
      </section>

      {/* Accent Color */}
      <section className="space-y-3">
        <div className="flex items-center gap-3 text-foreground-muted">
          <Palette className="w-5 h-5" />
          <span className="font-medium">Color de acento</span>
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

      {/* Stream Quality */}
      <section className="space-y-3">
        <div className="flex items-center gap-3 text-foreground-muted">
          <Volume2 className="w-5 h-5" />
          <span className="font-medium">Calidad de streaming</span>
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
              <div className="font-medium">Saltar sponsors automáticamente</div>
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

      {/* Data Management */}
      <section className="space-y-3">
        <div className="flex items-center gap-3 text-foreground-muted mb-2">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Gestión de datos</span>
        </div>

        <button
          onClick={handleExport}
          className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-card hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <Save className="w-5 h-5 text-foreground-muted" />
            <span>Exportar datos</span>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground-muted" />
        </button>

        <button
          onClick={() => setShowImportModal(true)}
          className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-card hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <Upload className="w-5 h-5 text-foreground-muted" />
            <span>Importar datos</span>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground-muted" />
        </button>

        <button
          onClick={handleClearCache}
          className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-card hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-foreground-muted" />
            <span>Limpiar caché</span>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground-muted" />
        </button>

        <button
          onClick={handleRegenerateSession}
          className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-card hover:bg-card-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-foreground-muted" />
            <span>Regenerar sesión</span>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground-muted" />
        </button>
      </section>

      {/* User ID */}
      <section className="text-center text-sm text-foreground-muted py-4">
        <p>User ID: {settings.userId || "Cargando..."}</p>
        <p className="mt-1">Orpheus {appVersion}</p>
      </section>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full space-y-4 fade-in">
            <h3 className="text-xl font-bold">Importar datos</h3>
            <p className="text-sm text-foreground-muted">Selecciona un archivo JSON o pega los datos directamente.</p>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-card-hover rounded-xl text-center hover:bg-primary/10 transition-colors"
            >
              Seleccionar archivo
            </button>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="O pega los datos JSON aquí..."
              className="w-full h-32 px-4 py-3 bg-background rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportData("")
                }}
                className="flex-1 px-4 py-3 bg-card-hover rounded-xl hover:bg-card transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!importData}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
