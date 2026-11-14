import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Check, ChevronLeft, Clock, GraduationCap, Mail, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Prefs, School, User } from '../types'
import { TAGLINE } from '../config/brand'
import { DEFAULT_PREFS } from '../data/seed'
import { useKudzu } from '../store/useKudzu'
import { listSchools, schoolForEmail } from '../services'
import { CITIES } from '../lib/util'
import { Logo, Tendril } from '../components/brand'
import { Button, Field, Sheet, inputCls } from '../components/ui'
import { PrefsForm } from '../components/PrefsForm'
import { AsksOffersFields, BasicsFields, PromptEditor } from '../components/ProfileEditor'

const STEPS = ['Join your school', 'About you', 'The basics', 'What you’re here for', 'Your prompts', 'Who you’ll meet']

const blank: User = {
  id: 'me', schoolIds: [], role: 'student', gradYear: 2028, name: '', major: '', title: '', company: undefined,
  industry: 'Tech', city: 'Atlanta', coords: CITIES.Atlanta, asks: [], offers: [], prompts: [], capacity: 4, used: 0, groupIds: [], verified: 'verified',
}

export default function Onboarding() {
  const nav = useNavigate()
  const finishOnboarding = useKudzu((s) => s.finishOnboarding)
  const skipOnboarding = useKudzu((s) => s.skipOnboarding)
  const say = useKudzu((s) => s.say)
  const [step, setStep] = useState(-1)
  const [me, setMe] = useState<User>(blank)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS)
  const [email, setEmail] = useState('')
  const [query, setQuery] = useState('')
  const [school, setSchool] = useState<School | null>(null)
  const [alumPath, setAlumPath] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState('')
  const up = (patch: Partial<User>) => setMe((m) => ({ ...m, ...patch }))

  const suggested = schoolForEmail(email)
  const schools = listSchools().filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()))
  const filledPrompts = me.prompts.filter((p) => p.promptId && p.answer.trim()).length

  const canNext = [
    !!school,
    me.gradYear >= 1970 && me.gradYear <= 2032,
    !!me.name.trim() && !!me.major.trim() && (me.role === 'student' || !!me.title?.trim()),
    me.asks.length + me.offers.length > 0,
    filledPrompts === 3,
    true,
  ][step]

  const skip = () => { skipOnboarding(); nav('/meet') }
  const finish = () => {
    finishOnboarding(
      {
        ...me,
        schoolIds: [school!.id],
        coords: CITIES[me.city] ?? CITIES.Atlanta,
        title: me.title?.trim() || (me.role === 'student' ? 'Student' : undefined),
        prompts: me.prompts.filter((p) => p.promptId && p.answer.trim()),
        verified: alumPath ? 'pending' : 'verified',
      },
      prefs,
    )
    say(`Welcome to ${school!.name} on Kudzu`)
    nav('/meet')
  }

  if (step === -1) {
    return (
      <div className="flex h-full flex-col bg-vine-800 px-7 pb-8 pt-16 text-cream">
        <Logo size={34} light />
        <div className="mt-auto">
          <Tendril animate width={200} className="mb-6 opacity-80" />
          <h1 className="font-display text-[40px] font-semibold leading-[1.05]">{TAGLINE}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-vine-100">Meet students and alumni from your school for a coffee, a piece of advice, or a connection that lasts.</p>
          <div className="mt-8 space-y-3">
            <button onClick={() => setStep(0)} className="flex w-full items-center justify-center gap-2.5 rounded-full bg-cream py-3.5 text-sm font-semibold text-ink">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0a66c2] text-[11px] font-bold text-white">in</span> Continue with LinkedIn
            </button>
            <button onClick={() => setStep(0)} className="flex w-full items-center justify-center gap-2.5 rounded-full border border-cream/40 py-3.5 text-sm font-semibold">
              <Mail size={17} /> Verify with your .edu email
            </button>
          </div>
          <button onClick={skip} className="mt-6 w-full text-center text-[13px] font-medium text-vine-200 underline underline-offset-4">Skip onboarding (demo)</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(step - 1)} className="-ml-1.5 rounded-full p-1.5 hover:bg-sage-100" aria-label="Back"><ChevronLeft size={22} /></button>
          <div className="flex flex-1 gap-1.5">
            {STEPS.map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-vine-600' : 'bg-sage-200'}`} />)}
          </div>
          <button onClick={skip} className="text-xs font-semibold text-ink/45">Skip</button>
        </div>
        <h1 className="mt-5 font-display text-[26px] font-semibold leading-tight">{STEPS[step]}</h1>
      </header>

      <div className="app-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }}>
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-ink/60">Everything you see is scoped to your school’s students and alumni.</p>
                <Field label="School email">
                  <input type="email" className={inputCls} placeholder="you@gatech.edu" value={email} onChange={(e) => { setEmail(e.target.value); const s = schoolForEmail(e.target.value); if (s) { setSchool(s); setAlumPath(false) } }} />
                </Field>
                {suggested && (
                  <div className="flex items-center gap-2 rounded-xl bg-vine-100 px-3 py-2.5 text-[13px] font-medium text-vine-800">
                    <BadgeCheck size={17} /> That’s a {suggested.name} address. We’ve selected it for you.
                  </div>
                )}
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
                  <input className={`${inputCls} pl-10`} placeholder="Or search for your school" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search schools" />
                </div>
                <div className="space-y-2">
                  {schools.map((s) => (
                    <button key={s.id} onClick={() => setSchool(s)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${school?.id === s.id ? 'border-vine-600 bg-vine-50' : 'border-sage-200 bg-white'}`} aria-pressed={school?.id === s.id}>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: s.accent }}><GraduationCap size={19} /></div>
                      <div className="min-w-0 flex-1"><div className="font-semibold">{s.name}</div><div className="text-xs text-ink/50">{s.city} · @{s.domains[0]}</div></div>
                      {school?.id === s.id && <Check size={18} className="text-vine-600" />}
                    </button>
                  ))}
                  {schools.length === 0 && <p className="py-3 text-center text-sm text-ink/50">No schools match “{query}”.</p>}
                </div>
                {school && !suggested && (
                  <button onClick={() => { setAlumPath(!alumPath); up({ role: 'alum', gradYear: 2018 }) }} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${alumPath ? 'border-coffee-500 bg-coffee-100' : 'border-sage-200 bg-white'}`} aria-pressed={alumPath}>
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
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {(['student', 'alum'] as const).map((r) => (
                    <button key={r} onClick={() => up({ role: r, gradYear: r === 'student' ? 2028 : 2018 })} className={`rounded-2xl border p-4 text-left ${me.role === r ? 'border-vine-600 bg-vine-50' : 'border-sage-200 bg-white'}`} aria-pressed={me.role === r}>
                      <div className="font-display text-lg font-semibold">{r === 'student' ? 'Student' : 'Alum'}</div>
                      <div className="mt-1 text-xs text-ink/55">{r === 'student' ? 'Currently enrolled' : 'Graduated'}</div>
                    </button>
                  ))}
                </div>
                <Field label={me.role === 'student' ? 'Expected graduation year' : 'Graduation year'}>
                  <div className="flex items-center gap-3">
                    <button onClick={() => up({ gradYear: me.gradYear - 1 })} className="h-11 w-11 rounded-full bg-sage-100 text-xl font-semibold text-vine-700" aria-label="Earlier year">−</button>
                    <div className="flex-1 rounded-xl border border-sage-200 bg-white py-2.5 text-center font-display text-2xl font-semibold">{me.gradYear}</div>
                    <button onClick={() => up({ gradYear: me.gradYear + 1 })} className="h-11 w-11 rounded-full bg-sage-100 text-xl font-semibold text-vine-700" aria-label="Later year">+</button>
                  </div>
                </Field>
                <p className="text-[13px] text-ink/55">Both students and alumni can give and receive coffee chats. Older students mentor younger ones too.</p>
              </div>
            )}

            {step === 2 && <BasicsFields value={me} onChange={up} />}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-ink/60">
                  You don’t pick a role. Tell us what you want and what you can give, and we’ll match you with people to learn from, people to help, and peers to trade notes with.
                </p>
                <AsksOffersFields value={me} onChange={up} />
                <Field label={`Open to ${me.capacity} chats per month`}>
                  <input type="range" min={1} max={10} className="w-full" value={me.capacity} onChange={(e) => up({ capacity: +e.target.value })} />
                </Field>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <p className="text-sm text-ink/60">Choose three prompts and answer them. People can like a specific answer to start a conversation.</p>
                <PromptEditor value={me.prompts} onChange={(prompts) => up({ prompts })} />
                <p className="text-center text-xs text-ink/45">{filledPrompts} of 3 answered</p>
              </div>
            )}

            {step === 5 && <PrefsForm prefs={prefs} onChange={(patch) => setPrefs((p) => ({ ...p, ...patch }))} homeCity={me.city} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-t border-sage-200 bg-cream px-5 pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
        <Button className="w-full" disabled={!canNext} onClick={() => (step === STEPS.length - 1 ? finish() : setStep(step + 1))}>
          {step === STEPS.length - 1 ? 'Start meeting people' : 'Continue'}
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
