"use client"

import { useEffect, useRef } from "react"
import { usePlayer } from "@/contexts/player-context"

/**
 * SilentAudio (Life Support)
 * Este componente reproduce un audio silencioso en loop cuando YouTube está sonando.
 * Esto le indica al sistema operativo que la aplicación es un reproductor de audio activo,
 * permitiendo que el proceso se mantenga despierto en segundo plano (iOS/Android).
 */
export function SilentAudio() {
  const { isPlaying, currentSong } = usePlayer()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // WAV silencioso de 1 segundo en Base64
  const SILENT_WAV = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && currentSong) {
      audio.play().catch((err) => {
        // Los navegadores bloquean el play automático si no hay interacción previa,
        // pero como este componente se activa tras el play de YouTube del usuario, suele funcionar.
        console.warn("[Orpheus LifeSupport] No se pudo iniciar el audio silencioso:", err)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, currentSong])

  return (
    <audio
      ref={audioRef}
      src={SILENT_WAV}
      loop
      muted={false} // Debe estar "sonando" (aunque sea silencio) para que el SO lo cuente
      style={{ display: "none" }}
      aria-hidden="true"
    />
  )
}
