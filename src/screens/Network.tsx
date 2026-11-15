import { useMemo, useState } from 'react'
import { ChevronRight, List, Map as MapIcon, Repeat, Search, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Mode, Strength } from '../types'
import { MODES, MODE_META, STRENGTH_META, STRENGTH_ORDER } from '../config/brand'
import { useKudzu, useNow } from '../store/useKudzu'
import { getUser, matchInfo, rhythmLabel, strengthOf, suggestKnown, webConnections } from '../services'
import { LeafIcon } from '../components/brand'
import { AwaitingTag, KnownAsks } from '../components/KnownAsks'
import { Avatar, Chip, EmptyState, SchoolChip, inputCls } from '../components/ui'
import { ModeIcon, ModeTag, roleLine } from '../components/ProfileView'
import NetworkMap, { type MapPerson } from '../components/NetworkMap'
type Person = MapPerson & { rhythmDays?: number; unconfirmed?: boolean }
/** The keep-in-touch app has no search of the school, so links to it are left out. */
const simpleApp = () => useKudzu.getState().experience === 'simple'

export default function Network() {
  const s = useKudzu()
  const now = useNow()
  // the map is the signature view, so the tab opens on it
  const [view, setView] = useState<'list' | 'map'>('map')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'strength' | 'recent' | 'name'>('strength')
  const [mode, setMode] = useState<Mode | null>(null)

  // the web: only people there has been a real exchange with
  const people = useMemo<Person[]>(
    () =>
      webConnections(s)
        .map((c) => ({ user: getUser(c.otherId)!, ...strengthOf(c, now), rhythmDays: c.rhythmDays, unconfirmed: c.unconfirmed }))
        .filter((p) => p.user),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.connections, s.schoolId, s.blocked, s.timeOffsetDays],
  )
  const suggestionCount = suggestKnown(s).length
  const counts = STRENGTH_ORDER.map((l) => [l, people.filter((p) => p.level === l).length] as [Strength, number])


  const filtered = people.filter((p) => {
    const t = q.trim().toLowerCase()
    if (mode && matchInfo(s.me, p.user).mode !== mode) return false
    return !t || [p.user.name, p.user.company, p.user.city, p.user.industry, p.user.title].some((f) => f?.toLowerCase().includes(t))
  })
  const sorted = [...filtered].sort((a, b) => (sort === 'name' ? a.user.name.localeCompare(b.user.name) : a.days - b.days))

  const row = (p: Person) => (
    <Link key={p.user.id} to={`/network/${p.user.id}`} data-tour={p.level === "fading" ? "person-quiet" : "person"} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-sage-50">
      <Avatar user={p.user} size={46} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><span className="truncate font-semibold">{p.user.name}</span>{p.unconfirmed && <AwaitingTag />}</div>
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
                <button key={v} onClick={() => setView(v)} data-tour={`view-${v}`} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${view === v ? 'bg-white text-vine-700 shadow-sm' : 'text-ink/50'}`} aria-pressed={view === v}>
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
            <NetworkMap me={s.me} people={people} />
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

          {/* adding someone you know starts here, beside the people it adds to */}
          {!q.trim() && !mode && (
            <Link to="/known" data-tour="network-add" className="mb-2 flex items-center gap-3 rounded-2xl border border-dashed border-vine-300 bg-vine-50 px-3.5 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-vine-700 text-cream"><UserPlus size={17} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">Add people you know</span>
                <span className="block truncate text-xs text-ink/55">{suggestionCount > 0 ? `${suggestionCount} classmates and contacts you may know` : "Search your school by name"}</span>
              </span>
              <ChevronRight size={18} className="text-ink/30" />
            </Link>
          )}
          {!q.trim() && !mode && <KnownAsks />}
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
