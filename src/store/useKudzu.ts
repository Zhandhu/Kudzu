import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Connection, Conversation, Degree, Feedback, Group, InteractionType, KEvent, LastTalked, Message, Prefs, Proposal, Request, User } from '../types'
import { ALUM_PERSONA, DEFAULT_PREFS, SEED_GROUPS, STUDENT_PERSONA, seedConnections, seedConversations, seedEvents, seedRequests } from '../data/seed'
import { SCHOOLS } from '../data/schools'
import { CITIES, DAY, uid } from '../lib/util'

interface Data {
  onboarded: boolean
  me: User
  persona: 'student' | 'alum' | 'custom'
  /** The school network being looked at now. Every tab is scoped to it. */
  schoolId: string
  /** The school the user ties themselves to most. The app opens on it. */
  homeSchoolId: string
  /** Phone numbers of people the user asked to join. Mocked: nothing is sent. */
  invites: string[]
  /** Demo clock: "now" is the real time plus this many days. */
  timeOffsetDays: number
  prefs: Prefs
  /** Requests for a chat, both the ones the user sent and the ones sent to them. */
  requests: Request[]
  /** How many requests the user let lapse that they have already been told about. */
  quietCleared: number
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
  /** Whether Find shows results as leaves on branches or as plain rows. */
  findView: 'leaves' | 'rows'
  settings: { notifications: boolean; privateMode: boolean }
  // transient UI state (not persisted)
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
  /** Look at another of the user's own school networks. */
  viewSchool: (id: string) => void
  setHomeSchool: (id: string) => void
  addSchool: (d: Degree) => void
  fastForward: (days: number) => void
  addRequest: (r: Omit<Request, 'id' | 'at' | 'status'>) => void
  resolveRequest: (id: string, status: 'accepted' | 'declined') => void
  dismissRequest: (id: string) => void
  ensureConversation: (otherId: string) => void
  addMessage: (otherId: string, msg: Omit<Message, 'id' | 'at'>) => void
  acceptProposal: (otherId: string, msgId: string, slot: number) => void
  markRead: (otherId: string) => void
  setTyping: (otherId: string, on: boolean) => void
  submitFeedback: (fb: Omit<Feedback, 'at'>, msgId: string) => void
  setNote: (otherId: string, note: string) => void
  setRhythm: (otherId: string, rhythmDays: number | undefined) => void
  addKnown: (otherId: string, when: LastTalked, quiet?: boolean) => void
  rsvp: (eventId: string, status: 'going' | 'interested' | undefined) => void
  addEvent: (e: KEvent) => void
  toggleGroup: (groupId: string) => void
  addGroup: (g: Group) => void
  dismissNudge: (id: string) => void
  block: (id: string) => void
  report: (id: string, reason: string) => void
  say: (text: string) => void
}

export type KudzuState = Data & Actions

const fresh = (): Data => {
  const now = Date.now()
  return {
    onboarded: false,
    me: STUDENT_PERSONA,
    persona: 'student',
    schoolId: 'gt',
    homeSchoolId: 'gt',
    invites: [],
    timeOffsetDays: 0,
    prefs: DEFAULT_PREFS,
    requests: seedRequests(now),
    quietCleared: 0,
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
    findView: 'leaves',
    settings: { notifications: true, privateMode: false },
    checkin: null,
    toast: null,
    demoOpen: false,
    typing: {},
  }
}

export const nowOf = (s: { timeOffsetDays: number }) => Date.now() + s.timeOffsetDays * DAY

/** Turns "when did you last talk?" into a date and a timeline note. */
const LAST_TALKED: Record<LastTalked, { days: number; note: string }> = {
  recent: { days: 10, note: 'Last talked within the past month' },
  months: { days: 120, note: 'Last talked a few months ago' },
  year: { days: 400, note: 'Last talked over a year ago' },
  unsure: { days: 60, note: 'Added from people you know' },
}

function touch(connections: Connection[], otherId: string, type: InteractionType, at: number, note?: string, quality?: 'up' | 'down'): Connection[] {
  const existing = connections.find((c) => c.otherId === otherId)
  if (!existing) return [...connections, { otherId, note: '', interactions: [{ type: 'matched', at }] }]
  return connections.map((c) => {
    if (c.otherId !== otherId) return c
    const last = c.interactions[c.interactions.length - 1]
    // collapse a burst of messages into one timeline entry
    if (type === 'messaged' && last?.type === 'messaged' && at - last.at < DAY) {
      return { ...c, interactions: [...c.interactions.slice(0, -1), { ...last, at }] }
    }
    return { ...c, interactions: [...c.interactions, { type, at, note, quality }] }
  })
}

const mapConv = (list: Conversation[], otherId: string, fn: (c: Conversation) => Conversation) =>
  list.map((c) => (c.otherId === otherId ? fn(c) : c))

