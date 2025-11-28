"use client"

import { use } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { SongDetailScreen } from "@/components/screens/song-detail-screen"

export default function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <MainLayout>
      <SongDetailScreen songId={id} />
    </MainLayout>
  )
}
