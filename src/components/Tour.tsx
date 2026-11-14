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
 * what it is, and the tour moves on when the viewer does the real thing.
 *
 * It is a guide, not a slideshow. The viewer gets from one part of the app to the
 * next the way a member would: by tapping a tab, opening a person from the list,
 * going back. So by the end they have seen what the app does and also how to
 * use it. It is written for someone judging the project on their own.
 *
 * The order makes the point of the product: staying in touch with people you
 * know comes first, verified membership is what makes it safe, and reaching
 * someone new comes after both.
 */

interface Step {
  chapter: string
  /** `data-tour` name of the element the viewer acts on. Without one, the caption stands alone. */
  target?: string
  /** A larger area to light around the target, when what matters is more than the button itself. */
  lit?: string
  title: string
  body: string
  /** tap: the viewer taps the target. type: they type in it, then Next. next: they read, then Next. */
  advance: 'tap' | 'type' | 'next'
  /** Runs once when the stop begins. */
  before?: () => void
  /** Where this stop lives. Only used to recover if the viewer has ended up somewhere else. */
  route?: string
  /** What Skip types into a `type` stop. */
  sample?: string
}

const WELCOME: Step = { chapter: 'Welcome', advance: 'next',
  title: `What ${APP_NAME} is`,
  body: `${APP_NAME} helps alumni of the same school stay in touch with each other, and lets students reach them. Everyone on it is verified by the school. This guide shows what it does and how you use it. You do the tapping.` }

const NETWORK: Step[] = [
  { chapter: 'Your network', target: 'tab-network', advance: 'tap', route: '/find',
    title: 'Start with the people you know',
    body: 'Most of what you do here is with people you already know from school. Tap Network.' },
  { chapter: 'Your network', target: 'map', advance: 'next', route: '/network',
    title: 'Everyone you know, on one map',
    body: 'Each leaf is someone you know. Green means you’re in close touch. Yellow and brown mean it has gone quiet. The vines are thicker the closer you are.' },
  { chapter: 'Your network', target: 'bundle', advance: 'tap', route: '/network',
    title: 'Tap a bundle',
    body: 'A bundle is several people in one city. Tap one and the map flies in.' },
  { chapter: 'Your network', target: 'map-close', lit: 'map-card', advance: 'tap', route: '/network',
    title: 'The people you know there',
    body: 'Each has a button to message them and one to suggest a coffee. When you’ve looked, tap the X and the map pulls back out.' },
]

const STAYING: Step[] = [
  { chapter: 'Staying in touch', target: 'view-list', advance: 'tap', route: '/network',
    title: 'The same people, as a list',
    body: 'The map shows where people are. The list shows who needs attention. Tap List.' },
  { chapter: 'Staying in touch', target: 'person-quiet', advance: 'tap', route: '/network',
    title: 'Someone who has gone quiet',
    body: 'A yellow leaf means you haven’t been in touch for a while. Tap this person to open their page.' },
  { chapter: 'Staying in touch', target: 'strength', advance: 'next',
    title: 'How close you are, and why',
    body: 'Closeness adds up real contact: a coffee, an event, a message. It fades as time passes, and you get a reminder before a friendship lapses.' },
]

const CATCH_UP: Step[] = [
  { chapter: 'Staying in touch', target: 'catch-up', advance: 'tap',
    title: 'Most catching up happens off the app',
    body: 'A phone call or a lunch should count too. Tap to record one.' },
  { chapter: 'Staying in touch', target: 'log-it', advance: 'tap',
    title: 'Two taps',
    body: 'Choose how and when if you like, then tap Log it.' },
  { chapter: 'Staying in touch', target: 'strength', advance: 'next',
    title: 'Back in touch',
    body: 'The leaf has turned green and the reminder is gone. That is the habit the app is built around: a little contact, noted, before it lapses.' },
]

const BACK_TO_NETWORK: Step = { chapter: 'Staying in touch', target: 'back', advance: 'tap',
  title: 'Back to your network',
  body: 'Tap the arrow to go back.' }

const SCHOOL: Step[] = [
  { chapter: 'From your school', target: 'push', advance: 'tap', before: receiveAnnouncement, route: '/network',
    title: 'News from alumni services',
    body: 'A class is thousands of people, which is too many for a group chat. So the school’s alumni services send the occasional announcement instead. One has just arrived. Tap it.' },
  { chapter: 'From your school', target: 'announcement', advance: 'next', route: '/network',
    title: 'Announcements, not chatter',
    body: 'A reunion, a city meet-up, a few times a year. Nobody can reply to everyone. You can say you’re interested, and that is all.' },
  { chapter: 'From your school', target: 'sheet-close', advance: 'tap', route: '/network',
    title: 'Close it',
    body: 'These live under the green leaf in the corner, whenever you want them again. Tap the X.' },
]

