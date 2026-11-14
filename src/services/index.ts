/**
 * Service layer. Screens read data through these functions rather than importing
 * seed files, so a real API can replace this file later without touching the UI.
 */
import type { Connection, Feedback, KEvent, Nudge, Prefs, Proposal, Strength, User } from '../types'
import { USERS, USERS_BY_ID } from '../data/users'
import { SCHOOLS, PROMPTS } from '../data/schools'
import { SEED_NUDGES } from '../data/seed'
import { useKadzu, nowOf, type KadzuState } from '../store/useKadzu'
import { CITIES, DAY, firstName, hash, miles } from '../lib/util'

/* ---------------- lookups ---------------- */

export const getUser = (id: string): User | undefined => (id === 'me' ? useKadzu.getState().me : USERS_BY_ID[id])
export const getSchool = (id: string) => SCHOOLS.find((s) => s.id === id) ?? SCHOOLS[0]
export const listSchools = () => SCHOOLS
export const schoolForEmail = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) return undefined
  return SCHOOLS.find((s) => s.domains.some((d) => domain === d || domain.endsWith('.' + d)))
}
export const promptText = (id: string) => PROMPTS.find((p) => p.id === id)?.text ?? ''
export const listPrompts = () => PROMPTS
export const schoolUsers = (schoolId: string) => USERS.filter((u) => u.schoolIds.includes(schoolId))
export const inSchool = (userId: string, schoolId: string) => !!getUser(userId)?.schoolIds.includes(schoolId)
export const groupMembers = (groupId: string, me: User): User[] => [
  ...(me.groupIds.includes(groupId) ? [me] : []),
  ...USERS.filter((u) => u.groupIds.includes(groupId)),
]
export const spotsLeft = (u: User) => Math.max(0, u.capacity - u.used)

/* ---------------- matching ---------------- */

export function inCommon(me: User, other: User, groups: { id: string; name: string }[]): string[] {
  const out: string[] = []
  if (me.major === other.major) out.push(`Both ${other.major}`)
  if (me.industry === other.industry) out.push(`${other.industry}`)
  if (me.city === other.city) out.push(`Both in ${other.city}`)
  for (const g of other.groupIds) if (me.groupIds.includes(g)) out.push(groups.find((x) => x.id === g)?.name ?? g)
  return out
}

/** Private reliability/quality score, 0–1. Never shown in the UI; only used for ranking. */
export function trustScore(userId: string, feedback: Feedback[]): number {
  let score = userId === 'g1' ? 0.98 : 0.7 + (hash(userId) % 25) / 100
  for (const f of feedback) {
    if (f.otherId !== userId) continue
    if (f.met === 'noshow') score -= 0.25
    if (f.rating === 'up') score += 0.05
    if (f.rating === 'down') score -= 0.15
    if (f.tags.includes('Felt like a sales pitch') || f.tags.includes('Not a good fit')) score -= 0.05
  }
  return Math.max(0, Math.min(1, score))
}

export function originCoords(me: User, prefs: Prefs): [number, number] {
  return prefs.travelingTo ? CITIES[prefs.travelingTo] ?? me.coords : me.coords
}

