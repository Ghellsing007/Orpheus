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
  tagline = "Música gratis",
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
            <linearGradient id="orpheusLogoText" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1fd2ff" />
              <stop offset="100%" stopColor="#4b6bff" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#orpheusLogoBg)" />
          <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Left arm */}
            <path d="M22 13.5c-2.2 0-4 1.8-4 4a4 4 0 0 0 3 3.9l-2 14.6a7 7 0 0 0 7 7.9H28" />
            {/* Right arm (mirrored) */}
            <path d="M42 13.5c2.2 0 4 1.8 4 4a4 4 0 0 1-3 3.9l2 14.6a7 7 0 0 1-7 7.9H36" />
            {/* Base arc */}
            <path d="M24 44c0 4.4 4.4 8 8 8s8-3.6 8-8" />
            {/* Strings */}
            <path d="M28 16v26" />
            <path d="M32 16v26" />
            <path d="M36 16v26" />
            <path d="M24 16v26" />
            <path d="M40 16v26" />
            {/* Top swirl hint */}
            <path d="M24 16c0-2-2-3.5-4-3.5" />
            <path d="M40 16c0-2 2-3.5 4-3.5" />
          </g>
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
