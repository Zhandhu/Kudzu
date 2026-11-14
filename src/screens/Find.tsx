import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Coffee, LayoutList, Leaf, Plus, Search, X } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Level, Request, User } from '../types'
import { INDUSTRIES, MODE_META, TOPICS, topicLabel } from '../config/brand'
import { useKudzu, useNow } from '../store/useKudzu'
import {
  EMPTY_QUERY, LEVELS, REQUEST_LIMIT, accountStanding, answerRequest, daysLeft, findPeople, getUser, incomingRequests, isEmptyQuery,
  levelLabel, levelOf, mutualConnections, openRequestCount, outgoingRequests, pendingConnections, quietPaused, replyLine, requestState,
  requestTo, spotsLeft, suggestFor, type Found, type Query,
} from '../services'
import { CITY_NAMES, ago, firstName } from '../lib/util'
import { Logo, TendrilIcon } from '../components/brand'
import { Avatar, Button, Chip, EmptyState, SchoolChip, Sheet, inputCls } from '../components/ui'
import { ModeTag, roleLine } from '../components/ProfileView'
import { AccountNotice } from '../components/AccountNotice'
import { LeafSprig, type LeafItem } from '../components/NetworkLeaves'

type GroupBy = 'city' | 'industry' | 'level'
const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
const shortName = (u: User) => { const p = u.name.split(' '); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0] }

/** One person as a leaf: a lens-shaped tag carrying their name, coloured by how you relate to them. */
function PersonLeaf({ f, index, selected, requested, onPick }: { f: Found; index: number; selected: boolean; requested: boolean; onPick: () => void }) {
  const m = MODE_META[f.info.mode]
  const full = !f.connected && spotsLeft(f.user) === 0
  return (
    <button
      onClick={onPick}
      onMouseEnter={(e) => { if (window.matchMedia('(hover: hover)').matches) { e.currentTarget.focus(); onPick() } }}
      className={`relative flex h-10 items-center gap-1.5 px-4 text-[13px] font-semibold shadow-sm transition-transform hover:scale-[1.04] ${selected ? 'ring-2 ring-ink/70 ring-offset-2 ring-offset-cream' : ''} ${full ? 'opacity-55' : ''}`}
      style={{
        background: f.connected ? '#fff' : m.color,
        color: f.connected ? m.color : '#faf6ee',
        border: f.connected ? `1.5px solid ${m.color}` : undefined,
        // a leaf: pointed at two opposite corners, round at the other two
        borderRadius: index % 2 ? '4px 999px 4px 999px' : '999px 4px 999px 4px',
        transform: `rotate(${[-2, 1.5, -1, 2][index % 4]}deg)`,
      }}
      aria-label={`${f.user.name}, ${roleLine(f.user)}`}
      aria-pressed={selected}
    >
      {shortName(f.user)}
      {requested && <TendrilIcon size={14} color={f.connected ? m.color : '#faf6ee'} />}
    </button>
  )
}

