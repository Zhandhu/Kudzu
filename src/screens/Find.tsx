import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { Level, User } from '../types'
import { INDUSTRIES, MODE_META, TOPICS, topicLabel } from '../config/brand'
import { useKudzu, useNow } from '../store/useKudzu'
import {
  EMPTY_QUERY, LEVELS, accountStanding, findPeople, isEmptyQuery,
  levelLabel, levelOf, lookAround, mutualConnections, needsFor, quietPaused, 
  requestTo, spotsLeft, suggestFor, suggestForText, type Found, type Query,
  awaitingConfirm,
} from '../services'
import { CITY_NAMES } from '../lib/util'
import { Logo, TendrilIcon } from '../components/brand'
import { Button, Chip, EmptyState, SchoolChip, Sheet, faceFor, inputCls } from '../components/ui'
import { roleLine } from '../components/ProfileView'
import { AccountNotice } from '../components/AccountNotice'
import { ProfilePopup } from '../components/ProfilePopup'

type GroupBy = 'city' | 'industry' | 'level'
const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
const shortName = (u: User) => { const p = u.name.split(' '); return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : p[0] }


/** Connection distance: 1st is in your network, 2nd is known by someone you know, 3rd is further out. */
const DEGREE = { 1: '1st', 2: '2nd', 3: '3rd' } as const
const DEGREE_HINT = { 1: 'In your network', 2: 'Someone you know knows them', 3: 'No one in common yet' } as const

/**
 * One person as a leaf: a headshot, their name, class and company, and nothing else.
 * The tint says how you relate to them. One tap opens the whole profile.
 */
function PersonLeaf({ f, index, requested, degree, onPick }: { f: Found; index: number; requested: boolean; degree: 1 | 2 | 3; onPick: () => void }) {
  const m = MODE_META[f.info.mode]
  const u = f.user
  const full = !f.connected && spotsLeft(u) === 0
  return (
    <button
      onClick={onPick}
      className={`relative flex w-full items-center gap-2 py-3 pl-2.5 pr-3 text-left shadow-sm ${full ? 'opacity-55' : ''}`}
      style={{
        background: f.connected ? '#fff' : m.bg,
        border: `1.5px solid ${f.connected ? m.color : 'transparent'}`,
        // a leaf: pointed at two opposite corners, round at the other two
        borderRadius: index % 2 ? '12px 40px 12px 40px' : '40px 12px 40px 12px',
      }}
      data-leaf
      data-tour="leaf"
      aria-label={`${u.name}, ${roleLine(u)}`}
    >
      {/* The headshot carries the distance as a tag on its lower edge: in your network,
          one introduction away, or further. It is part of the picture, so it never
          runs into the name beside it. */}
      <span className="relative shrink-0" title={DEGREE_HINT[degree]}>
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[24px] leading-none" aria-hidden>{faceFor(u)}</span>
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-1.5 text-[9.5px] font-bold leading-[15px] text-cream ring-2 ring-white" style={{ background: m.color }}>{DEGREE[degree]}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-[14.5px] font-semibold leading-tight" style={{ color: m.color }}>
          <span className="truncate">{shortName(u)}</span>
          {requested && <TendrilIcon size={13} color={m.color} />}
        </span>
        <span className="block whitespace-nowrap text-[12px] leading-snug text-ink/55">Class of ’{String(u.gradYear).slice(2)}</span>
        <span className="block truncate text-[12px] leading-snug text-ink/70">{u.company ?? (u.role === 'student' ? 'Student' : u.industry)}</span>
      </span>
    </button>
  )
}

