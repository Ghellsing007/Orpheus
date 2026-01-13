"use client"

import { useEffect } from "react"
import { useSettings } from "@/contexts/settings-context"

const SW_PATH = "/sw.js"

export function ServiceWorkerRegister() {
  const settings = useSettings()

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !settings.isHydrated) {
      return
    }

    let registration: ServiceWorkerRegistration | undefined

    const onControllerChange = () => window.location.reload()

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

    const register = async () => {
      try {
        const swUrl = settings.blockAds ? `${SW_PATH}?blockAds=true` : SW_PATH
        registration = await navigator.serviceWorker.register(swUrl, { scope: "/" })

        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration?.installing
          if (!newWorker) return

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              newWorker.postMessage({ type: "SKIP_WAITING" })
            }
          })
        })
      } catch (error) {
        console.error("Service worker registration failed", error)
      }
    }

    register()

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
    }
  }, [settings.blockAds, settings.isHydrated])

  useEffect(() => {
    const onAppInstalled = () => console.info("Orpheus PWA instalada")
    window.addEventListener("appinstalled", onAppInstalled)

    return () => window.removeEventListener("appinstalled", onAppInstalled)
  }, [])

  return null
}
