export type Role = 'student' | 'alum'

export type Intention =
  | 'Coffee chat'
  | 'Mentorship'
  | 'Career advice'
  | 'Job/referral help'
  | 'Long-term connection'

export interface School {
  id: string
  name: string
  shortName: string
  domains: string[]
  city: string
  accent: string
}

export interface PromptAnswer {
  promptId: string
  answer: string
}

export interface User {
  id: string
  /** Array so a user can later belong to more than one school (undergrad + grad). */
  schoolIds: string[]
  role: Role
  gradYear: number
  name: string
  major: string
  title?: string
  company?: string
  industry: string
  city: string
  coords: [number, number]
  intentions: Intention[]
  prompts: PromptAnswer[]
  /** "Open to N chats per month" */
  capacity: number
  used: number
  groupIds: string[]
  verified: 'verified' | 'pending'
}

export interface Prefs {
  gradRange: [number, number]
  industries: string[]
  maxDistance: number
  travelingTo: string | null
  intentions: Intention[]
  show: 'student' | 'alum' | 'both'
}

export type EventType = 'Networking' | 'Social' | 'Industry'

export interface KEvent {
  id: string
  schoolId: string
  title: string
  hostId: string
  type: EventType
  virtual: boolean
  start: number
  place: string
  city: string
  coords?: [number, number]
  capacity: number
  description: string
  visibility: 'public' | 'community'
  groupId?: string
  industries: string[]
  attendeeIds: string[]
  myRsvp?: 'going' | 'interested'
}

export interface Group {
  id: string
  schoolId: string
  name: string
  description: string
  color: string
}

export type InteractionType = 'matched' | 'messaged' | 'coffee' | 'event'

export interface Interaction {
  type: InteractionType
  at: number
  note?: string
}

export interface Connection {
  otherId: string
  interactions: Interaction[]
  note: string
}

export interface Proposal {
  slots: number[]
  place: string
  mode: 'in-person' | 'virtual'
  acceptedSlot?: number
  checkedIn?: boolean
}

export interface Message {
  id: string
  from: string
  at: number
  text?: string
  /** Set when the message is a Hinge-style comment on a prompt. */
  promptId?: string
  proposal?: Proposal
  system?: boolean
}

export interface Conversation {
  id: string
  otherId: string
  messages: Message[]
  unread: boolean
}

export interface Feedback {
  otherId: string
  met: 'yes' | 'noshow' | 'rescheduled'
  rating?: 'up' | 'down'
  tags: string[]
  note: string
  at: number
}

export type Strength = 'strong' | 'steady' | 'fading' | 'dormant'

export interface Nudge {
  id: string
  otherId: string
  text: string
  action: 'message' | 'coffee'
  draft?: string
}
