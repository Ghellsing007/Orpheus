"use client"

import { useEffect, useState } from "react"
import { X, Sparkles, ShieldCheck, Heart, Zap, Globe } from "lucide-react"

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

  const changes = [
    { icon: ShieldCheck, text: "Bloqueador de anuncios más potente y efectivo" },
    { icon: Zap, text: "Tus temas y colores favoritos se cargan al instante" },
    { icon: Heart, text: "Música ininterrumpida, incluso con la app en segundo plano" },
    { icon: Globe, text: "Mejoras de navegación y soporte completo de idiomas (ES/EN)" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal} />
      <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-br from-card to-background border border-primary/20 shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Nueva Versión</span>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full hover:bg-card flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent italic">
            Orpheus v{version}
          </h2>
          <p className="text-sm text-foreground-muted leading-relaxed">
            Hemos reconstruido las bases para ofrecerte una experiencia más rápida, privada y estable.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {changes.map((change, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <change.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium leading-snug">{change.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={closeModal}
          className="w-full py-4 rounded-2xl bg-primary text-white font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
        >
          ¡Vamos allá!
        </button>
      </div>
    </div>
  )
}
