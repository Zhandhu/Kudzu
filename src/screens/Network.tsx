import { useCallback, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Coffee, GraduationCap, List, Map as MapIcon, MapPin, MessageCircle, Repeat, Search, UserPlus, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Mode, Nudge, Strength, User } from '../types'
import { MODES, MODE_META, STRENGTH_META, STRENGTH_ORDER } from '../config/brand'
import { useKudzu, useNow } from '../store/useKudzu'
import { cityCohort, classCohort, classLabel, computeNudges, getSchool, getUser, matchInfo, rhythmLabel, strengthOf, suggestKnown, unreadAnnouncements, webConnections } from '../services'
import { AnnouncementList } from '../components/Announcements'
import { LeafIcon } from '../components/brand'
import { Avatar, Chip, EmptyState, SchoolChip, Sheet, inputCls } from '../components/ui'
import { ModeIcon, ModeTag, roleLine } from '../components/ProfileView'
import NetworkMap, { type MapPerson } from '../components/NetworkMap'
import { LeafSprig, type LeafItem, type LeafKey } from '../components/NetworkLeaves'

function NudgeCard({ n }: { n: Nudge }) {
  const nav = useNavigate()
  const dismiss = useKudzu((s) => s.dismissNudge)
  const u = getUser(n.otherId)
  if (!u) return null
  const go = () => {
    dismiss(n.id)
    nav(n.action === 'coffee' ? `/messages/${u.id}?coffee=1` : `/messages/${u.id}?draft=${encodeURIComponent(n.draft ?? '')}`)
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

type Person = MapPerson & { rhythmDays?: number }
/** The keep-in-touch app has no search of the school, so links to it are left out. */
const simpleApp = () => useKudzu.getState().experience === 'simple'

/** One of the automatic slices of your school: your class, or your city. */
function CohortCard({ to, icon: Icon, title, people, connected }: { to: string; icon: typeof MapPin; title: string; people: User[]; connected: Set<string> }) {
  const known = people.filter((u) => connected.has(u.id)).length
  return (
    <Link to={to} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-sage-200">
      <div className="flex items-center gap-1.5 text-[13px] font-semibold leading-tight"><Icon size={15} className="shrink-0 text-coffee-500" /> <span className="truncate">{title}</span></div>
      <div className="mt-2 flex -space-x-2">{people.slice(0, 5).map((u) => <Avatar key={u.id} user={u} size={26} ring />)}</div>
      <div className="mt-1.5 text-[11px] text-ink/55">{people.length} {people.length === 1 ? 'person' : 'people'} · {known} in your network</div>
    </Link>
  )
}

export default function Network() {
  const s = useKudzu()
  const now = useNow()
  // the map is the signature view, so the tab opens on it
  const [view, setView] = useState<'list' | 'map'>('map')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'strength' | 'recent' | 'name'>('strength')
  const [mode, setMode] = useState<Mode | null>(null)
  const [open, setOpen] = useState<LeafKey | null>(null)
  const [mapBusy, setMapBusy] = useState(false)
  const onSelection = useCallback((isOpen: boolean) => setMapBusy(isOpen), [])

  // the web: only people there has been a real exchange with
  const people = useMemo<Person[]>(
    () =>
      webConnections(s)
        .map((c) => ({ user: getUser(c.otherId)!, ...strengthOf(c, now), rhythmDays: c.rhythmDays }))
        .filter((p) => p.user),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.connections, s.schoolId, s.blocked, s.timeOffsetDays],
  )
  const nudges = computeNudges(s, now)
  const connectedIds = new Set(people.map((p) => p.user.id))
  const classmates = classCohort(s)
  const neighbours = cityCohort(s, s.me.city)
  const suggestionCount = suggestKnown(s).length
  const news = unreadAnnouncements(s, now)
  const counts = STRENGTH_ORDER.map((l) => [l, people.filter((p) => p.level === l).length] as [Strength, number])

  // The page opens on the network. Everything else sits behind two leaves.
  // (People you have connected with but not yet met live on the Find tab.)
  const leaves: LeafItem[] = [
    { key: 'reach', label: 'Reach out', count: nudges.length, onClick: () => setOpen('reach') },
    // the lighter leaf carries news from your class and city: its blossom counts what you have not seen
    { key: 'grow', label: 'Your class and city', count: news.length, onClick: () => setOpen('grow') },
  ]
  // seen once the sheet is closed, so "New" stays visible while you read
  const closeGrow = () => { s.markAnnouncementsRead(news.map((a) => a.id)); setOpen(null) }

  const filtered = people.filter((p) => {
    const t = q.trim().toLowerCase()
    if (mode && matchInfo(s.me, p.user).mode !== mode) return false
    return !t || [p.user.name, p.user.company, p.user.city, p.user.industry, p.user.title].some((f) => f?.toLowerCase().includes(t))
  })
  const sorted = [...filtered].sort((a, b) => (sort === 'name' ? a.user.name.localeCompare(b.user.name) : a.days - b.days))

  const row = (p: Person) => (
    <Link key={p.user.id} to={`/network/${p.user.id}`} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-sage-50">
      <Avatar user={p.user} size={46} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{p.user.name}</div>
        <div className="truncate text-[13px] text-ink/55">{roleLine(p.user)}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-ink/45">
          <ModeTag mode={matchInfo(s.me, p.user).mode} />
          {p.rhythmDays && <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap font-semibold text-vine-700"><Repeat size={11} /> {rhythmLabel(p.rhythmDays)}</span>}
          <span className="truncate">{p.user.city} · {p.days === 0 ? 'today' : `${p.days}d ago`}</span>
        </div>
      </div>
      <LeafIcon level={p.level} size={22} />
    </Link>
  )

  const empty = people.length === 0

  return (
    <div className="relative flex h-full flex-col">
      <header className="px-4 pb-2 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold">{simpleApp() ? 'Your map' : 'Network'}</h1>
          <div className="flex items-center gap-2">
            <SchoolChip />
            <div className="flex rounded-full bg-sage-100 p-0.5">
              {([['map', MapIcon], ['list', List]] as const).map(([v, Icon]) => (
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

      {empty ? (
        <EmptyState title="Your network starts here" body="Add the people you already know, and meet new ones. Each connection grows the more you keep in touch.">
          <div className="flex flex-col gap-2">
            <Link to="/known" className="inline-flex justify-center rounded-full bg-vine-700 px-5 py-3 text-sm font-semibold text-cream">Add people you know</Link>
            <Link to="/find" className={simpleApp() ? "hidden" : "inline-flex justify-center rounded-full border border-sage-200 bg-white px-5 py-3 text-sm font-semibold text-vine-800"}>Find new people</Link>
          </div>
        </EmptyState>
      ) : view === 'map' ? (
        <div className="min-h-0 flex-1 border-t border-sage-200">
          <div className="h-full">
            <NetworkMap me={s.me} people={people} onSelection={onSelection} />
          </div>
        </div>
      ) : (
        <div className="app-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-28">
          <div className="flex items-center gap-2 px-1 pt-1">
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

          {sorted.length === 0 && (
            <p className="py-10 text-center text-sm text-ink/50">
              {q.trim() ? `No connections match “${q}”.` : people.length === 0 ? 'Nobody in your web yet. Have a first coffee chat, or add people you already know.' : 'No one here yet.'}
            </p>
          )}

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

      {!empty && !(view === 'map' && mapBusy) && <LeafSprig items={leaves} />}

      <Sheet open={open === 'reach'} onClose={() => setOpen(null)} title="Reach out">
        {nudges.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink/55">You’re all caught up. Nobody is waiting to hear from you.</p>
        ) : (
          <div className="space-y-2">
            <p className="mb-1 text-[13px] text-ink/60">Catch-ups you planned come first, then timely reasons to say hello, then ties that have gone quiet.</p>
            <AnimatePresence initial={false}>{nudges.map((n) => <NudgeCard key={n.id} n={n} />)}</AnimatePresence>
          </div>
        )}
      </Sheet>

      <Sheet open={open === 'grow'} onClose={closeGrow} title="Your class and city">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Announcements</div>
        <AnnouncementList onLeave={closeGrow} />
        <div className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink/50">Your cohorts</div>
        <div className="grid grid-cols-2 gap-2">
          <CohortCard to="/cohorts/class" icon={GraduationCap} title={classLabel(s.me)} people={classmates} connected={connectedIds} />
          <CohortCard to="/cohorts/city" icon={MapPin} title={`${getSchool(s.schoolId).shortName} in ${s.me.city}`} people={neighbours} connected={connectedIds} />
        </div>
        <Link to="/known" className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-vine-300 bg-vine-50 px-3.5 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vine-700 text-cream"><UserPlus size={17} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Add people you know</span>
            <span className="block truncate text-xs text-ink/55">{suggestionCount > 0 ? `${suggestionCount} classmates and contacts you may know` : 'Search your school by name'}</span>
          </span>
          <ChevronRight size={18} className="text-ink/30" />
        </Link>
        <Link to="/find" className={simpleApp() ? "hidden" : "mt-2 flex items-center gap-3 rounded-2xl border border-sage-200 bg-white px-3.5 py-3"}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coffee-100 text-coffee-600"><Search size={17} /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Find someone new</span>
            <span className="block truncate text-xs text-ink/55">Search by field, city, level or name</span>
          </span>
          <ChevronRight size={18} className="text-ink/30" />
        </Link>
      </Sheet>
    </div>
  )
}
