"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

type OrpheusLogoProps = {
  size?: number
  showText?: boolean
  tagline?: string
  href?: string
  className?: string
}

export function OrpheusLogo({
  size = 44,
  showText = true,
  tagline = "Music Unbound",
  href = "/",
  className,
}: OrpheusLogoProps) {
  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 64 64" role="img" aria-label="Orpheus" className="w-full h-full">
          <defs>
            <linearGradient id="orpheusLogoBg" x1="12%" y1="8%" x2="88%" y2="92%">
              <stop offset="0%" stopColor="#1fd2ff" />
              <stop offset="100%" stopColor="#4b6bff" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#orpheusLogoBg)" />
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fontSize="30"
            fontWeight="700"
            fill="#ffffff"
            fontFamily="Inter, 'Segoe UI', Arial, sans-serif"
          >
            O
          </text>
        </svg>
      </div>
      {showText && (
        <div className="leading-tight">
          <div className="text-lg font-bold bg-gradient-to-r from-[#1fd2ff] to-[#4b6bff] bg-clip-text text-transparent">
            ORPHEUS
          </div>
          <div className="text-[11px] uppercase tracking-wide text-primary font-semibold">{tagline}</div>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    )
  }

  return content
}