const REACH: Step[] = [
  { chapter: 'Reaching someone new', target: 'tab-find', advance: 'tap', route: '/network',
    title: 'Now, someone you don’t know yet',
    body: 'Staying in touch comes first. But sometimes you need help from someone you haven’t met. Tap Find.' },
  { chapter: 'Reaching someone new', target: 'need', advance: 'tap', route: '/find',
    title: 'Say what you need',
    body: 'You don’t browse people here. You say what you’re looking for and the school’s network answers. Tap one.' },
  { chapter: 'Reaching someone new', target: 'leaf', advance: 'tap', route: '/find',
    title: 'People who can help with that',
    body: 'A few, not a feed. The tag on each picture shows how far away they are: 2nd means someone you know knows them. Tap one.' },
  { chapter: 'Verified members only', target: 'verified', advance: 'next', route: '/find',
    title: 'Every account is verified',
    body: 'Nobody gets in without being confirmed as a student or graduate of the school, by school email or by the alumni office. So you always know who you are talking to.' },
]

const ASK: Step[] = [
  { chapter: 'Reaching someone new', target: 'ask', advance: 'tap', route: '/find',
    title: 'You ask, with a reason',
    body: 'There is no swiping and no matching. You ask one person about one thing, and they say yes, later, or no.' },
  { chapter: 'Reaching someone new', target: 'note', advance: 'type', route: '/find', sample: 'I’d love to hear how you got into your field.',
    title: 'Add a line',
    body: 'Type a sentence about what you’d like to ask. A request without a reason can’t be sent.' },
  { chapter: 'Reaching someone new', target: 'send-request', advance: 'tap', route: '/find',
    title: 'Send it',
    body: 'Each person takes only a few requests a month, so the ones they get are answered.' },
  { chapter: 'Reaching someone new', target: 'go-message', advance: 'tap', route: '/find',
    title: 'She said yes',
    body: 'If someone can’t answer within ten days you’re told, and shown who else could help. A request never just goes quiet. Tap Message to talk to her.' },
]

const MEET: Step[] = [
  { chapter: 'Meeting up', target: 'coffee', advance: 'tap', route: '/messages/g1',
    title: 'From a chat to a coffee',
    body: 'Talking comes first. When you’re ready, the cup suggests a time to meet. Tap it.' },
  { chapter: 'Meeting up', target: 'send-proposal', advance: 'tap', route: '/messages/g1',
    title: 'Offer a few times',
    body: 'Two are picked for you. With a calendar linked, the app marks the times you’re both free. Tap Send proposal.' },
  { chapter: 'Meeting up', target: 'confirmed', advance: 'next', route: '/messages/g1',
    title: 'It’s arranged',
    body: 'Afterwards the app asks you, privately, how it went, and offers a reminder to stay in touch. That is how a first coffee becomes someone you know.' },
  { chapter: 'Meeting up', target: 'back', advance: 'tap', route: '/messages/g1',
    title: 'Back out of the chat',
    body: 'Tap the arrow.' },
]

const EVENTS: Step[] = [
  { chapter: 'Events', target: 'tab-events', advance: 'tap', route: '/find',
    title: 'One more place: events',
    body: 'Meet-ups, panels and reunions for your school. Tap Events.' },
  { chapter: 'Events', target: 'event', advance: 'tap', route: '/events',
    title: 'Open one',
    body: 'You’re already going to this one. Tap it.' },
  { chapter: 'Events', target: 'event-chat', advance: 'tap', route: '/events',
    title: 'A chat for the people going',
    body: 'Small, and tied to the event. Tap to open it.' },
  { chapter: 'Events', target: 'event-chat-note', advance: 'next',
    title: 'It closes a week after',
    body: 'So it never turns into a noisy standing group. To keep talking with someone, you tap their picture and message them directly.' },
]

export const TOURS: Record<'quick' | 'full', Step[]> = {
  // the short route: the network, one person, then how you reach someone new and who is allowed in
  quick: [WELCOME, ...NETWORK, ...STAYING, BACK_TO_NETWORK, ...REACH],
  // every part, in the order a member would come across them
  full: [WELCOME, ...NETWORK, ...STAYING, ...CATCH_UP, BACK_TO_NETWORK, ...SCHOOL, ...REACH, ...ASK, ...MEET, ...EVENTS],
}

type Box = { x: number; y: number; w: number; h: number }
const PAD = 6
const visible = (name: string) => [...document.querySelectorAll(`[data-tour="${name}"]`)].find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 })
/** Puts text into a field the way typing would, so the app notices. */
function typeInto(field: Element, text: string) {
  const proto = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(field, text)
  field.dispatchEvent(new Event('input', { bubbles: true }))
}

