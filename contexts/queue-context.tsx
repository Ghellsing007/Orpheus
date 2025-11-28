"use client"

import type React from "react"
import { createContext, useContext, useReducer, useCallback, useEffect } from "react"
import type { Song, QueueState } from "@/types"
import { getQueue, saveQueue } from "@/lib/storage"
import { usePlayer } from "./player-context"

interface QueueContextType extends QueueState {
  addToQueue: (song: Song) => void
  addMultipleToQueue: (songs: Song[]) => void
  removeFromQueue: (index: number) => void
  clearQueue: () => void
  playFromQueue: (index: number) => void
  reorderQueue: (fromIndex: number, toIndex: number) => void
  playNext: () => void
  playPrevious: () => void
  setQueue: (songs: Song[], startIndex?: number) => void
  totalDuration: number
}

type QueueAction =
  | { type: "SET_QUEUE"; items: Song[]; currentIndex?: number }
  | { type: "ADD_TO_QUEUE"; song: Song }
  | { type: "ADD_MULTIPLE"; songs: Song[] }
  | { type: "REMOVE_FROM_QUEUE"; index: number }
  | { type: "CLEAR_QUEUE" }
  | { type: "SET_INDEX"; index: number }
  | { type: "REORDER"; fromIndex: number; toIndex: number }
  | { type: "ADD_TO_HISTORY"; song: Song }

const initialState: QueueState = {
  items: [],
  currentIndex: 0,
  history: [],
}

function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "SET_QUEUE":
      return { ...state, items: action.items, currentIndex: action.currentIndex ?? 0 }
    case "ADD_TO_QUEUE":
      return { ...state, items: [...state.items, action.song] }
    case "ADD_MULTIPLE":
      return { ...state, items: [...state.items, ...action.songs] }
    case "REMOVE_FROM_QUEUE": {
      const newItems = [...state.items]
      newItems.splice(action.index, 1)
      const newIndex = action.index < state.currentIndex ? state.currentIndex - 1 : state.currentIndex
      return { ...state, items: newItems, currentIndex: Math.max(0, newIndex) }
    }
    case "CLEAR_QUEUE":
      return { ...state, items: [], currentIndex: 0, history: [] }
    case "SET_INDEX":
      return { ...state, currentIndex: action.index }
    case "REORDER": {
      const newItems = [...state.items]
      const [removed] = newItems.splice(action.fromIndex, 1)
      newItems.splice(action.toIndex, 0, removed)

      let newIndex = state.currentIndex
      if (action.fromIndex === state.currentIndex) {
        newIndex = action.toIndex
      } else if (action.fromIndex < state.currentIndex && action.toIndex >= state.currentIndex) {
        newIndex--
      } else if (action.fromIndex > state.currentIndex && action.toIndex <= state.currentIndex) {
        newIndex++
      }

      return { ...state, items: newItems, currentIndex: newIndex }
    }
    case "ADD_TO_HISTORY":
      return { ...state, history: [action.song, ...state.history].slice(0, 50) }
    default:
      return state
  }
}

const QueueContext = createContext<QueueContextType | null>(null)

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialState)
  const player = usePlayer()

  // Load queue from storage on mount
  useEffect(() => {
    const savedQueue = getQueue()
    if (savedQueue.items.length > 0) {
      dispatch({ type: "SET_QUEUE", items: savedQueue.items, currentIndex: savedQueue.currentIndex })
    }
  }, [])

  // Save queue to storage on change
  useEffect(() => {
    saveQueue(state)
  }, [state])

  const setQueue = useCallback(
    (songs: Song[], startIndex = 0) => {
      dispatch({ type: "SET_QUEUE", items: songs, currentIndex: startIndex })
      if (songs.length > 0) {
        player.play(songs[startIndex])
      }
    },
    [player],
  )

  const addToQueue = useCallback((song: Song) => {
    dispatch({ type: "ADD_TO_QUEUE", song })
  }, [])

  const addMultipleToQueue = useCallback((songs: Song[]) => {
    dispatch({ type: "ADD_MULTIPLE", songs })
  }, [])

  const removeFromQueue = useCallback((index: number) => {
    dispatch({ type: "REMOVE_FROM_QUEUE", index })
  }, [])

  const clearQueue = useCallback(() => {
    dispatch({ type: "CLEAR_QUEUE" })
    player.pause()
  }, [player])

  const playFromQueue = useCallback(
    (index: number) => {
      if (index >= 0 && index < state.items.length) {
        dispatch({ type: "SET_INDEX", index })
        player.play(state.items[index])
      }
    },
    [state.items, player],
  )

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: "REORDER", fromIndex, toIndex })
  }, [])

  const getNextIndex = useCallback(
    (shuffle: boolean, repeat: string) => {
      if (shuffle) {
        const availableIndices = state.items.map((_, i) => i).filter((i) => i !== state.currentIndex)
        if (availableIndices.length === 0) return state.currentIndex
        return availableIndices[Math.floor(Math.random() * availableIndices.length)]
      }

      const nextIndex = state.currentIndex + 1
      if (nextIndex >= state.items.length) {
        return repeat === "all" ? 0 : -1
      }
      return nextIndex
    },
    [state.items, state.currentIndex],
  )

  const playNext = useCallback(() => {
    if (player.repeat === "one") {
      player.seek(0)
      player.play()
      return
    }

    const nextIndex = getNextIndex(player.shuffle, player.repeat)
    if (nextIndex === -1) {
      player.pause()
      return
    }

    if (state.items[state.currentIndex]) {
      dispatch({ type: "ADD_TO_HISTORY", song: state.items[state.currentIndex] })
    }

    playFromQueue(nextIndex)
  }, [player, getNextIndex, playFromQueue, state.items, state.currentIndex])

  const playPrevious = useCallback(() => {
    if (player.currentTime > 3) {
      player.seek(0)
      return
    }

    if (state.history.length > 0) {
      const prevSong = state.history[0]
      const prevIndex = state.items.findIndex((s) => s.id === prevSong.id)
      if (prevIndex !== -1) {
        playFromQueue(prevIndex)
      }
      return
    }

    const prevIndex = state.currentIndex - 1
    if (prevIndex >= 0) {
      playFromQueue(prevIndex)
    }
  }, [player, state.history, state.items, state.currentIndex, playFromQueue])

  const totalDuration = state.items.reduce((acc, song) => acc + song.duration, 0)

  // Avanza al siguiente al terminar la pista
  useEffect(() => {
    return player.registerOnEnded(() => playNext())
  }, [player.registerOnEnded, playNext])

  return (
    <QueueContext.Provider
      value={{
        ...state,
        addToQueue,
        addMultipleToQueue,
        removeFromQueue,
        clearQueue,
        playFromQueue,
        reorderQueue,
        playNext,
        playPrevious,
        setQueue,
        totalDuration,
      }}
    >
      {children}
    </QueueContext.Provider>
  )
}

export function useQueue() {
  const context = useContext(QueueContext)
  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider")
  }
  return context
}
