"use client"

import { useEffect, useState } from "react"
import { X, Smartphone, Info } from "lucide-react"

type BeforeInstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "orpheus_pwa_prompt_dismissed_until"
const DISMISS_DAYS = 7

function isIos() {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
}

export function InstallPrompt() {
  const [ready, setReady] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallEvent | null>(null)
  const [showIosModal, setShowIosModal] = useState(false)
  const [isInstalled, setIsInstalled] = useState(isStandalone())
  const [dismissedUntil, setDismissedUntil] = useState(0)

  useEffect(() => {
    setReady(true)
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(DISMISS_KEY)
      setDismissedUntil(raw ? Number(raw) : 0)
    }
  }, [])

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      if (Date.now() < dismissedUntil) return
      setDeferred(e as BeforeInstallEvent)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setDeferred(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    window.addEventListener("appinstalled", handleInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [dismissedUntil])

  const handleDismiss = () => {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_KEY, String(until))
    setDismissedUntil(until)
    setDeferred(null)
    setShowIosModal(false)
  }

  const handleInstall = async () => {
    if (!deferred) return
    try {
      await deferred.prompt()
      const choice = await deferred.userChoice
      if (choice.outcome === "accepted") {
        setDeferred(null)
      }
    } catch {
      // ignore
    }
  }

  if (isInstalled) return null
  if (!ready) return null

  const shouldShowBanner = deferred != null && !isIos() && Date.now() >= dismissedUntil
  const shouldShowIosHint = !deferred && isIos() && Date.now() >= dismissedUntil

  if (!shouldShowBanner && !shouldShowIosHint && !showIosModal) return null

  return (
    <>
      {(shouldShowBanner || shouldShowIosHint) && (
        <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center px-4 md:left-auto md:right-6 md:bottom-6">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Instala Orpheus</p>
              <p className="text-xs text-foreground-muted truncate">Acceso rapido desde tu pantalla de inicio</p>
            </div>
            <div className="flex items-center gap-2">
              {shouldShowBanner ? (
                <button
                  onClick={handleInstall}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition"
                >
                  Instalar
                </button>
              ) : (
                <button
                  onClick={() => setShowIosModal(true)}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition flex items-center gap-1"
                >
                  <Info className="w-4 h-4" /> Como instalar
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full hover:bg-card/80 flex items-center justify-center text-foreground-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showIosModal && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-sm font-semibold">Instalar en iPhone</p>
                <p className="text-xs text-foreground-muted">Anade Orpheus a tu pantalla de inicio</p>
              </div>
              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full hover:bg-card/80 flex items-center justify-center text-foreground-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <p>1. Toca el boton Compartir en Safari.</p>
              <p>2. Selecciona Anadir a pantalla de inicio.</p>
              <p>3. Confirma y listo: Orpheus se abrira como app.</p>
            </div>
            <div className="px-5 pb-4">
              <button
                onClick={handleDismiss}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
