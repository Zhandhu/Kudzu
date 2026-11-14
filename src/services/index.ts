/**
 * Service layer. Screens read data through these functions rather than importing
 * seed files, so a real API can replace this file later without touching the UI.
 */
import type { Connection, Feedback, InteractionType, KEvent, Level, Mode, Nudge, Prefs, Proposal, Request, Strength, User } from '../types'
import { MODE_META, topicLabel } from '../config/brand'
import { USERS, USERS_BY_ID, knows } from '../data/users'
import { SCHOOLS, PROMPTS } from '../data/schools'
import { ALWAYS_ACCEPT, SEED_NUDGES } from '../data/seed'
import { useKudzu, nowOf, type KudzuState } from '../store/useKudzu'
import { DAY, firstName, hash, miles } from '../lib/util'

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

export function distanceLabel(me: User, other: User): string {
  const d = miles(me.coords, other.coords)
  if (d < 1) return 'Less than a mile away'
  if (d < 60) return `${Math.round(d)} mi away`
  return `${Math.round(d / 10) * 10} mi away`
}

/* ---------------- finding people ---------------- */

export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: 'student', label: 'Students', hint: 'Still at school' },
  { id: 'early', label: 'Early career', hint: 'Up to 5 years out' },
  { id: 'mid', label: 'Mid career', hint: '6 to 12 years out' },
  { id: 'senior', label: 'Senior', hint: '13 years or more' },
]

export const levelLabel = (l: Level) => LEVELS.find((x) => x.id === l)?.label ?? l

/** Where someone is in their career. A friendlier way to search than a range of class years. */
export function levelOf(u: User): Level {
  if (u.role === 'student') return 'student'
  const years = new Date().getFullYear() - u.gradYear
  return years <= 5 ? 'early' : years <= 12 ? 'mid' : 'senior'
}

/** How quickly someone tends to answer, in days. Mocked here from a fixed per-person value. */
export const replyDays = (u: User) => 1 + (hash(u.id + 'reply') % 4)
export const replyLine = (u: User) => `Usually replies in ${replyDays(u) === 1 ? 'a day' : `${replyDays(u)} days`}`

/** What someone is searching for. Every part is optional and they combine. */
export interface Query {
  text: string
  industries: string[]
  cities: string[]
  levels: Level[]
  /** "Can help with": topics the person must offer. */
  topics: string[]
}

export const EMPTY_QUERY: Query = { text: '', industries: [], cities: [], levels: [], topics: [] }
export const isEmptyQuery = (q: Query) => !q.text.trim() && !q.industries.length && !q.cities.length && !q.levels.length && !q.topics.length

export interface Found {
  user: User
  info: MatchInfo
  score: number
  /** Already in the user's network (met, or accepted and not yet met). */
  connected: boolean
}

type FindState = Pick<KudzuState, 'me' | 'prefs' | 'schoolId' | 'connections' | 'blocked' | 'feedback' | 'groups'>

/**
 * Search the school. Only what is in the query narrows the results. Everything
 * else (what you asked for at sign-up, fit, reliability, room for another chat,
 * people in common) decides the order and never hides anyone.
 */
export function findPeople(s: FindState, q: Query): Found[] {
  const { me, prefs } = s
  const connected = new Set(s.connections.map((c) => c.otherId))
  const words = q.text.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return schoolUsers(s.schoolId)
    .filter((u) => !s.blocked.includes(u.id))
    .filter((u) => {
      const hay = [u.name, u.company, u.title, u.major, u.industry, u.city].filter(Boolean).join(' ').toLowerCase()
      return words.every((w) => hay.includes(w))
    })
    .filter((u) => !q.industries.length || q.industries.includes(u.industry))
    .filter((u) => !q.cities.length || q.cities.includes(u.city))
    .filter((u) => !q.levels.length || q.levels.includes(levelOf(u)))
    .filter((u) => q.topics.every((t) => u.offers.includes(t)))
    .map((user, i) => {
      const info = matchInfo(me, user)
      const isConnected = connected.has(user.id)
      const score =
        info.fit * 2.5 + // their offers meet your asks (or the reverse)
        inCommon(me, user, s.groups).length * 1.0 + // common ground
        trustScore(user.id, s.feedback) * 3 + // private reliability
        mutualValue(mutualConnections(s, user).length) * 1.5 + // a few people in common
        noveltyValue(s, user) * 1.0 + // widens your network
        (spotsLeft(user) > 0 ? 1 : -2) + // has room for another chat
        (4 - replyDays(user)) * 0.3 + // tends to answer
        // what you said at sign-up: weights, never walls
        (prefs.industries.includes(user.industry) ? 1.2 : 0) +
        (prefs.cities.includes(user.city) ? 1.0 : 0) +
        (prefs.levels.includes(levelOf(user)) ? 0.8 : 0) -
        // people you already know come after new ones, unless you searched for them by name
        (isConnected && !words.length ? 3 : 0) -
        i * 0.01
      return { user, info, score, connected: isConnected }
    })
    .sort((a, b) => b.score - a.score)
}

/**
 * The front door: a few people who can help with one thing you are looking for,
 * each with someone you both know where there is one.
 */
export function suggestFor(s: FindState, topic: string): (Found & { via?: User })[] {
  return findPeople(s, { ...EMPTY_QUERY, topics: [topic] })
    .filter((f) => !f.connected && spotsLeft(f.user) > 0)
    .slice(0, 4)
    .map((f) => ({ ...f, via: mutualConnections(s, f.user)[0] }))
}

/* ---------------- requests ---------------- */

