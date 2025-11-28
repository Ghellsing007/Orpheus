"use client"

import { useState } from "react"
import Image from "next/image"

interface ImageWithFallbackProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  priority = false,
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  const fallbackSrc = `/placeholder.svg?height=${height || 300}&width=${width || 300}&query=music album placeholder`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && <div className="absolute inset-0 skeleton" />}
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        className={`object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
      />
    </div>
  )
}