/** The synopsis shown when a leaf is hovered or tapped once. Tapping it opens the full profile. */
function Synopsis({ f, requested, onClose }: { f: Found; requested: boolean; onClose: () => void }) {
  const s = useKudzu()
  const nav = useNavigate()
  const u = f.user
  const mutual = mutualConnections(s, u)
  const spots = spotsLeft(u)
  return (
    <div className="absolute inset-x-3 bottom-3 z-[1200] rounded-2xl bg-white p-3.5 shadow-xl ring-1 ring-sage-200">
      <button onClick={onClose} className="absolute right-2 top-2 rounded-full p-1 text-ink/40 hover:bg-sage-100" aria-label="Close"><X size={16} /></button>
      <button onClick={() => nav(`/u/${u.id}`)} className="flex w-full items-start gap-3 pr-6 text-left">
        <Avatar user={u} size={48} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[17px] font-semibold">{u.name}</span>
          <span className="block truncate text-[13px] text-ink/65">{roleLine(u)}</span>
          <span className="block text-xs text-ink/50">{u.city} · Class of {u.gradYear}</span>
        </span>
      </button>
      <div className="mt-2.5 flex flex-wrap items-center gap-2"><ModeTag mode={f.info.mode} /><span className="text-[13px] text-ink/75">{f.info.reason}</span></div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/55">
        {mutual.length > 0 && <span>You both know {mutual.slice(0, 2).map((m) => firstName(m.name)).join(' and ')}{mutual.length > 2 ? ` +${mutual.length - 2}` : ''}</span>}
        {f.connected ? <span>In your network</span> : requested ? <span>Request sent</span> : spots > 0 ? <span>{spots} of {u.capacity} spots left</span> : <span>Full this month</span>}
        {!f.connected && <span>{replyLine(u)}</span>}
      </div>
      <button onClick={() => nav(`/u/${u.id}`)} className="mt-3 flex w-full items-center justify-center gap-1 rounded-full bg-vine-700 py-2.5 text-sm font-semibold text-cream">
        Open full profile <ChevronRight size={16} />
      </button>
    </div>
  )
}

