"use client"

import Link from "next/link"
import type { Artist } from "@/types"
import { formatNumber } from "@/lib/utils"

interface ArtistCardProps {
  artist: Artist
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Link href={`/artist/${artist.id}`} className="group text-center flex-shrink-0 w-32">
      <div className="relative aspect-square rounded-full overflow-hidden mb-3 shadow-lg shadow-black/20 mx-auto">
        <img
          src={artist.image || "/placeholder.svg?height=200&width=200&query=artist portrait"}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{artist.name}</h3>
      <p className="text-xs text-foreground-muted">
        {artist.monthlyListeners ? `${formatNumber(artist.monthlyListeners)} oyentes` : "Artista"}
      </p>
    </Link>
  )
}
