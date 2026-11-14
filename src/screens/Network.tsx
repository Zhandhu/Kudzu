import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Coffee, List, Map as MapIcon, MessageCircle, Search, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Mode, Nudge, Strength } from '../types'
import { MODES, MODE_META, STRENGTH_META, STRENGTH_ORDER } from '../config/brand'
import { useKudzu, useNow } from '../store/useKudzu'
import { computeNudges, getUser, matchInfo, schoolConnections, strengthOf } from '../services'
import { LeafIcon } from '../components/brand'
import { Avatar, Chip, EmptyState, SchoolChip, inputCls } from '../components/ui'
import { ModeIcon, ModeTag, roleLine } from '../components/ProfileView'
import NetworkMap, { type MapPerson } from '../components/NetworkMap'

function NudgeCard({ n }: { n: Nudge }) {
  const nav = useNavigate()
  const dismiss = useKudzu((s) => s.dismissNudge)
  const u = getUser(n.otherId)
  if (!u) return null
  const go = () => {
    dismiss(n.id)
    nav(n.action === 'coffee' ? `/messages/${u.id}?propose=1` : `/messages/${u.id}?draft=${encodeURIComponent(n.draft ?? '')}`)
  }
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }} className="rounded-2xl border border-sage-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar user={u} size={36} />
        <div className="min-w-0 flex-1 pt-0.5 text-[13.5px] leading-snug">{n.text}</div>
        <button onClick={() => dismiss(n.id)} className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-ink/40 hover:bg-sage-100" aria-label="Dismiss"><X size={16} /></button>
      </div>
      <div className="mt-2 flex gap-2 pl-12">
        <button onClick={go} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${n.action === 'coffee' ? 'bg-coffee-500 text-cream' : 'bg-vine-700 text-cream'}`}>
          {n.action === 'coffee' ? <><Coffee size={14} /> Propose coffee</> : <><MessageCircle size={14} /> Message</>}
        </button>
        <button onClick={() => dismiss(n.id)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink/50 hover:bg-sage-100">Not now</button>
      </div>
    </motion.div>
  )
}

export default function Network() {
  const s = useKudzu()
  const now = useNow()
  const [view, setView] = useState<'list' | 'map'>('list')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'strength' | 'recent' | 'name'>('strength')
  const [mode, setMode] = useState<Mode | null>(null)

  const people = useMemo<MapPerson[]>(
    () =>
      schoolConnections(s)
        .map((c) => ({ user: getUser(c.otherId)!, ...strengthOf(c, now) }))
        .filter((p) => p.user),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.connections, s.schoolId, s.blocked, s.timeOffsetDays],
  )
  const nudges = computeNudges(s, now).slice(0, 3)
  const counts = STRENGTH_ORDER.map((l) => [l, people.filter((p) => p.level === l).length] as [Strength, number])

  const filtered = people.filter((p) => {
    const t = q.trim().toLowerCase()
    if (mode && matchInfo(s.me, p.user).mode !== mode) return false
    return !t || [p.user.name, p.user.company, p.user.city, p.user.industry, p.user.title].some((f) => f?.toLowerCase().includes(t))
  })
  const sorted = [...filtered].sort((a, b) => (sort === 'name' ? a.user.name.localeCompare(b.user.name) : a.days - b.days))

  const row = (p: MapPerson) => (
    <Link key={p.user.id} to={`/network/${p.user.id}`} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-sage-50">
      <Avatar user={p.user} size={46} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{p.user.name}</div>
        <div className="truncate text-[13px] text-ink/55">{roleLine(p.user)}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink/45">
          <ModeTag mode={matchInfo(s.me, p.user).mode} /> {p.user.city} · {p.days === 0 ? 'today' : `${p.days}d ago`}
        </div>
      </div>
      <LeafIcon level={p.level} size={22} />
    </Link>
  )

  return (
    <div className="flex h-full flex-col">
      <header className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold">Network</h1>
          <div className="flex items-center gap-2">
            <SchoolChip />
            <div className="flex rounded-full bg-sage-100 p-0.5">
              {([['list', List], ['map', MapIcon]] as const).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${view === v ? 'bg-white text-vine-700 shadow-sm' : 'text-ink/50'}`} aria-pressed={view === v}>
                  <Icon size={14} /> {v}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 flex gap-3 text-xs text-ink/60">
          {counts.map(([l, n]) => (
            <span key={l} className="flex items-center gap-1"><LeafIcon level={l} size={14} /> <b className="text-ink">{n}</b> {STRENGTH_META[l].label.toLowerCase()}</span>
          ))}
        </div>
      </header>

      {people.length === 0 ? (
        <EmptyState title="Your network starts here" body="People you match with appear here, and each connection grows the more you keep in touch.">
          <Link to="/meet" className="inline-flex rounded-full bg-vine-700 px-5 py-3 text-sm font-semibold text-cream">Meet people</Link>
        </EmptyState>
      ) : view === 'map' ? (
        <div className="min-h-0 flex-1 px-3 pb-3">
          <div className="h-full overflow-hidden rounded-3xl ring-1 ring-sage-200">
            <NetworkMap me={s.me} people={people} />
          </div>
        </div>
      ) : (
        <div className="app-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {nudges.length > 0 && (
            <div className="mb-4 space-y-2 px-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink/50">Nudges</div>
              <AnimatePresence initial={false}>{nudges.map((n) => <NudgeCard key={n.id} n={n} />)}</AnimatePresence>
            </div>
          )}

          <div className="flex items-center gap-2 px-1">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <input className={`${inputCls} !rounded-full pl-9`} placeholder="Search name, company, city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search connections" />
            </div>
            <select className="rounded-full border border-sage-200 bg-white px-3 py-2.5 text-xs font-semibold" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
              <option value="strength">By strength</option>
              <option value="recent">Most recent</option>
              <option value="name">A–Z</option>
            </select>
          </div>

          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-1">
            <Chip tone="plain" active={!mode} onClick={() => setMode(null)}>Everyone</Chip>
            {MODES.map((m) => (
              <Chip key={m} tone="plain" active={mode === m} onClick={() => setMode(mode === m ? null : m)}>
                <ModeIcon mode={m} size={13} /> {MODE_META[m].tag}
              </Chip>
            ))}
          </div>

          {sorted.length === 0 && <p className="py-10 text-center text-sm text-ink/50">{q.trim() ? `No connections match “${q}”.` : 'No one here yet.'}</p>}

          {sort === 'strength'
            ? STRENGTH_ORDER.map((level) => {
                const group = sorted.filter((p) => p.level === level)
                if (!group.length) return null
                return (
                  <section key={level} className="mt-4">
                    <div className="flex items-center gap-2 px-2 pb-1">
                      <LeafIcon level={level} size={16} />
                      <span className="text-sm font-semibold" style={{ color: STRENGTH_META[level].color }}>{STRENGTH_META[level].label}</span>
                      <span className="text-xs text-ink/45">{STRENGTH_META[level].hint}</span>
                    </div>
                    {group.map(row)}
                  </section>
                )
              })
            : <div className="mt-3">{sorted.map(row)}</div>}
        </div>
      )}
    </div>
  )
}
