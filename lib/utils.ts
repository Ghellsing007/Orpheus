import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export async function shareContent(params: {
  title: string
  text?: string
  url: string
  onSuccess?: () => void
  onError?: (err: any) => void
}) {
  const { title, text, url, onSuccess, onError } = params
  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url: fullUrl })
      onSuccess?.()
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        onError?.(err)
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(fullUrl)
      onSuccess?.()
    } catch (err) {
      onError?.(err)
    }
  }
}
