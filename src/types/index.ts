export interface Region {
  code: string
  name: string
  municipality?: boolean
  children?: Region[]
}

export interface Office {
  id: string
  name: string
  region: string
  regionCode: string
  address: string
  phone: string
  workHours: string
}

export interface Scenario {
  id: string
  name: string
  description: string
  materials: string[]
}

export interface MaterialItem {
  id: string
  name: string
  required: boolean
  description: string
  uploaded: boolean
  uploadUrl?: string
}

export interface DecedentInfo {
  name: string
  idCard: string
  deathDate: string
  deathProof: string
  maritalStatus: string
}

export interface HeirInfo {
  id: string
  name: string
  idCard: string
  phone: string
  relationship: string
  share: string
  isMain: boolean
}

export interface PropertyInfo {
  certNumber: string
  address: string
  area: string
  usage: string
  ownership: string
  verified: boolean
  pendingManualVerify?: boolean
}

export interface SignatureInfo {
  signatureUrl: string
  promiseConfirmed: boolean
  confirmDate: string
  heirConfirmations?: Record<string, boolean>
}

export interface AppointmentInfo {
  type: 'onsite' | 'home'
  date: string
  timeSlot: string
  address: string
  contact: string
  contactPhone: string
}

export interface Declaration {
  id: string
  orderNo: string
  officeId: string
  officeName: string
  scenarioId: string
  scenarioName: string
  status: 'draft' | 'submitted' | 'reviewing' | 'correction' | 'approved' | 'paid' | 'completed' | 'rejected'
  statusText: string
  createTime: string
  updateTime: string
  decedent: DecedentInfo
  heirs: HeirInfo[]
  property: PropertyInfo
  materials: MaterialItem[]
  signature?: SignatureInfo
  appointment?: AppointmentInfo
  correctionOpinion?: string
  tax?: TaxInfo
  pickup?: PickupInfo
}

export interface TaxInfo {
  totalAmount: number
  items: { name: string; amount: number }[]
  paid: boolean
  payDeadline: string
  payUrl?: string
}

export interface PickupInfo {
  type: 'self' | 'mail'
  date?: string
  address?: string
  receiver?: string
  receiverPhone?: string
  trackingNo?: string
}

export interface Message {
  id: string
  type: 'acceptance' | 'completion' | 'payment' | 'correction' | 'notice'
  title: string
  content: string
  time: string
  read: boolean
  relatedId?: string
}

export interface StepItem {
  title: string
  status: 'done' | 'active' | 'pending'
}
