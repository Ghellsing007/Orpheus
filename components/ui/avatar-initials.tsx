"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

type AvatarInitialsProps = {
  name: string
  size?: number
  className?: string
}

const colors = [
  "#1fd2ff",
  "#4b6bff",
  "#7c3aed",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#6366f1",
]

export function AvatarInitials({ name, size = 36, className }: AvatarInitialsProps) {
  const initials = useMemo(() => {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
    if (parts.length === 0) return "?"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }, [name])

  const bg = useMemo(() => {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const idx = Math.abs(hash) % colors.length
    return colors[idx]
  }, [name])

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full text-white font-semibold select-none",
        className,
      )}
      style={{ width: size, height: size, background: bg }}
    >
      {initials}
    </div>
  )
}
