import { useMemo, useState } from 'react'
import { CheckCheck, ChevronDown, ChevronRight, HandHeart, MessageCircle, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { STRENGTH_META, topicLabel } from '../config/brand'
import { useKudzu, useNow } from '../store/useKudzu'
import { EMPTY_QUERY, answerRequest, computeNudges, findPeople, getUser, incomingRequests, strengthOf, webConnections } from '../services'
import { firstName } from '../lib/util'
import { LeafIcon, Logo } from '../components/brand'
import { Face, SchoolChip, Toggle, inputCls } from '../components/ui'
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
  // which of the two top buttons is open, if either
  const [panel, setPanel] = useState<'catch' | 'help' | null>(null)
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

        {/* Two buttons side by side. Each opens its list below the pair, and closes again,
            so the people you know are on screen as soon as the app opens. */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {([
            ['catch', 'Catch up', nudges.length, nudges.length === 0 ? 'All up to date' : `${nudges.length} to write to`, MessageCircle],
            ['help', 'Help out', s.openToHelp ? asking.length + couldHelp.length : 0, !s.openToHelp ? 'Switched off' : asking.length ? `${asking.length} asked you` : couldHelp.length ? `${couldHelp.length} you could help` : 'Nobody asking', HandHeart],
          ] as const).map(([id, label, count, sub, Icon]) => {
            const on = panel === id
            // With helping switched off there is nothing to open, so the tile is the switch
            // itself. Turning it on opens the list, so you see what you switched on.
            if (id === 'help' && !s.openToHelp) {
              return (
                <button key={id} data-tour="home-help" role="switch" aria-checked={false} aria-label="Turn on helping" onClick={() => { s.set({ openToHelp: true }); setPanel('help') }} className="relative rounded-2xl border-2 border-dashed border-sage-300 bg-white/60 p-3.5 text-left">
                  <span className="flex items-center justify-between">
                    <Icon size={22} className="text-ink/35" />
                    <span className="relative h-7 w-12 shrink-0 rounded-full bg-sage-300" aria-hidden><span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow" /></span>
                  </span>
                  <span className="mt-2 block font-display text-[19px] font-semibold leading-tight text-ink/60">{label}</span>
                  <span className="block text-[13px] text-ink/50">Off. Tap to turn on</span>
                </button>
              )
            }
            return (
              <button key={id} data-tour={`home-${id}`} onClick={() => setPanel(on ? null : id)} aria-expanded={on} aria-label={`${label}, ${sub}`} className={`relative rounded-2xl border-2 p-3.5 text-left transition-colors ${on ? 'border-vine-700 bg-vine-700 text-cream' : 'border-sage-200 bg-white'}`}>
                <span className="flex items-center justify-between">
                  <Icon size={22} className={on ? 'text-cream' : 'text-vine-700'} />
                  <span className="flex items-center gap-1.5">
                    {count > 0 && <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[13px] font-bold ${on ? 'bg-cream text-vine-800' : 'bg-coffee-500 text-cream'}`}>{count}</span>}
                    <ChevronDown size={18} className={`transition-transform ${on ? 'rotate-180' : 'text-ink/35'}`} />
                  </span>
                </span>
                <span className="mt-2 block font-display text-[19px] font-semibold leading-tight">{label}</span>
                <span className={`block text-[13px] ${on ? 'text-vine-100' : 'text-ink/55'}`}>{sub}</span>
              </button>
            )
          })}
        </div>

        {/* 1. who to catch up with */}
        <AnimatePresence initial={false}>
        {panel === 'catch' && (
        <motion.section key="catch" className="overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }}>
          <div className="h-3" />
          {nudges.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-[15px] text-ink/55">You’re up to date with everyone.</p>
          ) : (
            <div className="space-y-2.5">
              {nudges.map((n) => {
                const u = getUser(n.otherId)
                if (!u) return null
                return (
                  <div key={n.id} data-tour="home-nudge" className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sage-200">
                    <div className="flex items-center gap-3">
                      <Face user={u} size={48} />
                      <p className="flex-1 text-[15px] leading-snug">{n.text}</p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => { s.dismissNudge(n.id); nav(`/messages/${u.id}?draft=${encodeURIComponent(n.draft ?? `Hi ${firstName(u.name)}, it’s been a while. How are you?`)}`) }} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-vine-700 py-3 text-[15px] font-semibold text-cream">
                        <MessageCircle size={18} /> Write to {firstName(u.name)}
                      </button>
                      <button onClick={() => s.dismissNudge(n.id)} className="rounded-full px-4 py-3 text-[15px] font-semibold text-ink/50">Not now</button>
                    </div>
                    {/* already spoke, by phone or over lunch: say so and the reminder goes away */}
                    <button data-tour="home-caught" onClick={() => setCaught({ id: u.id, nudge: n.id })} className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-vine-200 bg-vine-50 py-2.5 text-[14px] font-semibold text-vine-800">
                      <CheckCheck size={17} /> We already caught up
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </motion.section>
        )}

        {/* 3. people you could help: shown only if the user wants it */}
        {panel === 'help' && (
        <motion.section key="help" data-tour="home-help-list" className="overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }}>
          <div className="mb-2 mt-3 flex items-center justify-between gap-3 rounded-2xl bg-sage-100 px-3.5 py-2.5">
            <span className="text-[14px] font-medium">Show people I could help</span>
            <span data-tour="home-help-switch" className="flex"><Toggle on={s.openToHelp} onChange={(openToHelp) => { s.set({ openToHelp }); if (!openToHelp) setPanel(null) }} label="Show people I could help" /></span>
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
                      <Face user={u} size={48} />
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
                  <Face user={f.user} size={48} />
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
        </motion.section>
        )}
        </AnimatePresence>

        {/* 2. everyone you know */}
        <section className="mt-6">
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
                <Link key={p.user.id} data-tour="home-person" to={`/network/${p.user.id}`} className="flex items-center gap-3 px-3.5 py-3.5">
                  <Face user={p.user} size={48} />
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
          <Link to="/known" data-tour="home-add" className="mt-3 block rounded-full border border-sage-200 bg-white py-3 text-center text-[15px] font-semibold text-vine-800">Add someone you know</Link>
        </section>
      </div>

      <ProfilePopup userId={picked} onClose={() => setPicked(null)} />
      {caughtUser && <CatchUpSheet user={caughtUser} open={!!caught} onClose={() => setCaught(null)} onLogged={() => caught && s.dismissNudge(caught.nudge)} />}
    </div>
  )
}
