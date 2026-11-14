import { useMemo, useState } from 'react'
import { CheckCheck, ChevronRight, HandHeart, MessageCircle, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { STRENGTH_META, topicLabel } from '../config/brand'
import { useKudzu, useNow } from '../store/useKudzu'
import { EMPTY_QUERY, answerRequest, computeNudges, findPeople, getUser, incomingRequests, strengthOf, webConnections } from '../services'
import { firstName } from '../lib/util'
import { LeafIcon, Logo } from '../components/brand'
import { Avatar, SchoolChip, Toggle, inputCls } from '../components/ui'
import { roleLine } from '../components/ProfileView'
import { ProfilePopup } from '../components/ProfilePopup'
import { CatchUpSheet } from '../components/CatchUpSheet'

/** "3 weeks", "5 months": how long since two people last talked, in plain words. */
const since = (days: number) => (days < 14 ? 'recently' : days < 60 ? `${Math.round(days / 7)} weeks ago` : days < 365 ? `${Math.round(days / 30)} months ago` : 'over a year ago')

/**
 * The simple app's one screen. It is for people who are not looking to grow a
 * network: they want to keep the one they have, and perhaps help someone younger.
 * So there is no search of the whole school, no events and no map. Three lists:
 *   1. who to catch up with now
 *   2. everyone you know, the ones going quiet first
 *   3. people you could help, only if you switch it on
 */
export default function Home() {
  const s = useKudzu()
  const now = useNow()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  // the person a catch-up is being logged for, and the reminder it answers
  const [caught, setCaught] = useState<{ id: string; nudge: string } | null>(null)
  const [lastCaught, setLastCaught] = useState<string | null>(null)
  if (caught && caught.id !== lastCaught) setLastCaught(caught.id)
  const caughtUser = getUser(caught?.id ?? lastCaught ?? '') // kept while the sheet slides shut

  const nudges = computeNudges(s, now).filter((n) => !s.dismissedNudges.includes(n.id)).slice(0, 3)
  const people = useMemo(
    () =>
      webConnections(s)
        .map((c) => ({ user: getUser(c.otherId)!, ...strengthOf(c, now) }))
        .filter((p) => p.user)
        // the ones you have not talked to for longest come first
        .sort((a, b) => b.days - a.days),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.connections, s.schoolId, s.blocked, now],
  )
  const term = q.trim().toLowerCase()
  const shown = term ? people.filter((p) => [p.user.name, p.user.company, p.user.city].filter(Boolean).join(' ').toLowerCase().includes(term)) : people
  const asking = incomingRequests(s, now)
  // people whose asks meet what the user offers, and who are not yet connected
  const couldHelp = useMemo(
    () => (s.openToHelp ? findPeople(s, EMPTY_QUERY).filter((f) => f.info.mode === 'give' && !f.connected && !asking.some((r) => r.fromId === f.user.id)).slice(0, 3) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.openToHelp, s.me, s.schoolId, s.connections, s.blocked, s.requests],
  )
  const h2 = 'mb-2 font-display text-xl font-semibold'

  return (
    <div className="app-scroll h-full overflow-y-auto pb-10">
      <header className="flex items-center justify-between px-4 pb-1 pt-4">
        <Logo />
        <SchoolChip />
      </header>

      <div className="px-4">
        <h1 className="mt-2 font-display text-[28px] font-semibold leading-tight">Hello, {firstName(s.me.name)}</h1>
        <p className="mt-0.5 text-[15px] text-ink/60">
          {people.length} {people.length === 1 ? 'person' : 'people'} in your network. <Link to="/network" className="font-semibold text-vine-700 underline underline-offset-4">See them on the map</Link>
        </p>

        {/* 1. who to catch up with */}
        <section className="mt-6">
          <h2 className={h2}>Catch up with</h2>
          {nudges.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-[15px] text-ink/55">You’re up to date with everyone.</p>
          ) : (
            <div className="space-y-2.5">
              {nudges.map((n) => {
                const u = getUser(n.otherId)
                if (!u) return null
                return (
                  <div key={n.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sage-200">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} size={48} />
                      <p className="flex-1 text-[15px] leading-snug">{n.text}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => { s.dismissNudge(n.id); nav(`/messages/${u.id}?draft=${encodeURIComponent(n.draft ?? `Hi ${firstName(u.name)}, it’s been a while. How are you?`)}`) }} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-vine-700 py-3 text-[15px] font-semibold text-cream">
                        <MessageCircle size={18} /> Write to {firstName(u.name)}
                      </button>
                      <button onClick={() => s.dismissNudge(n.id)} className="rounded-full px-4 py-3 text-[15px] font-semibold text-ink/50">Not now</button>
                    </div>
                    {/* already spoke, by phone or over lunch: say so and the reminder goes away */}
                    <button onClick={() => setCaught({ id: u.id, nudge: n.id })} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-vine-200 bg-vine-50 py-2.5 text-[14px] font-semibold text-vine-800">
                      <CheckCheck size={17} /> We already caught up
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* 3. people you could help: shown only if the user wants it */}
        <section className="mt-7">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Help someone out</h2>
            <Toggle on={s.openToHelp} onChange={(openToHelp) => s.set({ openToHelp })} label="Show people I could help" />
          </div>
          {!s.openToHelp ? (
            <p className="text-[15px] text-ink/55">Off. Switch it on to see students and recent graduates you could help.</p>
          ) : (
            <div className="space-y-2.5">
              {asking.map((r) => {
                const u = getUser(r.fromId)
                if (!u) return null
                return (
                  <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sage-200">
                    <button onClick={() => setPicked(u.id)} className="flex w-full items-center gap-3 text-left">
                      <Avatar user={u} size={48} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-semibold">{u.name} asked you</span>
                        <span className="block truncate text-[13px] text-ink/55">{roleLine(u)} · Class of {u.gradYear}</span>
                      </span>
                    </button>
                    <p className="mt-2 text-[15px] leading-snug text-ink/80">“{r.note}”</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button onClick={() => { answerRequest(r.id, 'accept'); nav(`/messages/${u.id}`) }} className="rounded-full bg-vine-700 py-3 text-[14px] font-semibold text-cream">Yes</button>
                      <button onClick={() => answerRequest(r.id, 'later')} className="rounded-full border border-vine-700 py-3 text-[14px] font-semibold text-vine-700">Later</button>
                      <button onClick={() => answerRequest(r.id, 'decline')} className="rounded-full border border-coffee-200 bg-coffee-100 py-3 text-[14px] font-semibold text-coffee-700">No</button>
                    </div>
                  </div>
                )
              })}
              {couldHelp.map((f) => (
                <button key={f.user.id} onClick={() => setPicked(f.user.id)} className="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-sage-200">
                  <Avatar user={f.user} size={48} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-semibold">{f.user.name}</span>
                    <span className="block truncate text-[13px] text-ink/55">{roleLine(f.user)} · Class of {f.user.gradYear}</span>
                    <span className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-coffee-600"><HandHeart size={14} className="shrink-0" /> Looking for {topicLabel(f.info.topics[0] ?? f.user.asks[0] ?? 'industry').toLowerCase()}</span>
                  </span>
                  <ChevronRight size={20} className="shrink-0 text-ink/30" />
                </button>
              ))}
              {asking.length + couldHelp.length === 0 && <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-[15px] text-ink/55">Nobody is asking right now.</p>}
            </div>
          )}
        </section>

        {/* 2. everyone you know */}
        <section className="mt-7">
          <h2 className={h2}>Your people</h2>
          <div className="relative mb-2">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input className={`${inputCls} !rounded-full !py-3 pl-11 !text-[15px]`} placeholder="Find someone you know" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find someone you know" />
          </div>
          {shown.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-[15px] text-ink/55">{term ? `Nobody you know matches “${q.trim()}”.` : 'Nobody here yet.'}</p>
          ) : (
            <div className="divide-y divide-sage-200 rounded-2xl bg-white ring-1 ring-sage-200">
              {shown.map((p) => (
                <Link key={p.user.id} to={`/network/${p.user.id}`} className="flex items-center gap-3 px-3.5 py-3.5">
                  <Avatar user={p.user} size={48} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[16px] font-semibold">{p.user.name}</span>
                    <span className="block truncate text-[13px] text-ink/55">{roleLine(p.user)}</span>
                    <span className="flex items-center gap-1 text-[13px]" style={{ color: STRENGTH_META[p.level].color }}><LeafIcon level={p.level} size={14} /> Last talked {since(p.days)}</span>
                  </span>
                  <ChevronRight size={20} className="shrink-0 text-ink/30" />
                </Link>
              ))}
            </div>
          )}
          <Link to="/known" className="mt-3 block rounded-full border border-sage-200 bg-white py-3 text-center text-[15px] font-semibold text-vine-800">Add someone you know</Link>
        </section>
      </div>

      <ProfilePopup userId={picked} onClose={() => setPicked(null)} />
      {caughtUser && <CatchUpSheet user={caughtUser} open={!!caught} onClose={() => setCaught(null)} onLogged={() => caught && s.dismissNudge(caught.nudge)} />}
    </div>
  )
}
