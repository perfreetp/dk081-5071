import { create } from 'zustand'
import type { Message } from '@/types'
import { messages as initialMessages } from '@/data/messages'

interface MessagesState {
  messages: Message[]
  markAllRead: () => void
  markRead: (id: string) => void
  getUnreadCount: () => number
  getByType: (type?: Message['type']) => Message[]
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: initialMessages,
  markAllRead: () =>
    set((state) => ({
      messages: state.messages.map((m) => ({ ...m, read: true }))
    })),
  markRead: (id) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, read: true } : m
      )
    })),
  getUnreadCount: () => get().messages.filter((m) => !m.read).length,
  getByType: (type) => {
    const list = get().messages
    if (!type) return list
    return list.filter((m) => m.type === type)
  }
}))
