"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { api } from "@/services/api"

type CreatePlaylistModalProps = {
  open: boolean
  onClose: () => void
  userId: string
}

export function CreatePlaylistModal({ open, onClose, userId }: CreatePlaylistModalProps) {
  const [title, setTitle] = useState("")
  const [image, setImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("El título es obligatorio")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await api.createCustomPlaylist(userId, title.trim(), image || undefined)
      onClose()
      setTitle("")
      setImage("")
    } catch (err) {
      setError("No se pudo crear la playlist")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold">Crear playlist</p>
            <p className="text-xs text-foreground-muted">Agrega un título y una portada opcional</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-card/80 flex items-center justify-center text-foreground-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="grid gap-3">
            <label className="text-xs text-foreground-muted">
              Título
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Mi nueva playlist"
                className="mt-1 w-full h-11 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
            <label className="text-xs text-foreground-muted">
              Imagen (opcional)
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full h-11 rounded-lg bg-background border border-border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Creando..." : "Crear playlist"}
          </button>
        </form>
      </div>
    </div>
  )
}
