"use client"

import { use } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { PlaylistDetailScreen } from "@/components/screens/playlist-detail-screen"

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <MainLayout>
      <PlaylistDetailScreen playlistId={id} />
    </MainLayout>
  )
}
