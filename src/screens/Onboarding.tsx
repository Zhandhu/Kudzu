import { useState, type ReactNode } from 'react'
import { BadgeCheck, Check, ChevronLeft, ChevronRight, Clock, GraduationCap, LayoutList, Leaf, Mail, Phone, Search, Star, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Degree, Prefs, School, User } from '../types'
import { CURRENT_CLASS_YEAR, DEGREE_LEVELS, TAGLINE } from '../config/brand'
import { useKudzu } from '../store/useKudzu'
import { getSchool, listSchools, schoolForEmail, schoolUsers, suggestKnown } from '../services'
import { CITIES } from '../lib/util'
import { Logo, Tendril } from '../components/brand'
import { Avatar, Button, Field, Sheet, inputCls } from '../components/ui'
import { roleLine } from '../components/ProfileView'
import { PrefsForm } from '../components/PrefsForm'
import { AsksOffersFields, CapacityField, InterestsField, PathEditor, PromptEditor, WorkFields } from '../components/ProfileEditor'

/**
 * Sign-up is one menu, not a queue of screens. Three sections are needed and the
 * rest can wait: each is a row whose box fills in once it is done, in any order.
 */
type SectionId = 'school' | 'find' | 'known' | 'here' | 'work' | 'interests' | 'prompts'

const SECTIONS: { id: SectionId; title: string; hint: string; needed: boolean }[] = [
  { id: 'school', title: 'You and your school', hint: 'Your name and where you studied', needed: true },
  { id: 'work', title: 'Your current career', hint: 'Your role and where you work. Add your path if you like', needed: true },
  { id: 'known', title: 'People you already know', hint: 'Start with a network, and bring people in', needed: true },
  { id: 'here', title: 'What you’re here for', hint: 'What you’re looking for and what you can offer', needed: false },
  { id: 'find', title: 'Fields you’re interested in', hint: 'Puts those people first. Skip it to see everyone', needed: false },
  { id: 'interests', title: 'Hobbies, clubs and affiliations', hint: 'Common ground beyond work', needed: false },
  { id: 'prompts', title: 'Prompts', hint: 'Up to three short answers people can reply to', needed: false },
]

const blank: User = {
  id: 'me', schoolIds: [], role: 'student', gradYear: 2028, name: '', major: '', title: '', company: undefined,
  industry: 'Tech', city: 'Atlanta', coords: CITIES.Atlanta, asks: [], offers: [], prompts: [], capacity: 4, used: 0, groupIds: [], verified: 'verified',
  degrees: [], path: [], interests: [],
}
const NO_PREFS: Prefs = { industries: [], cities: [], levels: [] }

/** A username for search. Seed people have none, so it is made from the name. */
const handleOf = (u: User) => '@' + u.name.toLowerCase().replace(/[^a-z]/g, '')
const short = (y: number) => `’${String(y).slice(2)}`

