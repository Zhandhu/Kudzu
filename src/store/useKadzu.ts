import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Connection, Conversation, Feedback, Group, InteractionType, KEvent, Message, Prefs, Proposal, User } from '../types'
import { ALUM_PERSONA, ALWAYS_MATCH, DEFAULT_PREFS, SEED_GROUPS, STUDENT_PERSONA, seedConnections, seedConversations, seedEvents } from '../data/seed'
import { SCHOOLS } from '../data/schools'
import { CITIES, DAY, uid } from '../lib/util'

interface Data {
  onboarded: boolean
  me: User
  persona: 'student' | 'alum' | 'custom'
  schoolId: string
  /** Demo clock: "now" is the real time plus this many days. */
  timeOffsetDays: number
  prefs: Prefs
  swiped: Record<string, 'like' | 'pass'>
  connections: Connection[]
  conversations: Conversation[]
  events: KEvent[]
  groups: Group[]
  feedback: Feedback[]
  dismissedNudges: string[]
  blocked: string[]
  reports: { userId: string; reason: string }[]
  showWarning: boolean
  paused: boolean
  bringFriend: boolean
  settings: { notifications: boolean; privateMode: boolean }
  // transient UI state (not persisted)
  matchWith: string | null
  checkin: { otherId: string; msgId: string } | null
  toast: { id: string; text: string } | null
  demoOpen: boolean
  typing: Record<string, boolean>
}

interface Actions {
  reset: () => void
  finishOnboarding: (me: User, prefs: Prefs) => void
  skipOnboarding: () => void
  signOut: () => void
  updateMe: (patch: Partial<User>) => void
  setPrefs: (patch: Partial<Prefs>) => void
  set: (patch: Partial<Data>) => void
  switchPersona: () => void
  switchSchool: (id: string) => void
  fastForward: (days: number) => void
  swipe: (id: string, dir: 'like' | 'pass', like?: { promptId: string; comment: string }, force?: boolean) => boolean
  resetPasses: () => void
  ensureConversation: (otherId: string) => void
  addMessage: (otherId: string, msg: Omit<Message, 'id' | 'at'>) => void
  acceptProposal: (otherId: string, msgId: string, slot: number) => void
  markRead: (otherId: string) => void
  setTyping: (otherId: string, on: boolean) => void
  submitFeedback: (fb: Omit<Feedback, 'at'>, msgId: string) => void
  setNote: (otherId: string, note: string) => void
  rsvp: (eventId: string, status: 'going' | 'interested' | undefined) => void
  addEvent: (e: KEvent) => void
  toggleGroup: (groupId: string) => void
  addGroup: (g: Group) => void
  dismissNudge: (id: string) => void
  block: (id: string) => void
  report: (id: string, reason: string) => void
  say: (text: string) => void
}

export type KadzuState = Data & Actions

const fresh = (): Data => {
  const now = Date.now()
  return {
    onboarded: false,
    me: STUDENT_PERSONA,
    persona: 'student',
    schoolId: 'gt',
    timeOffsetDays: 0,
    prefs: DEFAULT_PREFS,
    swiped: {},
    connections: seedConnections(now),
    conversations: seedConversations(now),
    events: seedEvents(now),
    groups: SEED_GROUPS,
    feedback: [],
    dismissedNudges: [],
    blocked: [],
    reports: [],
    showWarning: false,
    paused: false,
    bringFriend: false,
    settings: { notifications: true, privateMode: false },
    matchWith: null,
    checkin: null,
    toast: null,
    demoOpen: false,
    typing: {},
  }
}

export const nowOf = (s: { timeOffsetDays: number }) => Date.now() + s.timeOffsetDays * DAY

function touch(connections: Connection[], otherId: string, type: InteractionType, at: number, note?: string): Connection[] {
  const existing = connections.find((c) => c.otherId === otherId)
  if (!existing) return [...connections, { otherId, note: '', interactions: [{ type: 'matched', at }] }]
  return connections.map((c) => {
    if (c.otherId !== otherId) return c
    const last = c.interactions[c.interactions.length - 1]
    // collapse a burst of messages into one timeline entry
    if (type === 'messaged' && last?.type === 'messaged' && at - last.at < DAY) {
      return { ...c, interactions: [...c.interactions.slice(0, -1), { ...last, at }] }
    }
    return { ...c, interactions: [...c.interactions, { type, at, note }] }
  })
}

