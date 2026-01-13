"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Song } from "@/types"
import { checkVideoAvailability } from "@/lib/youtube"

interface AvailabilityState {
    [videoId: string]: boolean | undefined // undefined means checking, boolean means result
}

export function useVideoAvailability(
    songs: Song[],
    mode: "eager" | "progressive" = "progressive",
    maxChecks: number = 10
) {
    const [availability, setAvailability] = useState<AvailabilityState>({})
    const [isInitialLoading, setIsInitialLoading] = useState(mode === "eager")
    const checkedRef = useRef<Set<string>>(new Set())
    const queueRef = useRef<string[]>([])
    const isProcessingRef = useRef(false)

    const processQueue = useCallback(async () => {
        if (isProcessingRef.current || queueRef.current.length === 0) {
            if (mode === "eager") setIsInitialLoading(false)
            return
        }

        isProcessingRef.current = true

        while (queueRef.current.length > 0) {
            const videoId = queueRef.current.shift()
            if (!videoId) continue

            const available = await checkVideoAvailability(videoId)
            setAvailability(prev => ({ ...prev, [videoId]: available }))
        }

        isProcessingRef.current = false
        setIsInitialLoading(false)
    }, [mode])

    useEffect(() => {
        // Only queue if we haven't reached the limit of checks for this instance
        const newSongs = songs.filter(s => !checkedRef.current.has(s.id))
        if (newSongs.length === 0) {
            if (mode === "eager" && !isProcessingRef.current) setIsInitialLoading(false)
            return
        }

        let addedCount = 0
        newSongs.forEach(s => {
            if (maxChecks > 0 && checkedRef.current.size >= maxChecks) return

            checkedRef.current.add(s.id)
            if (mode === "eager") {
                queueRef.current.unshift(s.id)
            } else {
                queueRef.current.push(s.id)
            }
            addedCount++
        })

        if (addedCount > 0) {
            processQueue()
        } else if (mode === "eager") {
            setIsInitialLoading(false)
        }
    }, [songs, mode, maxChecks, processQueue])

    const filteredSongs = songs.filter(song => {
        const status = availability[song.id]
        if (mode === "eager") {
            return status === true // In eager mode, only show if explicitly available
        }
        return status !== false // In progressive mode, show unless explictly blocked
    })

    return {
        filteredSongs,
        availability,
        isInitialLoading: isInitialLoading && filteredSongs.length === 0
    }
}
