import { create } from 'zustand'
import type { Message } from '@/types'
import { messages as initialMessages } from '@/data/messages'

type MessageType = Message['type']

interface MessagesState {
  messages: Message[]
  addMessage: (msg: Omit<Message, 'id' | 'time' | 'read'> & { time?: string }) => void
  markAllRead: () => void
  markRead: (id: string) => void
  getUnreadCount: () => number
  getByType: (type?: MessageType) => Message[]
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messages: initialMessages,
  addMessage: (msg) =>
    set((state) => {
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const timeStr =
        msg.time ||
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      const newMsg: Message = {
        id: `msg_${Date.now()}`,
        read: false,
        time: timeStr,
        type: msg.type,
        title: msg.title,
        content: msg.content,
        relatedId: msg.relatedId
      }
      return { messages: [newMsg, ...state.messages] }
    }),
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
