/**
 * Service layer. Screens read data through these functions rather than importing
 * seed files, so a real API can replace this file later without touching the UI.
 */
import type { Connection, Feedback, InteractionType, KEvent, Mode, Nudge, Prefs, Proposal, Strength, User } from '../types'
import { MODE_META, topicLabel } from '../config/brand'
import { USERS, USERS_BY_ID, knows } from '../data/users'
import { SCHOOLS, PROMPTS } from '../data/schools'
import { SEED_NUDGES } from '../data/seed'
import { useKudzu, nowOf, type KudzuState } from '../store/useKudzu'
import { CITIES, DAY, firstName, hash, miles } from '../lib/util'

/* ---------------- lookups ---------------- */

export const getUser = (id: string): User | undefined => (id === 'me' ? useKudzu.getState().me : USERS_BY_ID[id])
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

export interface MatchInfo {
  mode: Mode
  /** Topics that explain the match, most relevant first. */
  topics: string[]
  /** 0–1: how much of the need is met. */
  fit: number
  headline: string
  reason: string
}

const listTopics = (ids: string[]) => {
  // lower-case only the first letter, so "I" inside a label stays capitalised
  const labels = ids.slice(0, 3).map((id) => topicLabel(id)).map((l) => l[0].toLowerCase() + l.slice(1))
  return labels.length <= 1 ? labels.join('') : `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`
}

/**
 * Works out the soft role for a pairing, from `me`'s side, and why.
 * Stage decides the default (someone further along is someone to learn from);
 * what each person asks for and offers can tip it and supplies the reason.
 */
export function matchInfo(me: User, other: User): MatchInfo {
  const theyHelp = me.asks.filter((t) => other.offers.includes(t))
  const iHelp = other.asks.filter((t) => me.offers.includes(t))
  const shared = me.asks.filter((t) => other.asks.includes(t))
  const gap = me.gradYear - other.gradYear // positive: they are further along
  const sameStage = me.role === other.role && Math.abs(gap) <= (me.role === 'student' ? 0 : 2)
  const theyAhead = me.role !== other.role ? other.role === 'alum' : gap > 0
  const name = firstName(other.name)
  const years = Math.abs(gap)
  const span = years <= 1 ? 'a year' : `${years} years`

  let mode: Mode
  let topics: string[]
  let reason: string
  let fit: number
  if (sameStage) {
    mode = 'trade'
    const mutual = [...new Set([...theyHelp, ...iHelp])]
    topics = mutual.length ? mutual : shared
    reason = mutual.length
      ? `You can help each other with ${listTopics(mutual)}`
      : shared.length
        ? `You’re both looking for ${listTopics(shared)}`
        : `You and ${name} are at the same stage`
    fit = Math.min(1, topics.length / Math.max(1, me.asks.length))
  } else if (theyAhead ? theyHelp.length > 0 || iHelp.length === 0 : iHelp.length === 0 && theyHelp.length > 0) {
    mode = 'learn'
    topics = theyHelp
    reason = theyHelp.length ? `${name} can help with ${listTopics(theyHelp)}` : `${name} is ${span} further along than you`
    fit = theyHelp.length / Math.max(1, me.asks.length)
  } else {
    mode = 'give'
    topics = iHelp
    reason = iHelp.length ? `${name} is looking for ${listTopics(iHelp)}` : `You’re ${span} further along than ${name}`
    fit = iHelp.length / Math.max(1, other.asks.length)
  }
  return { mode, topics, fit, reason, headline: `${MODE_META[mode].verb} ${name}` }
}

/* ---------------- using the network you already have ---------------- */

type NetworkState = Pick<KudzuState, 'connections' | 'schoolId' | 'blocked'>

/** People you are connected to who also know `other`. */
export function mutualConnections(s: NetworkState, other: User): User[] {
  return webConnections(s)
    .filter((c) => c.otherId !== other.id && knows(c.otherId, other.id))
    .map((c) => getUser(c.otherId))
    .filter((u): u is User => !!u)
}

/**
 * How much mutual connections should count. Research on weak ties found the most
 * useful new contacts are a moderate distance away: a few people in common, not
 * none and not everyone. So the value rises, peaks at two or three, then falls.
 */
export const mutualValue = (n: number) => (n === 0 ? 0 : n === 1 ? 0.6 : n <= 3 ? 1 : n <= 5 ? 0.6 : 0.3)