/** How many requests someone may have waiting at once, so each one is considered. */
export const REQUEST_LIMIT = 5
/** After this many days without an answer a request lapses and the sender is told. */
export const REQUEST_DAYS = 10

export type RequestState = Request['status'] | 'expired'

export const requestState = (r: Request, now: number): RequestState =>
  r.status === 'pending' && now - r.at > REQUEST_DAYS * DAY ? 'expired' : r.status

export const daysLeft = (r: Request, now: number) => Math.max(0, Math.ceil((r.at + REQUEST_DAYS * DAY - now) / DAY))

type RequestsState = Pick<KudzuState, 'requests' | 'schoolId' | 'blocked'>

const inScope = (s: RequestsState, r: Request) => {
  const other = r.fromId === 'me' ? r.toId : r.fromId
  return inSchool(other, s.schoolId) && !s.blocked.includes(other)
}

/** Requests waiting on the user. */
export const incomingRequests = (s: RequestsState, now: number) =>
  s.requests.filter((r) => r.toId === 'me' && inScope(s, r) && requestState(r, now) === 'pending')

/** Requests the user sent that are still waiting, or lapsed and not yet dismissed. */
export const outgoingRequests = (s: RequestsState, now: number) =>
  s.requests.filter((r) => r.fromId === 'me' && inScope(s, r) && ['pending', 'expired'].includes(requestState(r, now)))

export const openRequestCount = (s: RequestsState, now: number) => outgoingRequests(s, now).filter((r) => requestState(r, now) === 'pending').length

/** The user's live request to one person, if there is one. */
export const requestTo = (s: RequestsState, otherId: string, now: number) =>
  s.requests.find((r) => r.fromId === 'me' && r.toId === otherId && requestState(r, now) === 'pending')

/** Whether a request can be sent to someone, and if not, why. */
export function canRequest(s: RequestsState & Pick<KudzuState, 'connections'>, u: User, now: number): 'ok' | 'connected' | 'sent' | 'full' | 'limit' {
  if (s.connections.some((c) => c.otherId === u.id)) return 'connected'
  if (requestTo(s, u.id, now)) return 'sent'
  if (spotsLeft(u) === 0) return 'full'
  if (openRequestCount(s, now) >= REQUEST_LIMIT) return 'limit'
  return 'ok'
}

/** Requests the user let lapse. Two in a row pauses them, so nobody else is left waiting. */
export const lapsedIncoming = (s: RequestsState, now: number) =>
  s.requests.filter((r) => r.toId === 'me' && inScope(s, r) && requestState(r, now) === 'expired').length

export const quietPaused = (s: RequestsState & Pick<KudzuState, 'quietCleared'>, now: number) => lapsedIncoming(s, now) - s.quietCleared >= 2

/** Mock: whether this person answers. In the demo, some never do, so lapsing can be shown. */
const willAccept = (u: User) => ALWAYS_ACCEPT.includes(u.id) || hash(u.id + 'accept') % 10 < 6

/** Send a request. In the demo the other person answers after a moment, or never does. */
export function sendRequest(toId: string, topic: string | undefined, note: string, promptId?: string) {
  const st = () => useKudzu.getState()
  st().addRequest({ fromId: 'me', toId, topic, note: note.trim(), promptId })
  const id = st().requests[0].id
  const other = getUser(toId)
  if (!other) return
  st().say(`Request sent to ${firstName(other.name)}`)
  if (!willAccept(other)) return
  setTimeout(() => {
    st().resolveRequest(id, 'accepted')
    st().say(`${firstName(other.name)} accepted your request`)
    replyLater(toId, 'Glad you reached out. I’d be happy to talk. Send me a couple of times that work for you.', 2200)
  }, 2800)
}

/** Answer a request sent to the user. Each answer is one tap and never needs a reason. */
export function answerRequest(id: string, how: 'accept' | 'later' | 'decline') {
  const st = () => useKudzu.getState()
  const r = st().requests.find((x) => x.id === id)
  const other = r && getUser(r.fromId)
  if (!r || !other) return
  const name = firstName(other.name)
  if (how === 'decline') {
    st().resolveRequest(id, 'declined')
    st().say(`${name} has been told kindly that you can’t right now`)
    return
  }
  st().resolveRequest(id, 'accepted')
  st().addMessage(other.id, {
    from: 'me',
    text: how === 'accept' ? `Happy to, ${name}. Let’s find a time.` : `I’d be glad to, ${name}. The next couple of weeks are full, so could we look at later this month?`,
  })
  st().say(`You accepted ${name}’s request`)
  replyLater(other.id, how === 'accept' ? 'Thank you so much! I’m free most afternoons.' : 'Of course, later this month is great. Thank you!', 2000)
}

/** Demo panel: someone the user could help sends them a request. Returns their id. */
export function receiveRequest(s: KudzuState, now: number): string | null {
  const asked = new Set(s.requests.filter((r) => r.toId === 'me').map((r) => r.fromId))
  const pick = findPeople(s, EMPTY_QUERY).find((f) => !f.connected && !asked.has(f.user.id) && f.info.mode !== 'learn' && !requestTo(s, f.user.id, now))
  if (!pick) return null
  const topic = pick.info.topics[0]
  s.addRequest({ fromId: pick.user.id, toId: 'me', topic, note: `Hi! I saw you can help with ${topic ? topicLabel(topic).toLowerCase() : 'a few things I’m working through'}. Could I ask you a couple of questions?` })
  s.say(`${firstName(pick.user.name)} sent you a request`)
  return pick.user.id
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
  return isClassEvent(e, me) || e.city === me.city || prefs.cities.includes(e.city) || (e.groupId ? me.groupIds.includes(e.groupId) : false) || e.industries.some((i) => interests.includes(i))
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