export const useKudzu = create<KudzuState>()(
  persist(
    (set, get) => ({
      ...fresh(),

      reset: () => set({ ...fresh() }),
      // the default school comes first in `schoolIds`
      finishOnboarding: (me, prefs) => set({ me, prefs, schoolId: me.schoolIds[0], homeSchoolId: me.schoolIds[0], persona: 'custom', onboarded: true }),
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
            homeSchoolId: id,
            me: {
              ...s.me,
              schoolIds: [id],
              degrees: [{ schoolId: id, level: s.me.degrees?.[0]?.level ?? 'Bachelor’s', major: s.me.major, gradYear: s.me.gradYear }],
              groupIds: id === 'gt' ? base.groupIds : firstGroup ? [firstGroup.id] : [],
              city: s.me.city,
              coords: CITIES[s.me.city] ?? CITIES.Atlanta,
            },
            toast: { id: uid(), text: `Switched to ${school.name}` },
          }
        }),

      viewSchool: (id) =>
        set((s) => {
          if (id === s.schoolId || !s.me.schoolIds.includes(id)) return {}
          // the profile shows the degree from whichever network is open
          const d = s.me.degrees?.find((x) => x.schoolId === id)
          return {
            schoolId: id,
            me: d ? { ...s.me, major: d.major, gradYear: d.gradYear } : s.me,
            toast: { id: uid(), text: `Now in ${SCHOOLS.find((x) => x.id === id)!.name}` },
          }
        }),

      setHomeSchool: (id) =>
        set((s) => ({
          homeSchoolId: id,
          me: { ...s.me, schoolIds: [id, ...s.me.schoolIds.filter((x) => x !== id)] },
          toast: { id: uid(), text: `${SCHOOLS.find((x) => x.id === id)!.shortName} is now your default network` },
        })),

      addSchool: (d) =>
        set((s) => {
          if (s.me.schoolIds.includes(d.schoolId)) return {}
          const mine = s.me.degrees ?? [{ schoolId: s.me.schoolIds[0], level: 'Bachelor’s', major: s.me.major, gradYear: s.me.gradYear }]
          return {
            me: { ...s.me, schoolIds: [...s.me.schoolIds, d.schoolId], degrees: [...mine, d] },
            toast: { id: uid(), text: `Added ${SCHOOLS.find((x) => x.id === d.schoolId)!.name}` },
          }
        }),

      fastForward: (days) =>
        set((s) => ({
          timeOffsetDays: s.timeOffsetDays + days,
          // events that would now be in the past roll forward, so the calendar never empties mid-demo
          events: s.events.map((e) => (e.start < nowOf(s) + days * DAY ? { ...e, start: e.start + days * DAY, myRsvp: e.hostId === 'me' ? e.myRsvp : undefined } : e)),
          toast: { id: uid(), text: `Skipped ahead ${days} days` },
        })),

      addRequest: (r) => set((s) => ({ requests: [{ ...r, id: uid(), at: nowOf(s), status: 'pending' }, ...s.requests] })),

      // Accepting a request is what connects two people. The note that came with it
      // becomes the first message, so the conversation starts with a reason.
      resolveRequest: (id, status) =>
        set((s) => {
          const r = s.requests.find((x) => x.id === id)
          if (!r || r.status !== 'pending') return {}
          const now = nowOf(s)
          const requests = s.requests.map((x) => (x.id === id ? { ...x, status, respondedAt: now } : x))
          if (status !== 'accepted') return { requests }
          const otherId = r.fromId === 'me' ? r.toId : r.fromId
          const first: Message = { id: uid(), from: r.fromId, at: now, text: r.note || 'I’d love to find a time to talk.', promptId: r.promptId }
          const existing = s.conversations.find((c) => c.otherId === otherId)
          return {
            requests,
            connections: s.connections.some((c) => c.otherId === otherId)
              ? s.connections
              : [...s.connections, { otherId, note: '', interactions: [{ type: 'matched', at: now }] }],
            conversations: existing
              ? mapConv(s.conversations, otherId, (c) => ({ ...c, messages: [...c.messages, first], unread: r.fromId !== 'me' }))
              : [{ id: `c-${otherId}`, otherId, messages: [first], unread: r.fromId !== 'me' }, ...s.conversations],
          }
        }),

      dismissRequest: (id) => set((s) => ({ requests: s.requests.filter((x) => x.id !== id) })),

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
            // a thank-you counts for more than an ordinary message
            connections: msg.system ? s.connections : touch(s.connections, otherId, msg.thanks ? 'thanks' : 'messaged', at),
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
            // how the chat went is stored with it, so a good chat counts for more than a poor one
            connections: fb.met === 'yes' ? touch(s.connections, fb.otherId, 'coffee', slot, undefined, fb.rating) : s.connections,
            checkin: null,
            toast: { id: uid(), text: 'Thanks. Your feedback stays private.' },
          }
        }),

      setNote: (otherId, note) =>
        set((s) => ({ connections: s.connections.map((c) => (c.otherId === otherId ? { ...c, note } : c)) })),

      setRhythm: (otherId, rhythmDays) =>
        set((s) => ({ connections: s.connections.map((c) => (c.otherId === otherId ? { ...c, rhythmDays } : c)) })),

      // Adds someone the user already knew. The answer to "when did you last talk?"
      // dates the tie, so it starts with the right strength instead of looking brand new.
      addKnown: (otherId, when, quiet) =>
        set((s) => {
          const { days, note } = LAST_TALKED[when]
          const known = { type: 'known' as const, at: nowOf(s) - days * DAY, note }
          const existing = s.connections.find((c) => c.otherId === otherId)
          if (existing?.interactions.some((i) => i.type === 'known')) return {}
          return {
            // someone you matched with but already knew joins your web straight away
            connections: existing
              ? s.connections.map((c) => (c.otherId === otherId ? { ...c, interactions: [...c.interactions, known] } : c))
              : [...s.connections, { otherId, note: '', interactions: [known] }],
            ...(quiet ? {} : { toast: { id: uid(), text: 'Added to your network' } }),
          }
        }),

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
      name: 'kudzu-demo-v6',
      partialize: (s) => {
        const { checkin, toast, demoOpen, typing, ...rest } = s
        void checkin, toast, demoOpen, typing
        return rest as KudzuState
      },
    },
  ),
)

/** Current demo time. Re-renders whenever the demo clock is moved. */
export function useNow(): number {
  const off = useKudzu((s) => s.timeOffsetDays)
  return Date.now() + off * DAY
}