export default function Find() {
  const s = useKudzu()
  const now = useNow()
  const [params, setParams] = useSearchParams()
  const startTopic = params.get('topic')
  const [q, setQ] = useState<Query>(startTopic ? { ...EMPTY_QUERY, topics: [startTopic] } : EMPTY_QUERY)
  const [groupChoice, setGroupBy] = useState<GroupBy>('city')
  const [picked, setPicked] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  // nothing is shown until you say what you are looking for: a topic, or your own words
  // both live in the link, so coming back from a profile shows the same people again
  const OTHER = 'other'
  const ask = params.get('for')
  const needSent = params.get('q') ?? ''
  const [need, setNeed] = useState(needSent)
  const setAsk = (v: string | null) => setParams(v ? { for: v } : {}, { replace: true })
  const setNeedSent = (v: string) => setParams(v ? { for: OTHER, q: v } : { for: OTHER }, { replace: true })
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
  const isRequested = (id: string) => !!requestTo(s, id, now)
  const suggested: (Found & { via?: User; matched?: string[] })[] = useMemo(
    () => (!ask ? [] : ask === OTHER ? suggestForText(s, needSent) : suggestFor(s, ask)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.me, s.prefs, s.schoolId, s.connections, s.blocked, s.feedback, s.groups, ask, needSent],
  )

  const applyFilter = (next: Query) => { setQ(next); setAdding(false); setPicked(null) }

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

  // A search narrowed to one city (or field, or level) would put everyone on a single branch
  // if grouped by that same thing, so that grouping is skipped and the next one is used.
  const groupOptions = (['city', 'industry', 'level'] as GroupBy[]).filter(
    (g) => (g === 'city' ? q.cities : g === 'industry' ? q.industries : q.levels).length !== 1,
  )
  const groupBy = groupOptions.includes(groupChoice) ? groupChoice : groupOptions[0] ?? groupChoice

  // results gathered onto branches
  const keyOf = (f: Found) => (groupBy === 'city' ? f.user.city : groupBy === 'industry' ? f.user.industry : levelLabel(levelOf(f.user)))
  const branches = useMemo(() => {
    const m = new Map<string, Found[]>()
    for (const f of results) m.set(keyOf(f), [...(m.get(keyOf(f)) ?? []), f])
    return [...m.entries()].sort((a, b) => b[1][0].score - a[1][0].score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, groupBy])


  // The front door fills itself in from what is known about you, so it never opens on
  // one lonely option. What you said you want comes first; the rest suits your stage.
  const needs = needsFor(s.me)
  const around = lookAround(s.me, s.prefs)

  // nothing asked for and nothing to announce: the page holds still
  const still = empty && !ask && accountStanding(s) !== 'warning' && !quietPaused(s, now) && !s.paused && !s.settings.privateMode

  const leaf = (f: Found, i: number) => (
    <PersonLeaf key={f.user.id} f={f} index={i} requested={isRequested(f.user.id)} degree={f.connected && !awaitingConfirm(s, f.user.id) ? 1 : mutualConnections(s, f.user).length ? 2 : 3} onPick={() => setPicked(f.user.id)} />
  )

  // What drops out from under the need you tapped: a few people, or the reason there are none.
  const dropOut = () => {
    if (!ask || (ask === OTHER && !needSent)) return null
    return (
      // Closing mirrors opening: the leaves pull back up into the need, the stem draws in,
      // and the space they took folds shut, so whatever is below slides up instead of jumping.
      <motion.div
        key={ask + needSent}
        className="overflow-hidden"
        initial={{ height: 0 }} animate={{ height: 'auto' }}
        exit={{ height: 0, transition: { duration: 0.28, ease: 'easeIn', delay: 0.12 } }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
      <div className="relative ml-3 mt-1 pb-1 pl-2.5 pr-1">
        {/* a stem runs down from the need, and the leaves fall off it one by one */}
        <motion.span className="absolute bottom-2 left-0 top-0 w-0.5 origin-top rounded-full bg-vine-300" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0, transition: { duration: 0.25, delay: 0.1 } }} transition={{ duration: 0.35, ease: 'easeOut' }} aria-hidden />
        {ask === OTHER && suggested.length > 0 && (
          <p className="pb-1 pt-2 text-xs text-ink/55">Found by {[...new Set(suggested.flatMap((f) => f.matched ?? []))].join(', ')}</p>
        )}
        {suggested.length === 0 ? (
          <p className="mt-2 rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">
            {ask === OTHER ? 'Nobody fits those words yet. Try a field, a company or a city.' : 'Nobody with room right now. Try another need, or search above.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {suggested.map((f, i) => (
              <motion.div
                key={f.user.id}
                style={{ transformOrigin: 'top left' }}
                initial={{ y: -46 - Math.floor(i / 2) * 60, scale: 0.4, opacity: 0, rotate: i % 2 ? 8 : -8 }}
                animate={{ y: 0, scale: 1, opacity: 1, rotate: 0 }}
                // the last leaf out is the first back in
                exit={{ y: -30 - Math.floor(i / 2) * 50, scale: 0.4, opacity: 0, rotate: i % 2 ? 8 : -8, transition: { duration: 0.2, ease: 'easeIn', delay: (suggested.length - 1 - i) * 0.04 } }}
                transition={{ type: 'spring', stiffness: 210, damping: 17, delay: 0.12 + i * 0.1 }}
              >
                {leaf(f, i)}
              </motion.div>
            ))}
          </div>
        )}
        {ask !== OTHER && suggested.length > 0 && (
          <button onClick={() => setQ({ ...EMPTY_QUERY, topics: [ask] })} className="mt-2 text-xs font-semibold text-vine-700">See everyone who can help</button>
        )}
      </div>
      </motion.div>
    )
  }

  return (
    <div className="relative flex h-full flex-col">
      <header className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <SchoolChip />
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

      {/* The front door has no spare room below it, so on most phones it fits and holds still,
          and on a small one it scrolls only as far as its content goes. The long padding that
          keeps results clear of the corner leaves is added once there are results to show. */}
      <div data-find-body className={`app-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 ${still ? 'pb-4' : 'pb-36'}`}>
        {accountStanding(s) === 'warning' && <div className="mb-3 px-1"><AccountNotice compact /></div>}
        {quietPaused(s, now) && (
          <div className="mx-1 mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-[13px] leading-relaxed text-amber-900">
            <div className="font-semibold">You’re paused for new requests</div>
            A couple of requests to you went unanswered, so we stopped sending new ones to save people a wait. Nothing else has changed.
            <Button className="mt-2 w-full !py-2" onClick={() => { s.set({ quietCleared: s.quietCleared + 2 }); s.say('You’re taking requests again') }}>I’m back</Button>
          </div>
        )}
        {s.paused && <div className="mx-1 mb-3 rounded-2xl bg-sage-100 p-3 text-center text-[13px] font-medium text-ink/70">Your account is paused, so nobody can find you or send you requests.</div>}
        {!s.paused && s.settings.privateMode && <div className="mx-1 mb-3 rounded-2xl bg-sage-100 p-3 text-center text-[13px] font-medium text-ink/70">You’re private. Only your connections can see you.</div>}

        {empty ? (
          <div className="px-1">
            <h1 className="mt-1 font-display text-2xl font-semibold">What are you looking for?</h1>
            <p className="mt-1 text-[13px] text-ink/50">Tap one and the people who can help drop out below it.</p>
            {/* one need per line, so the people it finds can fall out from right under it */}
            <div className="mt-3 space-y-2" role="group" aria-label="What you’re looking for">
              {needs.map((t) => (
                <div key={t}>
                  <span data-tour="need"><Chip active={ask === t} onClick={() => setAsk(ask === t ? null : t)}>{topicLabel(t)}</Chip></span>
                  <AnimatePresence initial={false}>{ask === t && dropOut()}</AnimatePresence>
                </div>
              ))}
              <div>
                <Chip tone="plain" active={ask === OTHER} onClick={() => setAsk(ask === OTHER ? null : OTHER)}><Plus size={12} /> Something else</Chip>
                <AnimatePresence initial={false}>
                {ask === OTHER && (
                  <motion.form
                    key="own-words" className="ml-4 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}
                    onSubmit={(e) => { e.preventDefault(); setNeedSent(need.trim()) }}
                  >
                    <div className="h-2" />
                    <textarea
                      className={`${inputCls} min-h-[72px] resize-none`}
                      placeholder="In your own words. For example: someone who moved from finance into design"
                      value={need}
                      onChange={(e) => setNeed(e.target.value)}
                      aria-label="Describe what you’re looking for"
                      maxLength={160}
                    />
                    <Button type="submit" className="mt-2 w-full !py-2.5" disabled={!need.trim()}>Find someone</Button>
                  </motion.form>
                )}
                </AnimatePresence>
                <AnimatePresence initial={false}>{ask === OTHER && dropOut()}</AnimatePresence>
              </div>
            </div>

            {/* kept clear of the two leaves in the bottom corner */}
            <h2 className="mb-2 mt-6 text-sm font-semibold">Or look around</h2>
            <div className="flex flex-wrap gap-2 pr-14">
              {around.map((a) => <Chip key={a.label} tone="plain" onClick={() => setQ({ ...EMPTY_QUERY, ...a.query })}>{a.label}</Chip>)}
              <Chip tone="plain" onClick={() => setAdding(true)}><Plus size={12} /> More</Chip>
            </div>
          </div>
        ) : results.length === 0 ? (
          <EmptyState title="Nobody matches that" body="Try removing a filter, or search for a company or a city.">
            <Button onClick={() => setQ(EMPTY_QUERY)}>Clear search</Button>
          </EmptyState>
        ) : (
          <div className="px-1">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-ink/55">{results.length} {results.length === 1 ? 'person' : 'people'}</span>
              <div className="flex items-center gap-1 text-xs">
                {groupOptions.length > 1 && <span className="text-ink/45">Group by</span>}
                {groupOptions.length > 1 && groupOptions.map((g) => (
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
                  <div className="mt-2 grid grid-cols-2 gap-2">{list.map(leaf)}</div>
                </section>
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px] text-ink/50">
              {(['learn', 'trade', 'give'] as const).map((m) => (
                <span key={m} className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ background: MODE_META[m].color }} /> {MODE_META[m].label}</span>
              ))}
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full border border-vine-700 bg-white" /> In your network</span>
              <span className="basis-full"><b className="font-semibold text-ink/65">1st</b> in your network · <b className="font-semibold text-ink/65">2nd</b> someone you know knows them · <b className="font-semibold text-ink/65">3rd</b> further out</span>
            </div>
          </div>
        )}
      </div>

      {/* one tap on anyone opens their whole profile, floating over the search */}
      <ProfilePopup userId={picked} onClose={() => setPicked(null)} />

      {/* picking a filter applies it and closes the sheet: one tap, nothing to dismiss */}
      <Sheet open={adding} onClose={() => setAdding(false)} title="Narrow it down">
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-sm font-semibold">Field</div>
            <div className="flex flex-wrap gap-2">{INDUSTRIES.map((i) => <Chip key={i} active={q.industries.includes(i)} onClick={() => applyFilter({ ...q, industries: toggle(q.industries, i) })}>{i}</Chip>)}</div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">City</div>
            <div className="flex flex-wrap gap-2">{CITY_NAMES.map((c) => <Chip key={c} tone="coffee" active={q.cities.includes(c)} onClick={() => applyFilter({ ...q, cities: toggle(q.cities, c) })}>{c}</Chip>)}</div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Level</div>
            <div className="flex flex-wrap gap-2">{LEVELS.map((l) => <Chip key={l.id} active={q.levels.includes(l.id)} onClick={() => applyFilter({ ...q, levels: toggle<Level>(q.levels, l.id) })}>{l.label}</Chip>)}</div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Can help with</div>
            <div className="flex flex-wrap gap-2">{TOPICS.map((t) => <Chip key={t.id} tone="coffee" active={q.topics.includes(t.id)} onClick={() => applyFilter({ ...q, topics: toggle(q.topics, t.id) })}>{t.label}</Chip>)}</div>
          </div>
        </div>
      </Sheet>

    </div>
  )
}
