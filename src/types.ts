export type Role = 'student' | 'alum'

/**
 * The soft role a pairing takes, from the viewer's side. Nobody picks this:
 * it is worked out from what each person is looking for and can offer.
 *   learn = they can help me    give = I can help them    trade = same stage
 */
export type Mode = 'learn' | 'give' | 'trade'

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
  /** Help topics this person is looking for (ids from TOPICS). */
  asks: string[]
  /** Help topics this person can offer. */
  offers: string[]
  prompts: PromptAnswer[]
  /** "Open to N chats per month" */
  capacity: number
  used: number
  groupIds: string[]
  verified: 'verified' | 'pending'
}

/** Where someone is in their career, worked out from their class year. */
export type Level = 'student' | 'early' | 'mid' | 'senior'

/**
 * What the user said they want to find, asked once at sign-up.
 * These never hide anyone. They only decide who is shown first.
 */
export interface Prefs {
  industries: string[]
  cities: string[]
  levels: Level[]
}

/**
 * A request for a chat. It replaces the two-sided match: one person asks, about
 * a topic and with a line of their own, and the other accepts or declines.
 */
export interface Request {
  id: string
  fromId: string
  toId: string
  /** The help topic it is about, if one was chosen. */
  topic?: string
  note: string
  /** Set when the note is a reply to one of the other person's prompts. */
  promptId?: string
  at: number
  status: 'pending' | 'accepted' | 'declined'
  respondedAt?: number
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
  /** Set for class events such as reunions: the graduation years it is for. */
  cohortYears?: [number, number]
}

export interface Group {
  id: string
  schoolId: string
  name: string
  description: string
  color: string
}

/** "known" marks a relationship that existed before the app and was added by hand. */
export type InteractionType = 'matched' | 'messaged' | 'coffee' | 'event' | 'known' | 'thanks'

/** How recently someone last talked to a person they already know. */
export type LastTalked = 'recent' | 'months' | 'year' | 'unsure'

export interface Interaction {
  type: InteractionType
  at: number
  note?: string
  /** How a coffee chat went, from the private check-in. Feeds closeness. */
  quality?: 'up' | 'down'
}

export interface Connection {
  otherId: string
  interactions: Interaction[]
  note: string
  /** How often the user wants to keep in touch, in days. Unset means no set rhythm. */
  rhythmDays?: number
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
  /** A thank-you note sent after a coffee chat. `text` holds the note. */
  thanks?: boolean
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