/** The box at the start of a row. It fills in when the section is done. */
function DoneBox({ done }: { done: boolean }) {
  return (
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${done ? 'border-vine-700 bg-vine-700 text-cream' : 'border-sage-300 bg-white text-transparent'}`} aria-hidden>
      <Check size={15} strokeWidth={3} />
    </span>
  )
}

export default function Onboarding() {
  const nav = useNavigate()
  const s = useKudzu()
  const [started, setStarted] = useState(false)
  const [open, setOpen] = useState<SectionId | null>(null)
  const [me, setMe] = useState<User>(blank)
  const [prefs, setPrefs] = useState<Prefs>(NO_PREFS)
  const [email, setEmail] = useState('')
  const [alumPath, setAlumPath] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState('')
  const [known, setKnown] = useState<string[]>([])
  const [invites, setInvites] = useState<string[]>([])
  const [nobody, setNobody] = useState(false)
  const [who, setWho] = useState('')
  const [phone, setPhone] = useState('')
  const [view, setView] = useState<'leaves' | 'rows'>('leaves')
  const up = (patch: Partial<User>) => setMe((m) => ({ ...m, ...patch }))

  const degrees = me.degrees ?? []
  const home = degrees[0] // the default network is always first
  const homeSchool = home ? getSchool(home.schoolId) : null
  const suggested = schoolForEmail(email)
  const role = home && home.gradYear < CURRENT_CLASS_YEAR ? 'alum' : 'student'

  const setDegrees = (next: Degree[]) => up({ degrees: next })
  const toggleSchool = (sc: School) => {
    if (degrees.some((d) => d.schoolId === sc.id)) return setDegrees(degrees.filter((d) => d.schoolId !== sc.id))
    setDegrees([...degrees, { schoolId: sc.id, level: degrees.length ? 'Master’s' : 'Bachelor’s', major: '', gradYear: 2028 }])
    if (!degrees.length && CITIES[sc.city]) up({ city: sc.city })
  }
  const setDegree = (id: string, patch: Partial<Degree>) => setDegrees(degrees.map((d) => (d.schoolId === id ? { ...d, ...patch } : d)))
  const makeDefault = (id: string) => setDegrees([degrees.find((d) => d.schoolId === id)!, ...degrees.filter((d) => d.schoolId !== id)])

  const filledPrompts = me.prompts.filter((p) => p.promptId && p.answer.trim())
  const filledPath = (me.path ?? []).filter((p) => p.title.trim())
  const hereEmpty = me.asks.length + me.offers.length === 0
  const hereFull = me.asks.length >= 2 && me.offers.length >= 2

  const done: Record<SectionId, boolean> = {
    school: !!me.name.trim() && degrees.length > 0,
    find: prefs.industries.length > 0,
    known: known.length + invites.length > 0 || nobody,
    here: hereFull,
    work: !!me.title?.trim(), // the role is the part that is needed; the path and the flag are extras
    interests: (me.interests ?? []).length > 0,
    prompts: filledPrompts.length > 0,
  }
  const needed = SECTIONS.filter((x) => x.needed)
  const neededDone = needed.filter((x) => done[x.id]).length
  // "what you're here for" can be left for later, but not left half done
  const canFinish = neededDone === needed.length && (hereEmpty || hereFull)

  const summary: Record<SectionId, string> = {
    school: degrees.length ? `${me.name.trim() || 'Add your name'} · ${degrees.map((d) => `${getSchool(d.schoolId).shortName} ${short(d.gradYear)}`).join(', ')}` : '',
    find: prefs.industries.join(', '),
    known: nobody && !known.length && !invites.length ? 'Nobody yet' : [known.length && `${known.length} added`, invites.length && `${invites.length} invited`].filter(Boolean).join(' · '),
    here: hereEmpty ? '' : hereFull ? `${me.asks.length} looking for · ${me.offers.length} to offer` : 'Pick at least two in each list',
    work: [me.title?.trim() && roleLine(me), filledPath.length && `${filledPath.length} earlier ${filledPath.length === 1 ? 'role' : 'roles'}`, me.careerChange && 'Career change'].filter(Boolean).join(' · '),
    interests: (me.interests ?? []).join(', '),
    prompts: filledPrompts.length ? `${filledPrompts.length} of 3 answered` : '',
  }

  // people from the default school: suggestions first, then anyone found by name or username
  const pool = home ? schoolUsers(home.schoolId) : []
  const term = who.trim().toLowerCase().replace(/^@/, '')
  const mayKnow = home ? suggestKnown({ me: { ...me, schoolIds: [home.schoolId], major: home.major, gradYear: home.gradYear }, schoolId: home.schoolId, blocked: [], connections: [] }).slice(0, 8) : []
  const people: { user: User; line: string }[] = term
    ? pool.filter((u) => u.name.toLowerCase().includes(term) || handleOf(u).slice(1).includes(term.replace(/\s/g, ''))).slice(0, 12).map((user) => ({ user, line: handleOf(user) }))
    : mayKnow.map(({ user, reasons }) => ({ user, line: reasons.join(' · ') }))
  const phoneOk = phone.replace(/\D/g, '').length >= 7
  const invite = () => { if (!phoneOk) return; setInvites((v) => (v.includes(phone.trim()) ? v : [...v, phone.trim()])); setPhone(''); setNobody(false) }

  const skip = () => { s.skipOnboarding(); nav('/find') }
  const finish = () => {
    s.finishOnboarding(
      {
        ...me,
        schoolIds: degrees.map((d) => d.schoolId),
        role,
        major: home!.major.trim(),
        gradYear: home!.gradYear,
        coords: CITIES[me.city] ?? CITIES.Atlanta,
        title: me.title?.trim() || (role === 'student' ? 'Student' : undefined),
        prompts: filledPrompts,
        path: filledPath,
        verified: alumPath ? 'pending' : 'verified',
      },
      prefs,
    )
    for (const id of known) s.addKnown(id, 'unsure', true)
    s.set({ invites, findView: view })
    s.say(`Welcome to ${homeSchool!.name} on Kudzu`)
    nav('/find')
  }

  if (!started) {
    return (
      <div className="flex h-full flex-col bg-vine-800 px-7 pb-8 pt-16 text-cream">
        <Logo size={34} light />
        <div className="mt-auto">
          <Tendril animate width={200} className="mb-6 opacity-80" />
          <h1 className="font-display text-[40px] font-semibold leading-[1.05]">{TAGLINE}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-vine-100">Meet students and alumni from your school for a coffee, a piece of advice, or a connection that lasts.</p>
          <div className="mt-8 space-y-3">
            <button onClick={() => setStarted(true)} className="flex w-full items-center justify-center gap-2.5 rounded-full bg-cream py-3.5 text-sm font-semibold text-ink">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0a66c2] text-[11px] font-bold text-white">in</span> Continue with LinkedIn
            </button>
            <button onClick={() => setStarted(true)} className="flex w-full items-center justify-center gap-2.5 rounded-full border border-cream/40 py-3.5 text-sm font-semibold">
              <Mail size={17} /> Verify with your .edu email
            </button>
          </div>
          <button onClick={skip} className="mt-6 w-full text-center text-[13px] font-medium text-vine-200 underline underline-offset-4">Skip onboarding (demo)</button>
        </div>
      </div>
    )
  }

  /* ---------------- the menu ---------------- */

  if (!open) {
    const rowFor = (x: (typeof SECTIONS)[number]) => (
      <button key={x.id} onClick={() => setOpen(x.id)} className="flex w-full items-center gap-3 px-3.5 py-3 text-left" aria-label={`${x.title}, ${done[x.id] ? 'done' : 'not done'}`}>
        <DoneBox done={done[x.id]} />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{x.title}</span>
          <span className={`block truncate text-xs ${x.id === 'here' && !hereEmpty && !hereFull ? 'font-semibold text-coffee-600' : done[x.id] ? 'text-vine-700' : 'text-ink/50'}`}>{summary[x.id] || x.hint}</span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-ink/30" />
      </button>
    )
    return (
      <div className="flex h-full flex-col">
        <header className="px-5 pt-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setStarted(false)} className="-ml-1.5 rounded-full p-1.5 hover:bg-sage-100" aria-label="Back"><ChevronLeft size={22} /></button>
            <button onClick={skip} className="text-xs font-semibold text-ink/45">Skip</button>
          </div>
          <h1 className="mt-3 font-display text-[26px] font-semibold leading-tight">Set up your profile</h1>
          <p className="mt-1 text-sm text-ink/60">Three things to get going. The rest can wait: add it now, or later from your profile.</p>
        </header>

        <div className="app-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Needed</h2>
            <span className="text-xs font-semibold text-vine-700">{neededDone} of {needed.length} done</span>
          </div>
          <div className="divide-y divide-sage-200 rounded-2xl bg-white ring-1 ring-sage-200">{needed.map(rowFor)}</div>

          <h2 className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-ink/50">Optional</h2>
          <div className="divide-y divide-sage-200 rounded-2xl bg-white ring-1 ring-sage-200">{SECTIONS.filter((x) => !x.needed).map(rowFor)}</div>

          <h2 className="mb-1.5 mt-5 text-xs font-semibold uppercase tracking-wide text-ink/50">How you want to see people</h2>
          <div className="grid grid-cols-2 gap-2">
            {([['leaves', 'Leaves', 'People grow on branches', Leaf], ['rows', 'Simple list', 'Plain rows, top to bottom', LayoutList]] as const).map(([id, label, sub, Icon]) => (
              <button key={id} onClick={() => setView(id)} aria-pressed={view === id} className={`rounded-2xl border p-3 text-left ${view === id ? 'border-vine-700 bg-vine-50' : 'border-sage-200 bg-white'}`}>
                <span className="flex items-center gap-1.5 text-sm font-semibold"><Icon size={15} className="text-vine-700" /> {label}</span>
                <span className="mt-0.5 block text-xs text-ink/55">{sub}</span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-ink/45">You can switch at any time from the Find tab.</p>
        </div>

        <div className="border-t border-sage-200 bg-cream px-5 pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
          {!canFinish && (
            <p className="mb-2 text-center text-xs text-ink/55">
              {neededDone < needed.length ? `Still needed: ${needed.filter((x) => !done[x.id]).map((x) => x.title.toLowerCase()).join(', ')}` : 'Finish “What you’re here for”, or clear it to do later'}
            </p>
          )}
          <Button className="w-full" disabled={!canFinish} onClick={finish}>Start finding people</Button>
        </div>
      </div>
    )
  }

  /* ---------------- one section ---------------- */

  const section = SECTIONS.find((x) => x.id === open)!
  const body: Record<SectionId, ReactNode> = {
    school: (
      <div className="space-y-4">
        <Field label="Your name"><input className={inputCls} value={me.name} onChange={(e) => up({ name: e.target.value })} placeholder="First and last name" /></Field>
        <Field label="School email">
          <input
            type="email" className={inputCls} placeholder="you@gatech.edu" value={email}
            onChange={(e) => { setEmail(e.target.value); const sc = schoolForEmail(e.target.value); if (sc && !degrees.some((d) => d.schoolId === sc.id)) { toggleSchool(sc); setAlumPath(false) } }}
          />
        </Field>
        {suggested && (
          <div className="flex items-center gap-2 rounded-xl bg-vine-100 px-3 py-2.5 text-[13px] font-medium text-vine-800">
            <BadgeCheck size={17} /> That’s a {suggested.name} address. We’ve selected it for you.
          </div>
        )}
        <div>
          <div className="mb-1 text-sm font-semibold">Where did you study?</div>
          <p className="mb-2 text-xs text-ink/55">Pick every school you have a degree from. You join each one’s network and can swap between them.</p>
          <div className="space-y-2">
            {listSchools().map((sc) => {
              const d = degrees.find((x) => x.schoolId === sc.id)
              const isHome = home?.schoolId === sc.id
              return (
                <div key={sc.id} className={`rounded-2xl border ${d ? 'border-vine-600 bg-vine-50' : 'border-sage-200 bg-white'}`}>
                  <button onClick={() => toggleSchool(sc)} className="flex w-full items-center gap-3 p-3 text-left" aria-pressed={!!d}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: sc.accent }}><GraduationCap size={19} /></div>
                    <div className="min-w-0 flex-1"><div className="font-semibold">{sc.name}</div><div className="text-xs text-ink/50">{sc.city} · @{sc.domains[0]}</div></div>
                    {isHome && degrees.length > 1 && <span className="rounded-full bg-vine-700 px-2 py-0.5 text-[10px] font-bold uppercase text-cream">Default</span>}
                    <DoneBox done={!!d} />
                  </button>
                  {d && (
                    <div className="space-y-2 border-t border-vine-200 px-3 pb-3 pt-2.5">
                      <div className="grid grid-cols-[1fr_1.4fr] gap-2">
                        <select className={inputCls} value={d.level} onChange={(e) => setDegree(sc.id, { level: e.target.value })} aria-label={`Degree at ${sc.shortName}`}>{DEGREE_LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
                        <input className={inputCls} placeholder="Major (optional)" value={d.major} onChange={(e) => setDegree(sc.id, { major: e.target.value })} aria-label={`Major at ${sc.shortName}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink/55">Class of</span>
                        <button onClick={() => setDegree(sc.id, { gradYear: Math.max(1970, d.gradYear - 1) })} className="h-8 w-8 rounded-full bg-white text-lg font-semibold text-vine-700 ring-1 ring-sage-200" aria-label="Earlier year">−</button>
                        <span className="w-12 text-center font-display text-lg font-semibold">{d.gradYear}</span>
                        <button onClick={() => setDegree(sc.id, { gradYear: Math.min(2032, d.gradYear + 1) })} className="h-8 w-8 rounded-full bg-white text-lg font-semibold text-vine-700 ring-1 ring-sage-200" aria-label="Later year">+</button>
                        {!isHome && (
                          <button onClick={() => makeDefault(sc.id)} className="ml-auto flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-semibold text-vine-700 ring-1 ring-sage-200"><Star size={12} /> Make default</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        {degrees.length > 1 && (
          <p className="rounded-xl bg-sage-100 px-3.5 py-2.5 text-xs leading-relaxed text-ink/65">
            The app opens on <b className="font-semibold text-ink">{homeSchool!.name}</b>, your default. Tap the school name at the top of any tab to swap to another.
          </p>
        )}
        {home && (
          <p className="text-[13px] text-ink/55">You’ll join as {role === 'student' ? 'a student' : 'an alum'}. Both can give and receive coffee chats.</p>
        )}
        {home && !suggested && (
          <button onClick={() => setAlumPath(!alumPath)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${alumPath ? 'border-coffee-500 bg-coffee-100' : 'border-sage-200 bg-white'}`} aria-pressed={alumPath}>
            <Clock size={19} className="shrink-0 text-coffee-600" />
            <div className="flex-1 text-[13px]">
              <div className="font-semibold">No school email? Verify as an alum</div>
              <div className="text-ink/55">{alumPath ? 'Marked as pending verification. You can use the app while we confirm your degree.' : 'We’ll confirm your degree with the alumni office.'}</div>
            </div>
            {alumPath && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">Pending</span>}
          </button>
        )}
        <button onClick={() => setRequesting(true)} className="w-full py-1 text-center text-[13px] font-semibold text-vine-600 underline underline-offset-4">My school isn’t here yet — request it</button>
      </div>
    ),

    find: <PrefsForm prefs={prefs} onChange={(patch) => setPrefs((p) => ({ ...p, ...patch }))} homeCity={me.city} />,

    known: !home ? (
      <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">Pick your school first, and we’ll suggest people from it.</p>
    ) : (
      <div className="space-y-4">
        <p className="text-sm text-ink/60">Add anyone you already know from {homeSchool!.name}. They join your network straight away, so you start with people to keep in touch with.</p>
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input className={`${inputCls} pl-10`} placeholder="Search by name or @username" value={who} onChange={(e) => setWho(e.target.value)} aria-label="Search people you know" />
        </div>
        {!term && people.length > 0 && <div className="-mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">You may know</div>}
        {people.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/50">{term ? `Nobody at ${homeSchool!.shortName} matches “${who.trim()}”. Invite them by phone below.` : 'No suggestions yet. Search above, or invite someone by phone.'}</p>
        ) : (
          <div className="divide-y divide-sage-200 rounded-2xl bg-white ring-1 ring-sage-200">
            {people.map(({ user: u, line }) => {
              const on = known.includes(u.id)
              return (
                <button key={u.id} onClick={() => { setKnown(on ? known.filter((x) => x !== u.id) : [...known, u.id]); setNobody(false) }} className="flex w-full items-center gap-3 px-3 py-2.5 text-left" aria-pressed={on}>
                  <Avatar user={u} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{u.name}</span>
                    <span className="block truncate text-xs text-ink/55">{roleLine(u)}</span>
                    <span className="block truncate text-[11px] text-vine-600">{line}</span>
                  </span>
                  <DoneBox done={on} />
                </button>
              )
            })}
          </div>
        )}

        <div>
          <div className="mb-1 text-sm font-semibold">Bring someone in</div>
          <p className="mb-2 text-xs text-ink/55">Not on Kudzu yet? Add their number and we’ll text them an invite.</p>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); invite() }}>
            <div className="relative flex-1">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input type="tel" className={`${inputCls} pl-10`} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Phone number to invite" />
            </div>
            <button type="submit" disabled={!phoneOk} className="shrink-0 rounded-full bg-vine-700 px-4 text-sm font-semibold text-cream disabled:opacity-40">Invite</button>
          </form>
          {invites.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {invites.map((n) => (
                <span key={n} className="inline-flex items-center gap-1.5 rounded-full bg-coffee-100 px-3 py-1.5 text-[13px] font-medium text-coffee-700">
                  {n} · invite ready
                  <button onClick={() => setInvites(invites.filter((x) => x !== n))} aria-label={`Remove ${n}`}><X size={13} /></button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setNobody(!nobody)} disabled={known.length + invites.length > 0} aria-pressed={nobody} className="flex w-full items-center gap-3 rounded-2xl border border-sage-200 bg-white p-3 text-left disabled:opacity-45">
          <DoneBox done={nobody && known.length + invites.length === 0} />
          <span className="text-[13px] font-medium">I don’t know anyone here yet</span>
        </button>
        <p className="text-center text-xs text-ink/45">{known.length + invites.length === 0 ? 'Add someone, invite someone, or tick the box above.' : `${known.length} added · ${invites.length} invited`}</p>
      </div>
    ),

    here: (
      <div className="space-y-4">
        <p className="text-sm text-ink/60">You don’t pick a role. Tell us what you want and what you can give, and we’ll work out who to learn from, who to help, and who to trade notes with.</p>
        <AsksOffersFields value={me} onChange={up} />
        <p className={`rounded-xl px-3.5 py-2.5 text-xs ${hereFull ? 'bg-vine-100 text-vine-800' : 'bg-sage-100 text-ink/65'}`}>
          {hereFull ? 'That’s enough to match you well.' : `Pick at least two in each list. So far: ${me.asks.length} looking for, ${me.offers.length} to offer.`}
        </p>
        <CapacityField value={me.capacity} onChange={(capacity) => up({ capacity })} />
        {!hereEmpty && !hereFull && <button onClick={() => up({ asks: [], offers: [] })} className="w-full text-center text-[13px] font-semibold text-vine-600 underline underline-offset-4">Clear and do this later</button>}
      </div>
    ),

    work: (
      <div className="space-y-5">
        <p className="text-sm text-ink/60">Your current role is the first thing people read about you, so it is the one part of this that is needed.{role === 'student' ? ' As a student, your year or an internship counts.' : ''}</p>
        <WorkFields value={{ ...me, role }} onChange={up} />
        <div>
          <div className="mb-1 text-sm font-semibold">Career path</div>
          <p className="mb-2 text-xs text-ink/55">Where you were before, oldest first. It helps people see how you got here.</p>
          <PathEditor value={me} onChange={up} />
        </div>
      </div>
    ),

    interests: (
      <div className="space-y-3">
        <p className="text-sm text-ink/60">Anything you do or belong to. People often reach out over these before they do over work.</p>
        <InterestsField value={me.interests ?? []} onChange={(interests) => up({ interests })} />
      </div>
    ),

    prompts: (
      <div className="space-y-3">
        <p className="text-sm text-ink/60">Answer one, two or three, or none. People can reply to a specific answer to start a conversation.</p>
        <PromptEditor value={me.prompts} onChange={(prompts) => up({ prompts })} />
        <p className="text-center text-xs text-ink/45">{filledPrompts.length} of 3 answered</p>
      </div>
    ),
  }

  // "what you're here for" closes only when complete or empty; everything else closes as it is
  const canClose = open !== 'here' || hereEmpty || hereFull

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 px-4 pt-4">
        <button onClick={() => setOpen(null)} className="-ml-1 rounded-full p-1.5 hover:bg-sage-100" aria-label="Back"><ChevronLeft size={22} /></button>
        <h1 className="flex-1 font-display text-[22px] font-semibold leading-tight">{section.title}</h1>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">{section.needed ? 'Needed' : 'Optional'}</span>
      </header>
      <div className="app-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">{body[open]}</div>
      <div className="border-t border-sage-200 bg-cream px-5 pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
        <Button className="w-full" disabled={!canClose} onClick={() => setOpen(null)}>
          {done[open] ? 'Done' : section.needed ? 'Back to the menu' : 'Save for later'}
        </Button>
      </div>

      <Sheet open={requesting} onClose={() => setRequesting(false)} title="Request your school">
        {requested ? (
          <div className="flex flex-col items-center py-4 text-center">
            <Tendril animate />
            <p className="mt-3 font-display text-lg font-semibold">Request received</p>
            <p className="mt-1 text-sm text-ink/60">We’ll email you when {requested} joins Kudzu. Schools open once enough students and alumni ask.</p>
            <Button className="mt-5" onClick={() => { setRequesting(false); setRequested('') }}>Got it</Button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); const v = new FormData(e.currentTarget).get('school'); if (typeof v === 'string' && v.trim()) setRequested(v.trim()) }} className="space-y-4">
            <Field label="School name"><input name="school" className={inputCls} placeholder="Your college or university" required /></Field>
            <Field label="Your email"><input name="email" type="email" className={inputCls} placeholder="So we can let you know" defaultValue={email} /></Field>
            <Button type="submit" className="w-full">Send request</Button>
          </form>
        )}
      </Sheet>
    </div>
  )
}
