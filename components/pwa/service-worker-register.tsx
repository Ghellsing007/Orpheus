"use client"

import { useEffect } from "react"

const SW_PATH = "/sw.js"

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    let registration: ServiceWorkerRegistration | undefined

    const onControllerChange = () => window.location.reload()

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register(SW_PATH, { scope: "/" })

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
  }, [])

  useEffect(() => {
    const onAppInstalled = () => console.info("Orpheus PWA instalada")
    window.addEventListener("appinstalled", onAppInstalled)

    return () => window.removeEventListener("appinstalled", onAppInstalled)
  }, [])

  return null
}