const mapConv = (list: Conversation[], otherId: string, fn: (c: Conversation) => Conversation) =>
  list.map((c) => (c.otherId === otherId ? fn(c) : c))

export const useKadzu = create<KadzuState>()(
  persist(
    (set, get) => ({
      ...fresh(),

      reset: () => set({ ...fresh() }),
      finishOnboarding: (me, prefs) => set({ me, prefs, schoolId: me.schoolIds[0], persona: 'custom', onboarded: true }),
      skipOnboarding: () => set({ onboarded: true }),
      signOut: () => set({ onboarded: false }),
      updateMe: (patch) =>
        set((s) => ({ me: { ...s.me, ...patch, ...(patch.city && CITIES[patch.city] ? { coords: CITIES[patch.city] } : {}) } })),
      setPrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),
      set: (patch) => set(patch),

      switchPersona: () =>
        set((s) => {
          const next = s.persona === 'alum' ? STUDENT_PERSONA : ALUM_PERSONA
          const school = SCHOOLS.find((x) => x.id === s.schoolId)!
          const groupIds = s.schoolId === 'gt' ? next.groupIds : s.me.groupIds
          return {
            persona: s.persona === 'alum' ? 'student' : 'alum',
            me: { ...next, schoolIds: [school.id], groupIds },
            toast: { id: uid(), text: `Now viewing as ${next.name} (${next.role})` },
          }
        }),

      switchSchool: (id) =>
        set((s) => {
          const school = SCHOOLS.find((x) => x.id === id)!
          const firstGroup = s.groups.find((g) => g.schoolId === id)
          const base = s.persona === 'alum' ? ALUM_PERSONA : s.persona === 'student' ? STUDENT_PERSONA : s.me
          return {
            schoolId: id,
            me: {
              ...s.me,
              schoolIds: [id],
              groupIds: id === 'gt' ? base.groupIds : firstGroup ? [firstGroup.id] : [],
              city: s.me.city,
              coords: CITIES[s.me.city] ?? CITIES.Atlanta,
            },
            toast: { id: uid(), text: `Switched to ${school.name}` },
          }
        }),

      fastForward: (days) =>
        set((s) => ({
          timeOffsetDays: s.timeOffsetDays + days,
          // events that would now be in the past roll forward, so the calendar never empties mid-demo
          events: s.events.map((e) => (e.start < nowOf(s) + days * DAY ? { ...e, start: e.start + days * DAY, myRsvp: e.hostId === 'me' ? e.myRsvp : undefined } : e)),
          toast: { id: uid(), text: `Skipped ahead ${days} days` },
        })),

      swipe: (id, dir, like, force) => {
        const s = get()
        if (dir === 'pass') {
          set({ swiped: { ...s.swiped, [id]: 'pass' } })
          return false
        }
        const matched = force || ALWAYS_MATCH.includes(id) || Math.random() < 0.4
        if (!matched) {
          set({ swiped: { ...s.swiped, [id]: 'like' } })
          return false
        }
        const now = nowOf(s)
        const messages: Message[] = like?.comment
          ? [{ id: uid(), from: 'me', at: now, text: like.comment, promptId: like.promptId }]
          : like
            ? [{ id: uid(), from: 'me', at: now, text: 'Liked your answer', promptId: like.promptId }]
            : []
        set({
          swiped: { ...s.swiped, [id]: 'like' },
          connections: [...s.connections.filter((c) => c.otherId !== id), { otherId: id, note: '', interactions: [{ type: 'matched', at: now }] }],
          conversations: [{ id: `c-${id}`, otherId: id, messages, unread: false }, ...s.conversations.filter((c) => c.otherId !== id)],
          matchWith: id,
        })
        return true
      },

      resetPasses: () => set({ swiped: {} }),

      ensureConversation: (otherId) => {
        const s = get()
        if (s.conversations.some((c) => c.otherId === otherId)) return
        set({ conversations: [{ id: `c-${otherId}`, otherId, messages: [], unread: false }, ...s.conversations] })
      },

      addMessage: (otherId, msg) => {
        get().ensureConversation(otherId)
        set((s) => {
          const at = nowOf(s)
          const full: Message = { ...msg, id: uid(), at }
          return {
            conversations: mapConv(s.conversations, otherId, (c) => ({
              ...c,
              messages: [...c.messages, full],
              unread: msg.from !== 'me',
            })),
            connections: msg.system ? s.connections : touch(s.connections, otherId, 'messaged', at),
          }
        })
      },

      acceptProposal: (otherId, msgId, slot) =>
        set((s) => ({
          conversations: mapConv(s.conversations, otherId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === msgId && m.proposal ? { ...m, proposal: { ...m.proposal, acceptedSlot: slot } as Proposal } : m,
            ),
          })),
        })),

      markRead: (otherId) =>
        set((s) =>
          s.conversations.some((c) => c.otherId === otherId && c.unread)
            ? { conversations: mapConv(s.conversations, otherId, (c) => ({ ...c, unread: false })) }
            : {},
        ),

      setTyping: (otherId, on) => set((s) => ({ typing: { ...s.typing, [otherId]: on } })),

      submitFeedback: (fb, msgId) =>
        set((s) => {
          const now = nowOf(s)
          let slot = now
          const conversations = mapConv(s.conversations, fb.otherId, (c) => ({
            ...c,
            messages: c.messages.map((m) => {
              if (m.id !== msgId || !m.proposal) return m
              slot = Math.min(now, m.proposal.acceptedSlot ?? now)
              return { ...m, proposal: { ...m.proposal, checkedIn: true } }
            }),
          }))
          return {
            conversations,
            feedback: [...s.feedback, { ...fb, at: now }],
            connections: fb.met === 'yes' ? touch(s.connections, fb.otherId, 'coffee', slot) : s.connections,
            checkin: null,
            toast: { id: uid(), text: 'Thanks. Your feedback stays private.' },
          }
        }),

      setNote: (otherId, note) =>
        set((s) => ({ connections: s.connections.map((c) => (c.otherId === otherId ? { ...c, note } : c)) })),

      rsvp: (eventId, status) =>
        set((s) => ({ events: s.events.map((e) => (e.id === eventId ? { ...e, myRsvp: status } : e)) })),

      addEvent: (e) => set((s) => ({ events: [e, ...s.events] })),

      toggleGroup: (groupId) =>
        set((s) => {
          const has = s.me.groupIds.includes(groupId)
          return { me: { ...s.me, groupIds: has ? s.me.groupIds.filter((g) => g !== groupId) : [...s.me.groupIds, groupId] } }
        }),

      addGroup: (g) => set((s) => ({ groups: [g, ...s.groups], me: { ...s.me, groupIds: [...s.me.groupIds, g.id] } })),

      dismissNudge: (id) => set((s) => ({ dismissedNudges: [...s.dismissedNudges, id] })),

      block: (id) => set((s) => ({ blocked: [...s.blocked, id], toast: { id: uid(), text: 'Blocked. They can no longer see or contact you.' } })),

      report: (userId, reason) =>
        set((s) => ({ reports: [...s.reports, { userId, reason }], toast: { id: uid(), text: 'Report sent. Our team will review it.' } })),

      say: (text) => set({ toast: { id: uid(), text } }),
    }),
    {
      // bump this when the saved shape changes, so old browsers start from fresh seed data
      name: 'kadzu-demo-v2',
      partialize: (s) => {
        const { matchWith, checkin, toast, demoOpen, typing, ...rest } = s
        void matchWith, checkin, toast, demoOpen, typing
        return rest as KadzuState
      },
    },
  ),
)

/** Current demo time. Re-renders whenever the demo clock is moved. */
export function useNow(): number {
  const off = useKadzu((s) => s.timeOffsetDays)
  return Date.now() + off * DAY
}
