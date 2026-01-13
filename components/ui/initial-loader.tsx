"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export function InitialLoader() {
  const [isVisible, setIsVisible] = useState(true)

  // This loader will be controlled by a global state or timeout
  // For now, let's make it fade out after a few seconds or when explicitly triggered
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 4000) // Failsafe: desaparecer después de 4 segundos máximo
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-4xl font-bold text-primary">O</span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Orpheus</h1>
          <p className="text-muted-foreground text-sm mt-1">Preparando tu música...</p>
        </div>
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-4">
          <div className="h-full bg-primary animate-progress-indefinite" />
        </div>
      </div>
    </div>
  )
}
