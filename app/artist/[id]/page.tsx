"use client"

import { use } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { ArtistDetailScreen } from "@/components/screens/artist-detail-screen"

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <MainLayout>
      <ArtistDetailScreen artistId={id} />
    </MainLayout>
  )
}
