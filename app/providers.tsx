"use client"

import type React from "react"
import { PlayerProvider } from "@/contexts/player-context"
import { QueueProvider } from "@/contexts/queue-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <PlayerProvider>
        <QueueProvider>
          {children}
          <ServiceWorkerRegister />
        </QueueProvider>
      </PlayerProvider>
    </SettingsProvider>
  )
}