/** The overlay that runs a walkthrough: the lit element, the caption, and the controls. */
export function Tour() {
  const tour = useKudzu((s) => s.tour)
  const set = useKudzu((s) => s.set)
  const startTour = useKudzu((s) => s.startTour)
  const root = useContext(OverlayContext)
  const nav = useNavigate()
  const { pathname } = useLocation()
  /** The lit area, and the part of it that can be tapped. They are the same unless the stop lights a larger area. */
  const [lit, setLit] = useState<Box | null>(null)
  const [hole, setHole] = useState<Box | null>(null)
  const [typed, setTyped] = useState(false)
  const el = useRef<Element | null>(null)
  const path = useRef(pathname)
  path.current = pathname

  const steps = tour ? TOURS[tour.id] : []
  const step = tour ? steps[tour.step] : undefined
  const ended = !!tour && tour.step >= steps.length
  const stepKey = tour ? `${tour.id}-${tour.step}` : ''
  const next = () => { const t = useKudzu.getState().tour; if (t) set({ tour: { ...t, step: t.step + 1 } }) }
  const exit = () => set({ tour: null })

  // a stop begins: do its set-up, once
  const ran = useRef('')
  useEffect(() => {
    if (!step) return
    if (ran.current !== stepKey) { ran.current = stepKey; step.before?.() }
    setLit(null); setHole(null); setTyped(false); el.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey])

  // keep finding the lit element and following it, since screens animate and scroll
  useEffect(() => {
    if (!step?.target || !root) return
    let scrolled = false
    const began = Date.now()
    const same = (a: Box | null, b: Box) => !!a && Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.w - b.w) < 0.5 && Math.abs(a.h - b.h) < 0.5
    const tick = () => {
      const frame = root.getBoundingClientRect()
      const found = visible(step.target!)
      el.current = found ?? null
      if (!found) {
        setLit(null); setHole(null)
        // The viewer is normally brought here by their own taps. If they have ended up
        // somewhere else (they skipped, or tapped away), go to where this stop lives.
        if (step.route && path.current !== step.route && Date.now() - began > 2500) nav(step.route)
        return
      }
      const r = found.getBoundingClientRect()
      if (!scrolled && (r.top < frame.top + 60 || r.bottom > frame.bottom - 60)) { scrolled = true; found.scrollIntoView({ block: 'center' }) }
      if (step.advance === 'type') setTyped(((found as HTMLTextAreaElement).value ?? '').trim().length > 2)
      const box = (q: DOMRect): Box => ({ x: q.left - frame.left - PAD, y: q.top - frame.top - PAD, w: q.width + PAD * 2, h: q.height + PAD * 2 })
      const h = box(r)
      const area = step.lit ? visible(step.lit) : undefined
      const l = area ? box(area.getBoundingClientRect()) : h
      setHole((old) => (same(old, h) ? old : h))
      setLit((old) => (same(old, l) ? old : l))
    }
    tick()
    const t = setInterval(tick, 120)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, root])

  // a tap on the target is the step being done
  useEffect(() => {
    if (!step || step.advance !== 'tap') return
    const onClick = (e: MouseEvent) => {
      if (el.current && e.target instanceof Node && el.current.contains(e.target)) {
        setTimeout(() => { const t = useKudzu.getState().tour; if (t && `${t.id}-${t.step}` === stepKey) useKudzu.getState().set({ tour: { ...t, step: t.step + 1 } }) }, 320)
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey])

  /**
   * Skip does the step for the viewer instead of jumping past it. The tap or the
   * typing still happens, so the app is in the state the next stops expect.
   */
  const skip = () => {
    if (!step) return
    const target = el.current
    if (step.advance === 'tap' && target instanceof HTMLElement) {
      // the target may be a wrapper around the real button, so press the button itself
      const press = target.matches('button, a') ? target : target.querySelector<HTMLElement>('button, a') ?? target
      press.click() // the tap listener moves the tour on
      return
    }
    if (step.advance === 'type' && target) typeInto(target, step.sample ?? 'Hello')
    if (!target && step.route && path.current !== step.route) nav(step.route)
    next()
  }

  // arrow key to move on, Escape to leave
  useEffect(() => {
    if (!tour) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exit()
      if (e.key === 'ArrowRight' && step) { if (step.advance === 'next' || (step.advance === 'type' && typed)) next(); else skip() }
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
              {tour.id === 'quick' && <button onClick={() => { startTour('full'); nav('/find') }} className="w-full rounded-full border border-vine-700 py-3 text-sm font-semibold text-vine-700">Take the full walkthrough</button>}
              <button onClick={() => { startTour(tour.id); nav('/find') }} className="w-full py-1.5 text-[13px] font-semibold text-ink/55 underline underline-offset-4">Run it again</button>
            </div>
          </motion.div>
        </div>
      </Portal>
    )
  }
  if (!step) return null

  const waiting = !!step.target && !lit
  // The caption goes on whichever side of the lit area has room, and never over it.
  // Something that fills most of the screen (the map) has no side with room, so the caption sits inside it, low down.
  const big = !!lit && lit.h > frameH * 0.55
  const roomAbove = lit ? lit.y : 0
  const roomBelow = lit ? frameH - lit.y - lit.h : 0
  const above = !!lit && roomAbove > roomBelow
  const captionStyle = !lit ? { top: '50%', transform: 'translateY(-50%)' } : big ? { bottom: 96 } : above ? { bottom: Math.min(frameH - 150, frameH - lit.y + 10) } : { top: Math.min(frameH - 210, lit.y + lit.h + 10) }
  const shade = 'pointer-events-auto absolute bg-black/55'
  const block = 'pointer-events-auto absolute'
  const canNext = step.advance === 'next' || (step.advance === 'type' && typed)

  return (
    <Portal>
      <div className="absolute inset-0 z-[60]" data-tour-overlay data-step-target={step.target} data-step-lit={step.lit ?? step.target} data-step-advance={step.advance} data-step-ready={lit || !step.target ? 'yes' : 'no'}>
        {lit && hole ? (
          <>
            {/* four panels around the lit area: everything else is dimmed and can't be tapped */}
            <div className={shade} style={{ left: 0, top: 0, width: frameW, height: Math.max(0, lit.y) }} />
            <div className={shade} style={{ left: 0, top: lit.y + lit.h, width: frameW, height: Math.max(0, frameH - lit.y - lit.h) }} />
            <div className={shade} style={{ left: 0, top: lit.y, width: Math.max(0, lit.x), height: lit.h }} />
            <div className={shade} style={{ left: lit.x + lit.w, top: lit.y, width: Math.max(0, frameW - lit.x - lit.w), height: lit.h }} />
            {/* Inside the lit area only the target can be tapped, so the tour keeps its place.
                On a read-only stop nothing can: it is there to be looked at. */}
            {step.advance === 'next' ? (
              <div className={block} style={{ left: lit.x, top: lit.y, width: lit.w, height: lit.h }} />
            ) : hole !== lit && (
              <>
                <div className={block} style={{ left: lit.x, top: lit.y, width: lit.w, height: Math.max(0, hole.y - lit.y) }} />
                <div className={block} style={{ left: lit.x, top: hole.y + hole.h, width: lit.w, height: Math.max(0, lit.y + lit.h - hole.y - hole.h) }} />
                <div className={block} style={{ left: lit.x, top: hole.y, width: Math.max(0, hole.x - lit.x), height: hole.h }} />
                <div className={block} style={{ left: hole.x + hole.w, top: hole.y, width: Math.max(0, lit.x + lit.w - hole.x - hole.w), height: hole.h }} />
              </>
            )}
            <div className="pointer-events-none absolute rounded-2xl ring-2 ring-cream" style={{ left: hole.x, top: hole.y, width: hole.w, height: hole.h, boxShadow: '0 0 0 4px rgba(111,165,101,.55)' }} />
          </>
        ) : (
          <div className={`pointer-events-auto absolute inset-0 ${step.target ? 'bg-black/35' : 'bg-black/55'}`} />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={stepKey + (waiting ? 'w' : '')}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
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
              <div className="flex flex-1 gap-[3px]" aria-hidden>
                {steps.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= tour.step ? 'bg-vine-600' : 'bg-sage-200'}`} />)}
              </div>
              {canNext && !waiting
                ? <button onClick={next} className="rounded-full bg-vine-700 px-4 py-1.5 text-xs font-semibold text-cream">Next</button>
                : <button onClick={skip} className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink/50" title="Does this step for you">Skip</button>}
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
  const nav = useNavigate()
  const begin = (id: 'quick' | 'full') => { startTour(id); nav('/find') }
  const options = [
    { id: 'quick' as const, icon: Rocket, title: 'Quick guide', sub: `About two minutes. ${TOURS.quick.length} short stops.` },
    { id: 'full' as const, icon: Footprints, title: 'Full walkthrough', sub: `About five minutes. You try every part yourself.` },
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
                  <button key={id} onClick={() => begin(id)} className="flex w-full items-center gap-3 rounded-2xl bg-vine-700 p-3.5 text-left text-cream">
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