/** 0–1: how under-represented this person's industry is among your connections. */
export function noveltyValue(s: NetworkState, other: User): number {
  const mine = webConnections(s).map((c) => getUser(c.otherId)).filter((u): u is User => !!u && u.id !== other.id)
  if (mine.length < 3) return 0
  return 1 - mine.filter((u) => u.industry === other.industry).length / mine.length
}

/** The industry this person would add to your network, if you know nobody in it yet. */
export function networkGap(s: NetworkState, other: User): string | null {
  return noveltyValue(s, other) === 1 ? other.industry : null
}

/** Private reliability/quality score, 0–1. Never shown in the UI; only used for ranking. */
export function trustScore(userId: string, feedback: Feedback[]): number {
  let score = userId === 'g1' ? 0.98 : 0.7 + (hash(userId) % 25) / 100
  for (const f of feedback) {
    if (f.otherId !== userId) continue
    if (f.met === 'noshow') score -= 0.25
    if (f.rating === 'up') score += 0.05
    if (f.rating === 'down') score -= 0.15
    if (f.tags.includes('Felt like a sales pitch') || f.tags.includes('Not a good fit')) score -= 0.05  }
  return Math.max(0, Math.min(1, score))
}

export function originCoords(me: User, prefs: Prefs): [number, number] {
  return prefs.travelingTo ? CITIES[prefs.travelingTo] ?? me.coords : me.coords
}

