import { create } from 'zustand'
import type { Declaration } from '@/types'
import { declarations as initialDeclarations } from '@/data/declarations'

interface DeclarationsState {
  declarations: Declaration[]
  addDeclaration: (dec: Declaration) => void
  getById: (id: string) => Declaration | undefined
  getByStatus: (status?: Declaration['status']) => Declaration[]
}

export const useDeclarationsStore = create<DeclarationsState>((set, get) => ({
  declarations: initialDeclarations,
  addDeclaration: (dec) =>
    set((state) => ({ declarations: [dec, ...state.declarations] })),
  getById: (id) => get().declarations.find((d) => d.id === id),
  getByStatus: (status) => {
    const list = get().declarations
    if (!status) return list
    return list.filter((d) => d.status === status)
  }
}))
