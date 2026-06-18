import { create } from 'zustand'
import type { Office, Scenario, DecedentInfo, HeirInfo, PropertyInfo, MaterialItem, SignatureInfo, AppointmentInfo } from '@/types'

interface DeclareState {
  currentStep: number
  totalSteps: number
  selectedOffice: Office | null
  selectedScenario: Scenario | null
  decedent: DecedentInfo | null
  heirs: HeirInfo[]
  property: PropertyInfo | null
  materials: MaterialItem[]
  signature: SignatureInfo | null
  appointment: AppointmentInfo | null

  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setOffice: (office: Office) => void
  setScenario: (scenario: Scenario) => void
  setDecedent: (info: DecedentInfo) => void
  addHeir: (heir: HeirInfo) => void
  removeHeir: (id: string) => void
  updateHeir: (id: string, heir: Partial<HeirInfo>) => void
  setProperty: (property: PropertyInfo) => void
  setMaterials: (materials: MaterialItem[]) => void
  updateMaterial: (id: string, data: Partial<MaterialItem>) => void
  setSignature: (signature: SignatureInfo) => void
  setAppointment: (appointment: AppointmentInfo) => void
  reset: () => void
}

const initialState = {
  currentStep: 0,
  totalSteps: 7,
  selectedOffice: null,
  selectedScenario: null,
  decedent: null,
  heirs: [],
  property: null,
  materials: [],
  signature: null,
  appointment: null
}

export const useDeclareStore = create<DeclareState>((set) => ({
  ...initialState,

  setStep: (step: number) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  setOffice: (office) => set({ selectedOffice: office }),
  setScenario: (scenario) => set({ selectedScenario: scenario }),
  setDecedent: (info) => set({ decedent: info }),

  addHeir: (heir) => set((state) => ({ heirs: [...state.heirs, heir] })),
  removeHeir: (id) => set((state) => ({ heirs: state.heirs.filter(h => h.id !== id) })),
  updateHeir: (id, data) => set((state) => ({
    heirs: state.heirs.map(h => h.id === id ? { ...h, ...data } : h)
  })),

  setProperty: (property) => set({ property }),
  setMaterials: (materials) => set({ materials }),
  updateMaterial: (id, data) => set((state) => ({
    materials: state.materials.map(m => m.id === id ? { ...m, ...data } : m)
  })),

  setSignature: (signature) => set({ signature }),
  setAppointment: (appointment) => set({ appointment }),

  reset: () => set(initialState)
}))
