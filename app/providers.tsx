"use client"

import type React from "react"
import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PlayerProvider } from "@/contexts/player-context"
import { QueueProvider } from "@/contexts/queue-context"
import { SettingsProvider } from "@/contexts/settings-context"
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register"


export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 60,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <PlayerProvider>
          <QueueProvider>
            {children}
            <ServiceWorkerRegister />
          </QueueProvider>
        </PlayerProvider>
      </SettingsProvider>
    </QueryClientProvider>
  )
}