export function buildDeck(s: Pick<KadzuState, 'me' | 'prefs' | 'schoolId' | 'swiped' | 'connections' | 'blocked' | 'feedback' | 'groups'>): User[] {
  const { me, prefs } = s
  const connected = new Set(s.connections.map((c) => c.otherId))
  const origin = originCoords(me, prefs)
  return schoolUsers(s.schoolId)
    .filter((u) => !connected.has(u.id) && !s.swiped[u.id] && !s.blocked.includes(u.id))
    .filter((u) => prefs.show === 'both' || u.role === prefs.show)
    .filter((u) => u.gradYear >= prefs.gradRange[0] && u.gradYear <= prefs.gradRange[1])
    .filter((u) => prefs.industries.length === 0 || prefs.industries.includes(u.industry))
    .filter((u) => prefs.intentions.length === 0 || u.intentions.some((i) => prefs.intentions.includes(i)))
    .filter((u) => prefs.maxDistance >= 3000 || miles(origin, u.coords) <= prefs.maxDistance)
    .map((u, i) => ({
      u,
      score: inCommon(me, u, s.groups).length * 1.5 + trustScore(u.id, s.feedback) * 4 + (spotsLeft(u) > 0 ? 1 : 0) - i * 0.02,
    }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.u)
}

export function distanceLabel(me: User, prefs: Prefs, other: User): string {
  const d = miles(originCoords(me, prefs), other.coords)
  if (d < 1) return 'Less than a mile away'
  if (d < 60) return `${Math.round(d)} mi away`
  return `${Math.round(d / 10) * 10} mi away`
}

/* ---------------- connection strength ---------------- */

export function lastInteraction(c: Connection): number {
  return c.interactions.reduce((m, i) => Math.max(m, i.at), 0)
}

/**
 * Strength comes from how recently you interacted, stretched a little
 * if you interact often (4+ touchpoints in the last six months).
 */
export function strengthOf(c: Connection, now: number): { level: Strength; days: number } {
  const days = Math.max(0, Math.floor((now - lastInteraction(c)) / DAY))
  const recent = c.interactions.filter((i) => now - i.at < 180 * DAY).length
  const k = recent >= 4 ? 1.25 : 1
  const level: Strength = days < 30 * k ? 'strong' : days < 90 * k ? 'steady' : days < 180 * k ? 'fading' : 'dormant'
  return { level, days }
}

export function schoolConnections(s: Pick<KadzuState, 'connections' | 'schoolId' | 'blocked'>): Connection[] {
  return s.connections.filter((c) => inSchool(c.otherId, s.schoolId) && !s.blocked.includes(c.otherId))
}

/* ---------------- nudges ---------------- */

export function computeNudges(s: KadzuState, now: number): Nudge[] {
  const conns = schoolConnections(s)
  const ids = new Set(conns.map((c) => c.otherId))
  const out: Nudge[] = SEED_NUDGES.filter((n) => n.schoolId === s.schoolId && ids.has(n.otherId))
  const byAge = conns
    .map((c) => ({ c, st: strengthOf(c, now) }))
    .sort((a, b) => a.st.days - b.st.days)
  for (const { c, st } of byAge) {
    const u = getUser(c.otherId)
    if (!u) continue
    const name = firstName(u.name)
    const months = Math.round(st.days / 30)
    if (st.level === 'fading') {
      out.push({
        id: `fade-${c.otherId}-${months}`,
        otherId: c.otherId,
        text: `It’s been ${months} months since you talked to ${name}. Send a quick hello?`,
        action: 'message',
        draft: `Hi ${name}, it’s been a while! How have things been at ${u.company ?? 'work'}?`,
      })
    } else if (st.level === 'dormant' && months <= 9) {
      out.push({
        id: `dormant-${c.otherId}`,
        otherId: c.otherId,
        text: `You and ${name} haven’t talked in over ${Math.min(months, 8)} months. Worth reconnecting?`,
        action: 'coffee',
      })
    }
  }
  return out.filter((n) => !s.dismissedNudges.includes(n.id))
}

/* ---------------- events ---------------- */

export function schoolEvents(s: Pick<KadzuState, 'events' | 'schoolId' | 'me'>, now: number): KEvent[] {
  return s.events
    .filter((e) => e.schoolId === s.schoolId && e.start > now - DAY)
    .filter((e) => e.visibility === 'public' || !e.groupId || s.me.groupIds.includes(e.groupId) || e.hostId === 'me')
    .sort((a, b) => a.start - b.start)
}

export function isForYou(e: KEvent, me: User, prefs: Prefs): boolean {
  const interests = prefs.industries.length ? prefs.industries : [me.industry]
  return e.city === me.city || (e.groupId ? me.groupIds.includes(e.groupId) : false) || e.industries.some((i) => interests.includes(i))
}

export const eventGuests = (e: KEvent, me: User): User[] => [
  ...(e.myRsvp === 'going' || e.hostId === 'me' ? [me] : []),
  ...e.attendeeIds.map((id) => USERS_BY_ID[id]).filter(Boolean),
]

/* ---------------- chat (mock auto-replies) ---------------- */

const REPLIES = [
  'That sounds great. Tell me more about what you’re looking for?',
  'Happy to help! What’s the main thing on your mind right now?',
  'Good question. I’d rather talk it through live. Want to grab coffee?',
  'Ha, I remember being exactly there. It gets clearer, I promise.',
  'Absolutely. Send over a couple of times that work for you.',
  'Love that. I’ll think on it and send you a few names.',
]

function replyLater(otherId: string, text: string, delay: number, after?: () => void) {
  const st = () => useKadzu.getState()
  setTimeout(() => st().setTyping(otherId, true), 500)
  setTimeout(() => {
    st().setTyping(otherId, false)
    after?.()
    st().addMessage(otherId, { from: otherId, text })
  }, delay)
}

export function sendText(otherId: string, text: string) {
  useKadzu.getState().addMessage(otherId, { from: 'me', text })
  replyLater(otherId, REPLIES[Math.floor(Math.random() * REPLIES.length)], 1700 + Math.random() * 1200)
}

/** Reply to the opening comment after a match so new chats don't sit silent. */
export function greetAfterMatch(otherId: string) {
  const conv = useKadzu.getState().conversations.find((c) => c.otherId === otherId)
  if (!conv || conv.messages.length === 0 || conv.messages.some((m) => m.from !== 'me')) return
  replyLater(otherId, 'Thanks for reaching out! I’d be glad to talk about that. What made you curious?', 2600)
}

export function sendProposal(otherId: string, proposal: Proposal) {
  const st = () => useKadzu.getState()
  st().addMessage(otherId, { from: 'me', proposal })
  const conv = st().conversations.find((c) => c.otherId === otherId)
  const msgId = conv?.messages[conv.messages.length - 1]?.id
  const slot = proposal.slots[Math.floor(Math.random() * proposal.slots.length)]
  replyLater(otherId, 'That time works for me. See you then!', 2600, () => msgId && st().acceptProposal(otherId, msgId, slot))
}

export function acceptTheirProposal(otherId: string, msgId: string, slot: number) {
  useKadzu.getState().acceptProposal(otherId, msgId, slot)
  useKadzu.getState().addMessage(otherId, { from: 'me', text: 'That time works for me!' })
  replyLater(otherId, 'Perfect, it’s on my calendar.', 1800)
}

/** Finds a confirmed chat that has not had its check-in yet (used by the demo panel). */
export function findCheckinTarget(s: KadzuState): { otherId: string; msgId: string } | null {
  for (const c of s.conversations) {
    if (!inSchool(c.otherId, s.schoolId)) continue
    const m = c.messages.find((x) => x.proposal?.acceptedSlot && !x.proposal.checkedIn)
    if (m) return { otherId: c.otherId, msgId: m.id }
  }
  return null
}

/** Chats whose confirmed time has passed and still need a check-in. */
export function dueCheckins(s: KadzuState): { otherId: string; msgId: string }[] {
  const now = nowOf(s)
  const out: { otherId: string; msgId: string }[] = []
  for (const c of s.conversations) {
    if (!inSchool(c.otherId, s.schoolId) || s.blocked.includes(c.otherId)) continue
    for (const m of c.messages) {
      if (m.proposal?.acceptedSlot && !m.proposal.checkedIn && m.proposal.acceptedSlot < now) out.push({ otherId: c.otherId, msgId: m.id })
    }
  }
  return out
}

/** The signed-in user's own standing, from feedback others have (mock) left. */
export function accountStanding(s: KadzuState): 'good' | 'warning' {
  return s.showWarning ? 'warning' : 'good'
}
