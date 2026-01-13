"use client"

import { useState, useEffect } from "react"
import { useSettings } from "@/contexts/settings-context"
import { cn } from "@/lib/utils"

interface AdSlotProps {
  type: "banner" | "sidebar" | "video" | "square" | "horizontal"
  className?: string
}

const HOUSE_ADS = [
  {
    id: "administrard",
    title: "AdministraRD",
    subtitle: "El sistema todo en uno para operar y crecer",
    cta: "Solicitar Demo",
    url: "https://administrard.gvslabs.cloud/",
    logo: "/administrard.png",
    bg: "bg-gradient-to-r from-slate-50 to-gray-100",
    text: "text-slate-800",
    ctaBg: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    id: "gvslabs",
    title: "GVSLabs",
    subtitle: "Soluciones tecnológicas para tu negocio",
    cta: "Saber más",
    url: "https://www.gvslabs.cloud/",
    logo: "/gvslabs.png",
    bg: "bg-gradient-to-r from-slate-900 to-slate-800",
    text: "text-white",
    ctaBg: "bg-white hover:bg-gray-100 text-slate-900",
  },
]

export function AdSlot({ type, className }: AdSlotProps) {
  const { role } = useSettings()
  const [adIndex, setAdIndex] = useState(0)

  useEffect(() => {
    setAdIndex(Math.random() > 0.5 ? 1 : 0)
    const timer = setInterval(() => setAdIndex((i) => (i === 0 ? 1 : 0)), 20000)
    return () => clearInterval(timer)
  }, [])

  // Desactivar house ads via variable de entorno, si es premium o si el usuario bloqueó ads
  const showHouseAds = process.env.NEXT_PUBLIC_SHOW_HOUSE_ADS !== "false"
  const { blockAds } = useSettings()

  if (!showHouseAds || role === "premium" || blockAds) return null

  const ad = HOUSE_ADS[adIndex]
  const isVertical = type === "sidebar" || type === "square"

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden transition-shadow hover:shadow-md",
        type === "banner" && "w-full h-24 md:h-28 my-3",
        type === "horizontal" && "w-full h-20 md:h-24",
        type === "sidebar" && "w-full h-full min-h-[200px]",
        type === "square" && "aspect-square w-full max-w-[280px]",
        type === "video" && "w-full h-20",
        className
      )}
    >
      <a
        href={ad.url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "w-full h-full flex items-center",
          isVertical ? "flex-col justify-center text-center gap-2 p-3" : "flex-row gap-4 p-4",
          ad.bg,
          ad.text
        )}
      >
        {/* Logo */}
        <img
          src={ad.logo}
          alt={ad.title}
          className={cn(
            "object-contain flex-shrink-0",
            isVertical ? "h-8 md:h-10" : "h-10 md:h-14 w-auto"
          )}
        />

        {/* Texto */}
        <div className={cn(
          "flex flex-col gap-0 min-w-0",
          isVertical ? "items-center" : "items-start flex-1"
        )}>
          <h3 className={cn(
            "font-bold leading-tight truncate w-full",
            isVertical ? "text-sm" : "text-lg md:text-xl"
          )}>
            {ad.title}
          </h3>
          <p className={cn(
            "opacity-70 line-clamp-2 w-full",
            isVertical ? "text-[10px] leading-tight" : "text-xs md:text-sm truncate"
          )}>
            {ad.subtitle}
          </p>
        </div>

        {/* CTA */}
        <button
          className={cn(
            "flex-shrink-0 font-semibold rounded-full transition-colors",
            isVertical ? "mt-1 text-[10px] px-3 py-1" : "text-xs px-4 py-2",
            ad.ctaBg
          )}
        >
          {ad.cta}
        </button>
      </a>
    </div>
  )
}