export function buildDeck(s: Pick<KudzuState, 'me' | 'prefs' | 'schoolId' | 'swiped' | 'connections' | 'blocked' | 'feedback' | 'groups'>): User[] {
  const { me, prefs } = s
  const connected = new Set(s.connections.map((c) => c.otherId))
  const origin = originCoords(me, prefs)
  return schoolUsers(s.schoolId)
    .filter((u) => !connected.has(u.id) && !s.swiped[u.id] && !s.blocked.includes(u.id))
    .filter((u) => prefs.show === 'both' || u.role === prefs.show)
    .filter((u) => u.gradYear >= prefs.gradRange[0] && u.gradYear <= prefs.gradRange[1])
    .filter((u) => prefs.industries.length === 0 || prefs.industries.includes(u.industry))
    .filter((u) => prefs.maxDistance >= 3000 || miles(origin, u.coords) <= prefs.maxDistance)
    .map((u) => ({ u, info: matchInfo(me, u) }))
    .filter(({ info }) => prefs.modes.length === 0 || prefs.modes.includes(info.mode))
    .map(({ u, info }, i) => ({
      u,
      score:
        info.fit * 2.5 + // their offers meet your asks (or the reverse)
        inCommon(me, u, s.groups).length * 1.5 + // common ground
        trustScore(u.id, s.feedback) * 4 + // private reliability
        mutualValue(mutualConnections(s, u).length) * 1.5 + // a few people in common
        noveltyValue(s, u) * 1.0 + // widens your network
        (spotsLeft(u) > 0 ? 1 : 0) -
        i * 0.02,
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
 * How much each kind of interaction counts toward closeness on the day it happens.
 * A coffee chat is the benchmark at 1.0.
 */
const WEIGHT: Record<InteractionType, number> = {
  coffee: 1.0,
  known: 0.8, // a relationship that existed before the app
  event: 0.6,
  thanks: 0.5,
  messaged: 0.35,
  matched: 0.1,
}

/** Every interaction loses half its value in this many days. */
const HALF_LIFE_DAYS = 60

/** Messages add up, but a long text thread never outweighs meeting in person. */
const MESSAGE_CAP = 0.8

export interface ClosenessPart {
  type: InteractionType
  at: number
  quality?: 'up' | 'down'
  /** What this interaction is worth today, after fading. */
  value: number
}

function partValue(i: Connection['interactions'][number], now: number): number {
  const quality = i.type === 'coffee' ? (i.quality === 'up' ? 1.3 : i.quality === 'down' ? 0.5 : 1) : 1
  const ageDays = Math.max(0, (now - i.at) / DAY)
  return WEIGHT[i.type] * quality * Math.pow(0.5, ageDays / HALF_LIFE_DAYS)
}

/**
 * Closeness is a score, not a rule. Each interaction contributes according to
 * what kind it was and how it went, and every contribution fades with time.
 * Many small contacts and one good coffee can both keep a tie strong.
 */
export function closeness(c: Connection, now: number): { score: number; parts: ClosenessPart[] } {
  const parts = c.interactions.map((i) => ({ type: i.type, at: i.at, quality: i.quality, value: partValue(i, now) }))
  const messages = parts.filter((p) => p.type === 'messaged').reduce((sum, p) => sum + p.value, 0)
  const rest = parts.filter((p) => p.type !== 'messaged').reduce((sum, p) => sum + p.value, 0)
  return { score: rest + Math.min(messages, MESSAGE_CAP), parts: parts.sort((a, b) => b.value - a.value) }
}

/** Turns the closeness score into one of the four leaf states. */
export function strengthOf(c: Connection, now: number): { level: Strength; days: number; score: number } {
  const days = Math.max(0, Math.floor((now - lastInteraction(c)) / DAY))
  const { score } = closeness(c, now)
  const level: Strength = score >= 0.7 ? 'strong' : score >= 0.35 ? 'steady' : score >= 0.15 ? 'fading' : 'dormant'
  return { level, days, score }
}

export function schoolConnections(s: Pick<KudzuState, 'connections' | 'schoolId' | 'blocked'>): Connection[] {
  return s.connections.filter((c) => inSchool(c.otherId, s.schoolId) && !s.blocked.includes(c.otherId))
}

/**
 * A match is not yet a relationship. Someone joins your web once there has been
 * a real exchange: a coffee chat, an event together, or knowing them already.
 */
export const isEstablished = (c: Connection) => c.interactions.some((i) => i.type === 'coffee' || i.type === 'event' || i.type === 'known')

/** Your web: connections with a real exchange behind them. */
export function webConnections(s: Pick<KudzuState, 'connections' | 'schoolId' | 'blocked'>): Connection[] {
  return schoolConnections(s).filter(isEstablished)
}

/** People you have matched with but not yet met. */
export function pendingConnections(s: Pick<KudzuState, 'connections' | 'schoolId' | 'blocked'>): Connection[] {
  return schoolConnections(s).filter((c) => !isEstablished(c))
}

export const RHYTHMS: { days: number | undefined; label: string; short: string }[] = [
  { days: 30, label: 'Check in monthly', short: 'Monthly' },
  { days: 120, label: 'Catch up each semester', short: 'Each semester' },
  { days: undefined, label: 'No set rhythm', short: 'No set rhythm' },
]

export const rhythmLabel = (days?: number) => RHYTHMS.find((r) => r.days === days)?.short ?? `Every ${days} days`

/* ---------------- nudges ---------------- */

export function computeNudges(s: KudzuState, now: number): Nudge[] {
  const conns = webConnections(s)
  const ids = new Set(conns.map((c) => c.otherId))
  const out: Nudge[] = []
  const byAge = conns
    .map((c) => ({ c, st: strengthOf(c, now) }))
    .sort((a, b) => a.st.days - b.st.days)

  // Rhythms come first: these are check-ins the user chose, due before the tie fades.
  for (const { c, st } of byAge) {
    const u = getUser(c.otherId)
    if (!u || !c.rhythmDays || st.days < c.rhythmDays) continue
    const periods = Math.floor(st.days / c.rhythmDays)
    out.push({
      id: `rhythm-${c.otherId}-${periods}`,
      otherId: c.otherId,
      text: `Time for your ${c.rhythmDays <= 31 ? 'monthly' : 'semester'} catch-up with ${firstName(u.name)}.`,
      action: 'coffee',
    })
  }

  // then timely reasons to get in touch (in town, new job)
  out.push(...SEED_NUDGES.filter((n) => n.schoolId === s.schoolId && ids.has(n.otherId)))

  for (const { c, st } of byAge) {
    const u = getUser(c.otherId)
    if (!u || (c.rhythmDays && st.days >= c.rhythmDays)) continue
    const name = firstName(u.name)
    const months = Math.round(st.days / 30)
    if (st.level === 'fading') {
      out.push({
        id: `fade-${c.otherId}-${months}`,
        otherId: c.otherId,
        text: `It’s been ${months <= 1 ? 'about a month' : `${months} months`} since you talked to ${name}. Send a quick hello?`,
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

export function schoolEvents(s: Pick<KudzuState, 'events' | 'schoolId' | 'me'>, now: number): KEvent[] {
  return s.events
    .filter((e) => e.schoolId === s.schoolId && e.start > now - DAY)
    .filter((e) => e.visibility === 'public' || !e.groupId || s.me.groupIds.includes(e.groupId) || e.hostId === 'me')
    .sort((a, b) => a.start - b.start)
}

/* ---------------- cohorts and people you already know ---------------- */

/** Your class cohort: your own year for students, two years either side for alumni. */
export function classSpan(me: User): [number, number] {
  return me.role === 'student' ? [me.gradYear, me.gradYear] : [me.gradYear - 2, me.gradYear + 2]
}

export function classLabel(me: User): string {
  const [a, b] = classSpan(me)
  return a === b ? `Class of ${a}` : `Classes of ${a}–${b}`
}

const inSpan = (year: number, [a, b]: [number, number]) => year >= a && year <= b

type CohortState = Pick<KudzuState, 'me' | 'schoolId' | 'blocked'>

/** Everyone at the school who graduated with you (or around when you did). */
export function classCohort(s: CohortState): User[] {
  const span = classSpan(s.me)
  return schoolUsers(s.schoolId).filter((u) => inSpan(u.gradYear, span) && !s.blocked.includes(u.id))
}

/** Everyone at the school living in a city. */
export function cityCohort(s: CohortState, city: string): User[] {
  return schoolUsers(s.schoolId).filter((u) => u.city === city && !s.blocked.includes(u.id))
}

/** How many people in a list live in each city, largest first. */
export function byCity(users: User[]): [string, number][] {
  const m = new Map<string, number>()
  for (const u of users) m.set(u.city, (m.get(u.city) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])
}

export const isClassEvent = (e: KEvent, me: User) => !!e.cohortYears && inSpan(me.gradYear, e.cohortYears)

export interface Suggestion {
  user: User
  reasons: string[]
  score: number
}

/**
 * People you probably already know: your class, your major, and people several of
 * your connections know. Used at sign-up and from the Network tab.
 */
export function suggestKnown(s: Pick<KudzuState, 'me' | 'schoolId' | 'blocked' | 'connections'>): Suggestion[] {
  const span = classSpan(s.me)
  const connected = new Set(s.connections.map((c) => c.otherId))
  return schoolUsers(s.schoolId)
    .filter((u) => !connected.has(u.id) && !s.blocked.includes(u.id))
    .map((user) => {
      const reasons: string[] = []
      let score = 0
      if (inSpan(user.gradYear, span)) { score += 3; reasons.push(user.gradYear === s.me.gradYear ? 'Same class year' : 'Graduated around when you did') }
      if (user.major === s.me.major) { score += 2; reasons.push(`Also studied ${user.major}`) }
      const mutual = mutualConnections(s, user).length
      if (mutual > 0) { score += Math.min(mutual, 3); reasons.push(`${mutual} mutual ${mutual === 1 ? 'connection' : 'connections'}`) }
      if (user.groupIds.some((g) => s.me.groupIds.includes(g))) { score += 1; reasons.push('In one of your groups') }
      if (user.city === s.me.city) score += 0.5
      return { user, reasons, score }
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
}

export function isForYou(e: KEvent, me: User, prefs: Prefs): boolean {
  const interests = prefs.industries.length ? prefs.industries : [me.industry]
  return isClassEvent(e, me) || e.city === me.city ||(e.groupId ? me.groupIds.includes(e.groupId) : false) || e.industries.some((i) => interests.includes(i))
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
  const st = () => useKudzu.getState()
  setTimeout(() => st().setTyping(otherId, true), 500)
  setTimeout(() => {
    st().setTyping(otherId, false)
    after?.()
    st().addMessage(otherId, { from: otherId, text })
  }, delay)
}

export function sendText(otherId: string, text: string) {
  useKudzu.getState().addMessage(otherId, { from: 'me', text })
  replyLater(otherId, REPLIES[Math.floor(Math.random() * REPLIES.length)], 1700 + Math.random() * 1200)
}

/** Reply to the opening comment after a match so new chats don't sit silent. */
export function greetAfterMatch(otherId: string) {
  const conv = useKudzu.getState().conversations.find((c) => c.otherId === otherId)
  if (!conv || conv.messages.length === 0 || conv.messages.some((m) => m.from !== 'me')) return
  replyLater(otherId, 'Thanks for reaching out! I’d be glad to talk about that. What made you curious?', 2600)
}

export function sendProposal(otherId: string, proposal: Proposal) {
  const st = () => useKudzu.getState()
  st().addMessage(otherId, { from: 'me', proposal })
  const conv = st().conversations.find((c) => c.otherId === otherId)
  const msgId = conv?.messages[conv.messages.length - 1]?.id
  const slot = proposal.slots[Math.floor(Math.random() * proposal.slots.length)]
  replyLater(otherId, 'That time works for me. See you then!', 2600, () => msgId && st().acceptProposal(otherId, msgId, slot))
}

export function acceptTheirProposal(otherId: string, msgId: string, slot: number) {
  useKudzu.getState().acceptProposal(otherId, msgId, slot)
  useKudzu.getState().addMessage(otherId, { from: 'me', text: 'That time works for me!' })
  replyLater(otherId, 'Perfect, it’s on my calendar.', 1800)
}

/* ---------------- thank-you notes ---------------- */

/**
 * Saves the private check-in, then delivers the thank-you note (if any) to the
 * other person. The note is the only part of a check-in they ever see.
 */
export function submitCheckin(fb: Omit<Feedback, 'at'>, msgId: string, thanks: string, rhythmDays?: number) {
  const st = () => useKudzu.getState()
  st().submitFeedback(fb, msgId)
  // a chat that went well is the moment to decide how to keep in touch
  if (fb.met === 'yes' && fb.rating !== 'down') st().setRhythm(fb.otherId, rhythmDays)
  const note = thanks.trim()
  if (fb.met !== 'yes' || !note) return
  st().addMessage(fb.otherId, { from: 'me', text: note, thanks: true })
  const name = firstName(getUser(fb.otherId)?.name ?? '')
  st().say(`Feedback saved privately. Your thank-you is on its way to ${name}.`)
  replyLater(fb.otherId, 'That means a lot. Thank you for telling me. Happy to do it again any time.', 2600)
}

export interface ThanksNote {
  from: User
  text: string
  at: number
}

/** Thank-you notes the signed-in user has received, newest first. Only they can see these. */
export function receivedThanks(s: Pick<KudzuState, 'conversations' | 'schoolId' | 'blocked'>): ThanksNote[] {
  const out: ThanksNote[] = []
  for (const c of s.conversations) {
    if (!inSchool(c.otherId, s.schoolId) || s.blocked.includes(c.otherId)) continue
    const from = getUser(c.otherId)
    if (!from) continue
    for (const m of c.messages) if (m.thanks && m.from !== 'me' && m.text) out.push({ from, text: m.text, at: m.at })
  }
  return out.sort((a, b) => b.at - a.at)
}

const SAMPLE_THANKS = [
  'Thank you for the honest advice last week. I rewrote my resume the way you suggested and got two interviews.',
  'I wanted to say thanks. Talking it through with you is the reason I finally made the decision.',
  'Thanks for making time. You were the first person who explained what the job is like day to day.',
]

/** Demo panel: someone the user helped sends a thank-you note. Returns their id. */
export function receiveThanks(s: KudzuState): string | null {
  const thanked = new Set(receivedThanks(s).map((t) => t.from.id))
  const candidates = webConnections(s)
    .map((c) => getUser(c.otherId))
    .filter((u): u is User => !!u && !thanked.has(u.id))
  // prefer people the user would have been helping
  const helped = candidates.find((u) => matchInfo(s.me, u).mode === 'give') ?? candidates.find((u) => matchInfo(s.me, u).mode === 'trade')
  const pick = helped ?? candidates[0]
  if (!pick) return null
  // someone further along thanks you for the conversation, not for advice
  const text = helped ? SAMPLE_THANKS[thanked.size % SAMPLE_THANKS.length] : 'Thanks for the conversation last week. Your questions made me think, and I got as much out of it as you did.'
  s.addMessage(pick.id, { from: pick.id, text, thanks: true })
  s.say(`${firstName(pick.name)} sent you a thank-you note`)
  return pick.id
}

/** Finds a confirmed chat that has not had its check-in yet (used by the demo panel). */
export function findCheckinTarget(s: KudzuState): { otherId: string; msgId: string } | null {
  for (const c of s.conversations) {
    if (!inSchool(c.otherId, s.schoolId)) continue
    const m = c.messages.find((x) => x.proposal?.acceptedSlot && !x.proposal.checkedIn)
    if (m) return { otherId: c.otherId, msgId: m.id }
  }
  return null
}

/** Chats whose confirmed time has passed and still need a check-in. */
export function dueCheckins(s: KudzuState): { otherId: string; msgId: string }[] {
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
export function accountStanding(s: KudzuState): 'good' | 'warning' {
  return s.showWarning ? 'warning' : 'good'
}
