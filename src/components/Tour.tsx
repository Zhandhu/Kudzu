import { useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Compass, Footprints, Rocket, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../config/brand'
import { useKudzu } from '../store/useKudzu'
import { receiveAnnouncement } from '../services'
import { Logo } from './brand'
import { OverlayContext, Portal } from './ui'

/**
 * The walkthrough. It runs over the real app: one thing is lit, a caption says
 * what it is, and the tour moves on when the viewer does the real thing. Nothing
 * is staged, so what people see in the tour is what the app does.
 *
 * It is written for someone looking at the project on their own. The order makes
 * the point of the product: keeping in touch comes first, verified membership is
 * what makes it safe, and reaching someone new comes after both.
 */

interface Step {
  chapter: string
  /** The screen this stop is on. The tour goes there if it is not already. */
  route?: string
  /** `data-tour` name of the element to light up. Without one, the caption stands alone. */
  target?: string
  title: string
  body: string
  /** tap: the viewer taps the lit element. type: they type in it, then Next. next: they read, then Next. */
  advance: 'tap' | 'type' | 'next'
  /** Runs once when the stop begins. */
  before?: () => void
}

const NETWORK: Step[] = [
  { chapter: 'Your network', route: '/network', target: 'map', advance: 'next',
    title: 'Everyone you know from school, on one map',
    body: `${APP_NAME} is for keeping in touch with the people you studied with. Each leaf is someone you know. Green means you’re in close touch. Yellow and brown mean it has gone quiet.` },
  { chapter: 'Your network', target: 'bundle', advance: 'tap',
    title: 'Tap a bundle',
    body: 'A bundle is several people in one city. The vines from you to them are thicker and greener the closer you are.' },
  { chapter: 'Your network', target: 'map-close', advance: 'tap',
    title: 'The people you know there',
    body: 'From here you can message any of them or suggest a coffee. Tap the X and the map pulls back out.' },
]

const STAYING: Step[] = [
  { chapter: 'Staying in touch', route: '/network/g7', target: 'strength', advance: 'next',
    title: 'How close you are, and why',
    body: 'Closeness adds up real contact: a coffee, an event, a message. It fades as time passes, and the app reminds you before a friendship goes quiet.' },
  { chapter: 'Staying in touch', target: 'catch-up', advance: 'tap',
    title: 'Most catching up happens off the app',
    body: 'A phone call or a lunch should count too. Tap to record one.' },
  { chapter: 'Staying in touch', target: 'log-it', advance: 'tap',
    title: 'Two taps',
    body: 'Choose how and when if you like, then tap Log it.' },
  { chapter: 'Staying in touch', target: 'strength', advance: 'next',
    title: 'Up to date again',
    body: 'The leaf is green again and the reminder is gone. That is the whole habit: a little contact, noted, before it lapses.' },
]

const SCHOOL: Step[] = [
  { chapter: 'From your school', route: '/network', target: 'push', advance: 'tap', before: receiveAnnouncement,
    title: 'News from alumni services',
    body: 'A class is thousands of people, which is too many for a group chat. So the school’s alumni services send the occasional announcement instead. One just arrived. Tap it.' },
  { chapter: 'From your school', target: 'announcement', advance: 'next',
    title: 'Announcements, not chatter',
    body: 'A reunion, a city meet-up, a few times a year. Nobody can reply to everyone. You can say you’re interested, and that is all.' },
]

const REACH: Step[] = [
  { chapter: 'Reaching someone new', route: '/find', target: 'need', advance: 'tap',
    title: 'When you do want to meet someone',
    body: 'You don’t browse people. You say what you need, and the school’s network answers. Tap one.' },
  { chapter: 'Reaching someone new', target: 'leaf', advance: 'tap',
    title: 'People who can help with that',
    body: 'A few, not a feed. The tag on each picture shows how far away they are: 2nd means someone you know knows them. Tap one.' },
]

const VERIFIED: Step = { chapter: 'Verified members only', target: 'verified', advance: 'next',
  title: 'Every account is verified',
  body: 'Nobody gets in without being confirmed as a student or graduate of the school, by school email or by the alumni office. That is why people here answer a message from someone they have not met.' }

const ASK: Step[] = [
  { chapter: 'Reaching someone new', target: 'ask', advance: 'tap',
    title: 'You ask, with a reason',
    body: 'There is no swiping and no matching. You ask one person about one thing, and they say yes, later, or no.' },
  { chapter: 'Reaching someone new', target: 'note', advance: 'type',
    title: 'Add a line',
    body: 'Type a sentence about what you’d like to ask. A request without a reason can’t be sent.' },
  { chapter: 'Reaching someone new', target: 'send-request', advance: 'tap',
    title: 'Send it',
    body: 'Each person takes only a few requests a month, so the ones they get are answered.' },
  { chapter: 'Reaching someone new', target: 'profile-actions', advance: 'next',
    title: 'She said yes',
    body: 'Now you can talk. If someone can’t answer within ten days, you’re told, and shown who else could help. A request never just goes quiet.' },
]

const MEET: Step[] = [
  { chapter: 'Meeting up', route: '/messages/g1', target: 'coffee', advance: 'tap',
    title: 'From a chat to a coffee',
    body: 'Talking comes first. When you’re ready, the cup proposes a time to meet. Tap it.' },
  { chapter: 'Meeting up', target: 'send-proposal', advance: 'tap',
    title: 'Offer a few times',
    body: 'Two are picked for you. With a calendar linked, the app marks the times you’re both free. Tap Send proposal.' },
  { chapter: 'Meeting up', target: 'confirmed', advance: 'next',
    title: 'It’s arranged',
    body: 'Afterwards the app asks, privately, how it went, and offers a reminder to stay in touch. That is how a first coffee becomes someone you know.' },
]

const EVENTS: Step[] = [
  { chapter: 'Events', route: '/events', target: 'event', advance: 'tap',
    title: 'Events for your school',
    body: 'Meet-ups, panels and reunions. Tap this one.' },
  { chapter: 'Events', target: 'event-chat', advance: 'tap',
    title: 'A chat for the people going',
    body: 'Small, and tied to the event. Tap to open it.' },
  { chapter: 'Events', target: 'event-chat-note', advance: 'next',
    title: 'It closes a week after',
    body: 'So it never turns into a noisy standing group. To keep talking with someone, you tap their picture and message them directly.' },
]

export const TOURS: Record<'quick' | 'full', Step[]> = {
  // about a minute: the map, why it stays alive, and who is allowed in
  quick: [...NETWORK, STAYING[0], ...REACH, VERIFIED],
  // about four minutes: every part, in the order that explains the product
  full: [...NETWORK, ...STAYING, ...SCHOOL, ...REACH, VERIFIED, ...ASK, ...MEET, ...EVENTS],
}

type Box = { x: number; y: number; w: number; h: number }
const PAD = 6

/** The overlay that runs a walkthrough: the lit element, the caption, and the controls. */
export function Tour() {
  const tour = useKudzu((s) => s.tour)
  const set = useKudzu((s) => s.set)
  const startTour = useKudzu((s) => s.startTour)
  const root = useContext(OverlayContext)
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [box, setBox] = useState<Box | null>(null)
  const [typed, setTyped] = useState(false)
  const el = useRef<Element | null>(null)

  const steps = tour ? TOURS[tour.id] : []
  const step = tour ? steps[tour.step] : undefined
  const ended = !!tour && tour.step >= steps.length
  const stepKey = tour ? `${tour.id}-${tour.step}` : ''
  const next = () => { if (tour) set({ tour: { ...tour, step: tour.step + 1 } }) }
  const exit = () => set({ tour: null })

  // a stop begins: do its set-up and go to its screen
  const ran = useRef('')
  useEffect(() => {
    if (!step) return
    // once per stop, even if the effect fires twice
    if (ran.current !== stepKey) { ran.current = stepKey; step.before?.() }
    if (step.route && pathname !== step.route) nav(step.route)
    setBox(null); setTyped(false); el.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey])

  // keep finding the lit element and following it, since screens animate and scroll
  useEffect(() => {
    if (!step?.target || !root) return
    let scrolled = false
    const tick = () => {
      const frame = root.getBoundingClientRect()
      const found = [...document.querySelectorAll(`[data-tour="${step.target}"]`)].find((e) => {
        const r = e.getBoundingClientRect()
        return r.width > 0 && r.height > 0
      })
      el.current = found ?? null
      if (!found) { setBox(null); return }
      const r = found.getBoundingClientRect()
      // bring it on screen once, if it sits outside the frame
      if (!scrolled && (r.top < frame.top + 60 || r.bottom > frame.bottom - 60)) { scrolled = true; found.scrollIntoView({ block: 'center' }) }
      if (step.advance === 'type') setTyped(((found as HTMLTextAreaElement).value ?? '').trim().length > 2)
      const b = { x: r.left - frame.left - PAD, y: r.top - frame.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 }
      setBox((old) => (old && Math.abs(old.x - b.x) < 0.5 && Math.abs(old.y - b.y) < 0.5 && Math.abs(old.w - b.w) < 0.5 && Math.abs(old.h - b.h) < 0.5 ? old : b))
    }
    tick()
    const t = setInterval(tick, 120)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, root])

  // a tap on the lit element is the step being done
  useEffect(() => {
    if (!step || step.advance !== 'tap') return
    const onClick = (e: MouseEvent) => {
      if (el.current && e.target instanceof Node && el.current.contains(e.target)) setTimeout(() => { const t = useKudzu.getState().tour; if (t && `${t.id}-${t.step}` === stepKey) useKudzu.getState().set({ tour: { ...t, step: t.step + 1 } }) }, 320)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey])

  // arrow key to move on where there is a Next, Escape to leave
  useEffect(() => {
    if (!tour) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit()
      if (e.key === 'ArrowRight' && step && (step.advance === 'next' || (step.advance === 'type' && typed))) next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, typed])

  if (!tour || !root) return null
  const frameH = root.clientHeight
  const frameW = root.clientWidth

  if (ended) {
    return (
      <Portal>
        <div className="pointer-events-auto absolute inset-0 z-[60] flex items-center bg-black/55 px-5">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full rounded-3xl bg-cream p-5 text-center shadow-2xl" role="dialog" aria-label="End of the walkthrough">
            <div className="flex justify-center"><Logo size={30} /></div>
            <h2 className="mt-3 font-display text-2xl font-semibold">That’s {APP_NAME}</h2>
            <ul className="mx-auto mt-3 max-w-[280px] space-y-2 text-left text-[14px] leading-snug text-ink/75">
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-vine-600" /> A way for alumni to stay in touch with the people they know.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-vine-600" /> Every member is verified by the school.</li>
              <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-vine-600" /> When you want to meet someone new, you ask them, with a reason.</li>
            </ul>
            <div className="mt-5 space-y-2">
              <button onClick={exit} className="w-full rounded-full bg-vine-700 py-3 text-sm font-semibold text-cream">Explore on my own</button>
              {tour.id === 'quick' && <button onClick={() => startTour('full')} className="w-full rounded-full border border-vine-700 py-3 text-sm font-semibold text-vine-700">Take the full walkthrough</button>}
              <button onClick={() => startTour(tour.id)} className="w-full py-1.5 text-[13px] font-semibold text-ink/55 underline underline-offset-4">Run it again</button>
            </div>
          </motion.div>
        </div>
      </Portal>
    )
  }
  if (!step) return null

  const waiting = !!step.target && !box
  // the caption goes on whichever side of the lit element has room
  const above = !!box && box.y + box.h / 2 > frameH / 2
  // something that fills most of the screen (the map) has no side with room, so the caption sits inside it, low down
  const big = !!box && box.h > frameH * 0.55
  const captionStyle = !box || big ? { bottom: 96 } : above ? { bottom: Math.min(frameH - 150, frameH - box.y + 12) } : { top: Math.min(frameH - 210, box.y + box.h + 12) }
  const shade = 'pointer-events-auto absolute bg-black/55'
  const canNext = step.advance === 'next' || (step.advance === 'type' && typed)

  return (
    <Portal>
      <div className="absolute inset-0 z-[60]" data-tour-overlay data-step-target={step.target} data-step-advance={step.advance} data-step-ready={box ? "yes" : "no"}>
        {box ? (
          <>
            {/* four panels around the lit element: everything else is dimmed and can't be tapped */}
            <div className={shade} style={{ left: 0, top: 0, width: frameW, height: Math.max(0, box.y) }} />
            <div className={shade} style={{ left: 0, top: box.y + box.h, width: frameW, height: Math.max(0, frameH - box.y - box.h) }} />
            <div className={shade} style={{ left: 0, top: box.y, width: Math.max(0, box.x), height: box.h }} />
            <div className={shade} style={{ left: box.x + box.w, top: box.y, width: Math.max(0, frameW - box.x - box.w), height: box.h }} />
            {/* on a read-only stop the lit element is shown but not tappable, so the tour keeps its place */}
            {step.advance === 'next' && <div className="pointer-events-auto absolute" style={{ left: box.x, top: box.y, width: box.w, height: box.h }} />}
            <div className="pointer-events-none absolute rounded-2xl ring-2 ring-cream" style={{ left: box.x, top: box.y, width: box.w, height: box.h, boxShadow: '0 0 0 4px rgba(111,165,101,.55)' }} />
          </>
        ) : (
          <div className="pointer-events-auto absolute inset-0 bg-black/35" />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={stepKey + (waiting ? 'w' : '')}
            initial={{ opacity: 0, y: above ? 8 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            className="pointer-events-auto absolute inset-x-3 rounded-2xl bg-cream p-3.5 shadow-2xl ring-1 ring-black/5"
            style={captionStyle}
            role="dialog" aria-label={`Walkthrough: ${step.title}`}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-vine-700">
              {step.chapter}
              <span className="ml-auto font-medium normal-case tracking-normal text-ink/45">{tour.step + 1} of {steps.length}</span>
              <button onClick={exit} className="-mr-1 rounded-full p-1 text-ink/45 hover:bg-sage-100" aria-label="Leave the walkthrough"><X size={15} /></button>
            </div>
            {waiting ? (
              <p className="mt-1.5 text-[14px] leading-snug text-ink/70">One moment…</p>
            ) : (
              <>
                <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">{step.title}</h3>
                <p className="mt-1 text-[13.5px] leading-snug text-ink/75">{step.body}</p>
              </>
            )}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex flex-1 gap-1" aria-hidden>
                {steps.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= tour.step ? 'bg-vine-600' : 'bg-sage-200'}`} />)}
              </div>
              <button onClick={next} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${canNext && !waiting ? 'hidden' : 'text-ink/50'}`}>Skip</button>
              {canNext && !waiting && <button onClick={next} className="rounded-full bg-vine-700 px-4 py-1.5 text-xs font-semibold text-cream">Next</button>}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Portal>
  )
}

/**
 * The first thing a visitor sees in the app: a choice between being shown round
 * and looking for themselves. Offered once. The demo controls can start a tour later.
 */
export function TourOffer() {
  const show = useKudzu((s) => s.onboarded && s.experience === 'full' && !s.tourOffered && !s.tour)
  const set = useKudzu((s) => s.set)
  const startTour = useKudzu((s) => s.startTour)
  const options = [
    { id: 'quick' as const, icon: Rocket, title: 'Quick guide', sub: 'About a minute. The idea, in seven stops.' },
    { id: 'full' as const, icon: Footprints, title: 'Full walkthrough', sub: 'About four minutes. You try each part yourself.' },
  ]
  return (
    <Portal>
      <AnimatePresence>
        {show && (
          <motion.div className="pointer-events-auto absolute inset-0 z-[55] flex items-center bg-black/50 px-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full rounded-3xl bg-cream p-5 shadow-2xl" role="dialog" aria-label={`Welcome to ${APP_NAME}`}>
              <Logo size={28} />
              <h2 className="mt-3 font-display text-[24px] font-semibold leading-tight">Welcome to {APP_NAME}</h2>
              <p className="mt-1.5 text-[14px] leading-snug text-ink/70">A way for alumni to stay in touch with each other, and for students to reach them.</p>
              <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-snug text-vine-800"><BadgeCheck size={16} className="mt-0.5 shrink-0" /> Every member is a verified student or graduate of the school.</p>
              <div className="mt-4 space-y-2">
                {options.map(({ id, icon: Icon, title, sub }) => (
                  <button key={id} onClick={() => startTour(id)} className="flex w-full items-center gap-3 rounded-2xl bg-vine-700 p-3.5 text-left text-cream">
                    <Icon size={20} className="shrink-0" />
                    <span><span className="block text-[15px] font-semibold leading-tight">{title}</span><span className="block text-xs text-vine-100">{sub}</span></span>
                  </button>
                ))}
                <button onClick={() => set({ tourOffered: true })} className="flex w-full items-center gap-3 rounded-2xl border border-sage-200 bg-white p-3.5 text-left">
                  <Compass size={20} className="shrink-0 text-vine-700" />
                  <span><span className="block text-[15px] font-semibold leading-tight">Explore on my own</span><span className="block text-xs text-ink/55">Everything works. Tap anything.</span></span>
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-ink/45">This is a demo. The people are fictional and nothing is sent anywhere.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  )
}