function RequestsSheet({ open, onClose, incoming, outgoing }: { open: boolean; onClose: () => void; incoming: Request[]; outgoing: Request[] }) {
  const s = useKudzu()
  const now = useNow()
  const nav = useNavigate()
  return (
    <Sheet open={open} onClose={onClose} title="Requests">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Asked of you · {incoming.length}</h3>
      {incoming.length === 0 && <p className="mb-4 rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">Nobody is waiting on you.</p>}
      <div className="space-y-3">
        {incoming.map((r) => {
          const u = getUser(r.fromId)
          if (!u) return null
          return (
            <div key={r.id} className="rounded-2xl bg-white p-3.5 ring-1 ring-sage-200">
              <Link to={`/u/${u.id}`} className="flex items-center gap-3">
                <Avatar user={u} size={42} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{u.name}</span>
                  <span className="block truncate text-xs text-ink/55">{roleLine(u)}</span>
                </span>
                <span className="shrink-0 text-[11px] text-ink/45">{daysLeft(r, now)}d left</span>
              </Link>
              {r.topic && <div className="mt-2.5"><Chip small tone="coffee">{topicLabel(r.topic)}</Chip></div>}
              <p className="mt-2 text-[14px] leading-snug text-ink/80">“{r.note}”</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button onClick={() => { answerRequest(r.id, 'accept'); onClose(); nav(`/messages/${u.id}`) }} className="rounded-full bg-vine-700 py-2 text-xs font-semibold text-cream">Accept</button>
                <button onClick={() => { answerRequest(r.id, 'later'); onClose(); nav(`/messages/${u.id}`) }} className="rounded-full border border-vine-700 py-2 text-xs font-semibold text-vine-700">Later on</button>
                <button onClick={() => answerRequest(r.id, 'decline')} className="rounded-full border border-sage-200 bg-white py-2 text-xs font-semibold text-ink/60">Not right now</button>
              </div>
            </div>
          )
        })}
      </div>
      {incoming.length > 0 && <p className="mt-2 text-center text-[11px] text-ink/45">Every answer is one tap. “Not right now” sends a kind note for you and never needs a reason.</p>}

      <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-ink/50">Waiting on · {outgoing.filter((r) => requestState(r, now) === 'pending').length} of {REQUEST_LIMIT}</h3>
      {outgoing.length === 0 && <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">You have no requests out. Find someone and ask.</p>}
      <div className="space-y-2">
        {outgoing.map((r) => {
          const u = getUser(r.toId)
          if (!u) return null
          const lapsed = requestState(r, now) === 'expired'
          return (
            <div key={r.id} className={`rounded-2xl p-3 ring-1 ${lapsed ? 'bg-coffee-100/60 ring-coffee-200' : 'bg-white ring-sage-200'}`}>
              <div className="flex items-center gap-3">
                <TendrilIcon size={22} color={lapsed ? '#8b5e3c' : '#356433'} />
                <Link to={`/u/${u.id}`} className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{u.name}</span>
                  <span className="block truncate text-xs text-ink/55">
                    {lapsed ? `${firstName(u.name)} couldn’t get to this one` : `Sent ${ago(r.at, now)} · ${daysLeft(r, now)} days left`}
                    {r.topic ? ` · ${topicLabel(r.topic)}` : ''}
                  </span>
                </Link>
                <button onClick={() => s.dismissRequest(r.id)} className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-ink/50 hover:bg-sage-100">{lapsed ? 'Clear' : 'Withdraw'}</button>
              </div>
              {lapsed && (
                <button
                  onClick={() => { s.dismissRequest(r.id); onClose(); nav(r.topic ? `/find?topic=${r.topic}` : '/find') }}
                  className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-full bg-coffee-500 py-2 text-xs font-semibold text-cream"
                >
                  See who else can help{r.topic ? ` with ${topicLabel(r.topic).toLowerCase()}` : ''} <ChevronRight size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}

export default function Find() {
  const s = useKudzu()
  const now = useNow()
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const startTopic = params.get('topic')
  const [q, setQ] = useState<Query>(startTopic ? { ...EMPTY_QUERY, topics: [startTopic] } : EMPTY_QUERY)
  const [groupBy, setGroupBy] = useState<GroupBy>('city')
  const [picked, setPicked] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [sheet, setSheet] = useState<'requests' | 'pending' | null>(null)
  const [ask, setAsk] = useState(s.me.asks[0] ?? TOPICS[0].id)
  const leaves = s.findView !== 'rows'
  const empty = isEmptyQuery(q)

  // arriving with a topic in the link (from a lapsed request) starts a search for it
  useEffect(() => {
    if (!startTopic) return
    setQ({ ...EMPTY_QUERY, topics: [startTopic] })
    setParams({}, { replace: true })
  }, [startTopic, setParams])

  const results = useMemo(
    () => findPeople(s, q),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.me, s.prefs, s.schoolId, s.connections, s.blocked, s.feedback, s.groups, q],
  )
  const incoming = incomingRequests(s, now)
  const outgoing = outgoingRequests(s, now)
  const pending = pendingConnections(s).map((c) => getUser(c.otherId)).filter((u): u is User => !!u)
  const lapsed = outgoing.filter((r) => requestState(r, now) === 'expired').length
  const isRequested = (id: string) => !!requestTo(s, id, now)
  const pickedFound = picked ? results.find((f) => f.user.id === picked) ?? suggestFor(s, ask).find((f) => f.user.id === picked) : undefined

  // typing "new" offers the New York chip, and so on
  const term = q.text.trim().toLowerCase()
  const offers = term.length < 2 ? [] : [
    ...INDUSTRIES.filter((i) => i.toLowerCase().startsWith(term) && !q.industries.includes(i)).map((i) => ({ label: i, add: () => setQ({ ...q, text: '', industries: [...q.industries, i] }) })),
    ...CITY_NAMES.filter((c) => c.toLowerCase().includes(term) && !q.cities.includes(c)).map((c) => ({ label: c, add: () => setQ({ ...q, text: '', cities: [...q.cities, c] }) })),
    ...LEVELS.filter((l) => l.label.toLowerCase().startsWith(term) && !q.levels.includes(l.id)).map((l) => ({ label: l.label, add: () => setQ({ ...q, text: '', levels: [...q.levels, l.id] }) })),
    ...TOPICS.filter((t) => t.label.toLowerCase().includes(term) && !q.topics.includes(t.id)).map((t) => ({ label: `Can help with: ${t.label.toLowerCase()}`, add: () => setQ({ ...q, text: '', topics: [...q.topics, t.id] }) })),
  ].slice(0, 3)

  const chips = [
    ...q.industries.map((v) => ({ label: v, remove: () => setQ({ ...q, industries: q.industries.filter((x) => x !== v) }) })),
    ...q.cities.map((v) => ({ label: v, remove: () => setQ({ ...q, cities: q.cities.filter((x) => x !== v) }) })),
    ...q.levels.map((v) => ({ label: levelLabel(v), remove: () => setQ({ ...q, levels: q.levels.filter((x) => x !== v) }) })),
    ...q.topics.map((v) => ({ label: `Can help with: ${topicLabel(v).toLowerCase()}`, remove: () => setQ({ ...q, topics: q.topics.filter((x) => x !== v) }) })),
  ]

  // results gathered onto branches
  const keyOf = (f: Found) => (groupBy === 'city' ? f.user.city : groupBy === 'industry' ? f.user.industry : levelLabel(levelOf(f.user)))
  const branches = useMemo(() => {
    const m = new Map<string, Found[]>()
    for (const f of results) m.set(keyOf(f), [...(m.get(keyOf(f)) ?? []), f])
    return [...m.entries()].sort((a, b) => b[1][0].score - a[1][0].score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, groupBy])

  const sprig: LeafItem[] = [
    { key: 'requests', label: 'Requests', count: incoming.length + lapsed, onClick: () => setSheet('requests') },
    { key: 'pending', label: 'Not yet met', count: pending.length, onClick: () => setSheet('pending') },
  ]

  const row = (f: Found, via?: User) => (
    <Link key={f.user.id} to={`/u/${f.user.id}`} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-sage-50">
      <Avatar user={f.user} size={44} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 truncate font-semibold">{f.user.name}{isRequested(f.user.id) && <TendrilIcon size={14} />}</span>
        <span className="block truncate text-[13px] text-ink/55">{roleLine(f.user)} · {f.user.city}</span>
        <span className="block truncate text-xs text-vine-700">{f.info.reason}</span>
        {via && <span className="block truncate text-[11px] text-coffee-600">You → {firstName(via.name)} → {firstName(f.user.name)}</span>}
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink/30" />
    </Link>
  )

  return (
    <div className="relative flex h-full flex-col">
      <header className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <SchoolChip />
            <button
              onClick={() => { s.set({ findView: leaves ? 'rows' : 'leaves' }); setPicked(null) }}
              className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink/70 ring-1 ring-sage-200"
              aria-label={leaves ? 'Switch to simple list' : 'Switch to leaves'}
            >
              {leaves ? <><LayoutList size={14} /> Simple</> : <><Leaf size={14} /> Leaves</>}
            </button>
          </div>
        </div>

        <div className="relative mt-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input className={`${inputCls} !rounded-full pl-10 pr-10`} placeholder="Name, company, field or city" value={q.text} onChange={(e) => setQ({ ...q, text: e.target.value })} aria-label="Search people" />
          <button onClick={() => setAdding(true)} className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-vine-700 text-cream" aria-label="Add a filter"><Plus size={16} /></button>
        </div>

        {(offers.length > 0 || chips.length > 0) && (
          <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4">
            {offers.map((o) => <Chip key={o.label} tone="plain" onClick={o.add}><Plus size={12} /> {o.label}</Chip>)}
            {chips.map((c) => <Chip key={c.label} active onClick={c.remove}>{c.label} <X size={12} /></Chip>)}
            {chips.length > 1 && <Chip tone="plain" onClick={() => setQ(EMPTY_QUERY)}>Clear all</Chip>}
          </div>
        )}
      </header>

      <div className="app-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-36" onClick={(e) => { if (e.target === e.currentTarget) setPicked(null) }}>
        {accountStanding(s) === 'warning' && <div className="mb-3 px-1"><AccountNotice compact /></div>}
        {quietPaused(s, now) && (
          <div className="mx-1 mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-[13px] leading-relaxed text-amber-900">
            <div className="font-semibold">You’re paused for new requests</div>
            A couple of requests to you went unanswered, so we stopped sending new ones to save people a wait. Nothing else has changed.
            <Button className="mt-2 w-full !py-2" onClick={() => { s.set({ quietCleared: s.quietCleared + 2 }); s.say('You’re taking requests again') }}>I’m back</Button>
          </div>
        )}
        {s.paused && <div className="mx-1 mb-3 rounded-2xl bg-sage-100 p-3 text-center text-[13px] font-medium text-ink/70">Your profile is paused, so nobody can send you requests. You can still search.</div>}

        {empty ? (
          <div className="px-1">
            <h1 className="mt-1 font-display text-2xl font-semibold">What are you looking for?</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {(s.me.asks.length ? s.me.asks : TOPICS.slice(0, 3).map((t) => t.id)).map((t) => (
                <Chip key={t} active={ask === t} onClick={() => { setAsk(t); setPicked(null) }}>{topicLabel(t)}</Chip>
              ))}
            </div>
            {(() => {
              const people = suggestFor(s, ask)
              return (
                <>
                  <div className="mb-1 mt-5 flex items-baseline justify-between">
                    <h2 className="text-sm font-semibold">People who can help</h2>
                    <button onClick={() => setQ({ ...EMPTY_QUERY, topics: [ask] })} className="text-xs font-semibold text-vine-700">See everyone</button>
                  </div>
                  {people.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">Nobody with room right now. Try another topic, or search above.</p>
                  ) : leaves ? (
                    <div className="mt-2 border-l-2 border-vine-200 pl-3">
                      <div className="flex flex-wrap gap-x-2.5 gap-y-3 py-1">
                        {people.map((f, i) => <PersonLeaf key={f.user.id} f={f} index={i} selected={picked === f.user.id} requested={isRequested(f.user.id)} onPick={() => (picked === f.user.id ? nav(`/u/${f.user.id}`) : setPicked(f.user.id))} />)}
                      </div>
                    </div>
                  ) : (
                    <div>{people.map((f) => row(f, f.via))}</div>
                  )}
                  {leaves && people.some((f) => f.via) && (
                    <p className="mt-3 text-xs text-ink/55">
                      {people.filter((f) => f.via).slice(0, 2).map((f) => `${firstName(f.via!.name)} knows ${firstName(f.user.name)}`).join(' · ')}
                    </p>
                  )}
                </>
              )
            })()}

            <h2 className="mb-2 mt-6 text-sm font-semibold">Or look around</h2>
            <div className="flex flex-wrap gap-2">
              {s.prefs.industries.map((i) => <Chip key={i} tone="plain" onClick={() => setQ({ ...EMPTY_QUERY, industries: [i] })}>{i}</Chip>)}
              {s.prefs.cities.map((c) => <Chip key={c} tone="plain" onClick={() => setQ({ ...EMPTY_QUERY, cities: [c] })}>{c}</Chip>)}
              <Chip tone="plain" onClick={() => setQ({ ...EMPTY_QUERY, levels: ['senior'] })}>Senior alumni</Chip>
              <Chip tone="plain" onClick={() => setAdding(true)}><Plus size={12} /> More</Chip>
            </div>
          </div>
        ) : results.length === 0 ? (
          <EmptyState title="Nobody matches that" body="Try removing a filter, or search for a company or a city.">
            <Button onClick={() => setQ(EMPTY_QUERY)}>Clear search</Button>
          </EmptyState>
        ) : leaves ? (
          <div className="px-1">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-ink/55">{results.length} {results.length === 1 ? 'person' : 'people'}</span>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-ink/45">Group by</span>
                {(['city', 'industry', 'level'] as GroupBy[]).map((g) => (
                  <button key={g} onClick={() => setGroupBy(g)} className={`rounded-full px-2.5 py-1 font-semibold capitalize ${groupBy === g ? 'bg-vine-700 text-cream' : 'text-ink/55'}`} aria-pressed={groupBy === g}>{g}</button>
                ))}
              </div>
            </div>
            {/* the vine: one stem down the side, a branch for each group, leaves along each branch */}
            <div className="border-l-2 border-vine-300">
              {branches.map(([name, list]) => (
                <section key={name} className="relative pb-4 pl-4">
                  <span className="absolute left-0 top-[11px] h-0.5 w-3 bg-vine-300" aria-hidden />
                  <h2 className="text-[13px] font-semibold text-ink/75">{name} <span className="font-normal text-ink/40">· {list.length}</span></h2>
                  <div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-3">
                    {list.map((f, i) => <PersonLeaf key={f.user.id} f={f} index={i} selected={picked === f.user.id} requested={isRequested(f.user.id)} onPick={() => (picked === f.user.id ? nav(`/u/${f.user.id}`) : setPicked(f.user.id))} />)}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px] text-ink/50">
              {(['learn', 'trade', 'give'] as const).map((m) => (
                <span key={m} className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: MODE_META[m].color }} /> {MODE_META[m].label}</span>
              ))}
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full border border-vine-700 bg-white" /> In your network</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="px-2 pb-1 text-xs text-ink/55">{results.length} {results.length === 1 ? 'person' : 'people'}</div>
            {results.map((f) => row(f))}
          </div>
        )}
      </div>

      {pickedFound && leaves ? <Synopsis f={pickedFound} requested={isRequested(pickedFound.user.id)} onClose={() => setPicked(null)} /> : <LeafSprig items={sprig} />}

      <Sheet open={adding} onClose={() => setAdding(false)} title="Narrow it down">
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-sm font-semibold">Field</div>
            <div className="flex flex-wrap gap-2">{INDUSTRIES.map((i) => <Chip key={i} active={q.industries.includes(i)} onClick={() => setQ({ ...q, industries: toggle(q.industries, i) })}>{i}</Chip>)}</div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">City</div>
            <div className="flex flex-wrap gap-2">{CITY_NAMES.map((c) => <Chip key={c} tone="coffee" active={q.cities.includes(c)} onClick={() => setQ({ ...q, cities: toggle(q.cities, c) })}>{c}</Chip>)}</div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Level</div>
            <div className="flex flex-wrap gap-2">{LEVELS.map((l) => <Chip key={l.id} active={q.levels.includes(l.id)} onClick={() => setQ({ ...q, levels: toggle<Level>(q.levels, l.id) })}>{l.label}</Chip>)}</div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Can help with</div>
            <div className="flex flex-wrap gap-2">{TOPICS.map((t) => <Chip key={t.id} tone="coffee" active={q.topics.includes(t.id)} onClick={() => setQ({ ...q, topics: toggle(q.topics, t.id) })}>{t.label}</Chip>)}</div>
          </div>
          <Button className="w-full" onClick={() => setAdding(false)}>Show {results.length} {results.length === 1 ? 'person' : 'people'}</Button>
        </div>
      </Sheet>

      <RequestsSheet open={sheet === 'requests'} onClose={() => setSheet(null)} incoming={incoming} outgoing={outgoing} />

      <Sheet open={sheet === 'pending'} onClose={() => setSheet(null)} title="Not yet met">
        <p className="mb-3 text-[13px] leading-relaxed text-ink/60">You’ve connected with these people but haven’t met. They join your web after your first coffee chat.</p>
        {pending.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink/55">No one is waiting. Everyone you’ve connected with is in your web.</p>
        ) : (
          <div className="divide-y divide-sage-200 rounded-2xl border border-dashed border-sage-300 bg-white">
            {pending.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-3 py-2.5">
                {/* tapping the person opens the chat; the cup proposes coffee */}
                <Link to={`/messages/${u.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar user={u} size={38} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{u.name}</span>
                    <span className="block truncate text-xs text-ink/55">{roleLine(u)}</span>
                  </span>
                </Link>
                <Link to={`/messages/${u.id}?propose=1`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coffee-100 text-coffee-600" aria-label={`Propose coffee with ${u.name}`}><Coffee size={17} /></Link>
              </div>
            ))}
          </div>
        )}
      </Sheet>
    </div>
  )
}
