"use client"

import type React from "react"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface CarouselSectionProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function CarouselSection({ title, subtitle, children }: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const ref = scrollRef.current
    ref?.addEventListener("scroll", checkScroll)
    return () => ref?.removeEventListener("scroll", checkScroll)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between px-4 md:px-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-foreground-muted mt-1">{subtitle}</p>}
        </div>

        {/* Navigation buttons - Desktop only */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "w-8 h-8 rounded-full bg-card flex items-center justify-center transition-all",
              canScrollLeft ? "hover:bg-card-hover text-foreground" : "text-foreground-subtle cursor-not-allowed",
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "w-8 h-8 rounded-full bg-card flex items-center justify-center transition-all",
              canScrollRight ? "hover:bg-card-hover text-foreground" : "text-foreground-subtle cursor-not-allowed",
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-0 pb-2">
        {children}
      </div>
    </section>
  )
}
