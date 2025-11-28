"use client"

import type React from "react"

import { PlayerProvider } from "./player-context"
import { QueueProvider } from "./queue-context"
import { SettingsProvider } from "./settings-context"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <PlayerProvider>
        <QueueProvider>{children}</QueueProvider>
      </PlayerProvider>
    </SettingsProvider>
  )
}
