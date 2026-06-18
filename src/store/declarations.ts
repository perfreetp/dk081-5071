import { create } from 'zustand'
import type { Declaration } from '@/types'
import { declarations as initialDeclarations } from '@/data/declarations'

type DeclarationStatus = Declaration['status']

interface DeclarationsState {
  declarations: Declaration[]
  addDeclaration: (dec: Declaration) => void
  updateDeclaration: (id: string, patch: Partial<Declaration> & { status?: DeclarationStatus; statusText?: string }) => void
  getById: (id: string) => Declaration | undefined
  getByStatus: (status?: DeclarationStatus) => Declaration[]
}

export const useDeclarationsStore = create<DeclarationsState>((set, get) => ({
  declarations: initialDeclarations,
  addDeclaration: (dec) =>
    set((state) => ({ declarations: [dec, ...state.declarations] })),
  updateDeclaration: (id, patch) =>
    set((state) => ({
      declarations: state.declarations.map((d) => {
        if (d.id !== id) return d
        const merged: Declaration = { ...d, ...patch }
        if (patch.status && !patch.statusText) {
          const statusTextMap: Record<string, string> = {
            draft: '草稿',
            submitted: '已提交',
            reviewing: '审核中',
            correction: '待补正',
            approved: '审核通过',
            paid: '待取证',
            completed: '已完成',
            rejected: '已驳回'
          }
          merged.statusText = statusTextMap[patch.status] || merged.statusText
        }
        merged.updateTime = patch.updateTime || new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        return merged
      })
    })),
  getById: (id) => get().declarations.find((d) => d.id === id),
  getByStatus: (status) => {
    const list = get().declarations
    if (!status) return list
    return list.filter((d) => d.status === status)
  }
}))
