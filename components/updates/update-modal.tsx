"use client"

import { useEffect, useState } from "react"
import { X, Sparkles, Download, ShieldCheck } from "lucide-react"

export function UpdateModal() {
  const [version, setVersion] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch("/version.json", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("version not found")
        return res.json()
      })
      .then((data) => {
        if (!data?.version) return
        const seenKey = `orpheus_update_seen_${data.version}`
        const seen = typeof window !== "undefined" ? localStorage.getItem(seenKey) : null
        if (!seen) {
          setVersion(data.version)
          setOpen(true)
        }
      })
      .catch(() => {})
  }, [])

  const closeModal = () => {
    if (version) {
      localStorage.setItem(`orpheus_update_seen_${version}`, "true")
    }
    setOpen(false)
  }

  if (!open || !version) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-card to-background border border-border shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold">Actualización disponible</span>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full hover:bg-card flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-2">Orpheus v{version}</h2>
        <p className="text-sm text-foreground-muted mb-4">
          Descargas más claras y mensajes de error cuando un video tiene restricciones. Gracias por preferirnos.
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Descargas con avisos si el video no está disponible
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Manejo mejorado de errores en descargas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
            <span>Optimizaciones para PWA</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 active:scale-95 transition-transform"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}
