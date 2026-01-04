import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface HistoryEntry {
  id: string
  timestamp: Date
  action: string
  data: any
  description: string
}

interface UndoRedoStore {
  history: HistoryEntry[]
  currentIndex: number
  maxHistorySize: number
  
  // Actions
  addToHistory: (action: string, data: any, description: string) => void
  undo: () => HistoryEntry | null
  redo: () => HistoryEntry | null
  canUndo: () => boolean
  canRedo: () => boolean
  clearHistory: () => void
  getHistory: () => HistoryEntry[]
}

export const useUndoRedoStore = create<UndoRedoStore>()(
  devtools(
    persist(
      (set, get) => ({
        history: [],
        currentIndex: -1,
        maxHistorySize: 50,

        addToHistory: (action: string, data: any, description: string) => {
          const { history, currentIndex, maxHistorySize } = get()
          
          const newEntry: HistoryEntry = {
            id: Date.now().toString(),
            timestamp: new Date(),
            action,
            data: JSON.parse(JSON.stringify(data)), // Deep clone
            description,
          }

          // Remove any entries after current index
          const newHistory = history.slice(0, currentIndex + 1)
          
          // Add new entry
          newHistory.push(newEntry)
          
          // Limit history size
          if (newHistory.length > maxHistorySize) {
            newHistory.shift()
          }

          set({
            history: newHistory,
            currentIndex: Math.min(currentIndex + 1, maxHistorySize - 1),
          })
        },

        undo: () => {
          const { history, currentIndex } = get()
          
          if (currentIndex > 0) {
            const newIndex = currentIndex - 1
            set({ currentIndex: newIndex })
            return history[newIndex]
          }
          
          return null
        },

        redo: () => {
          const { history, currentIndex } = get()
          
          if (currentIndex < history.length - 1) {
            const newIndex = currentIndex + 1
            set({ currentIndex: newIndex })
            return history[newIndex]
          }
          
          return null
        },

        canUndo: () => {
          const { currentIndex } = get()
          return currentIndex > 0
        },

        canRedo: () => {
          const { history, currentIndex } = get()
          return currentIndex < history.length - 1
        },

        clearHistory: () => {
          set({ history: [], currentIndex: -1 })
        },

        getHistory: () => {
          const { history, currentIndex } = get()
          return history.slice(0, currentIndex + 1)
        },
      }),
      {
        name: 'undo-redo-store',
      }
    )
  )
)