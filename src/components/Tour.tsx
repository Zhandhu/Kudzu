import { useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../config/brand'
import { useKudzu, type TourId, type TourIntro } from '../store/useKudzu'
import { listSchools, receiveAnnouncement } from '../services'
import { ALUM_PERSONA, STUDENT_PERSONA } from '../data/seed'
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
  /** A second element to use if the target is not on screen, so the stop never has nothing to point at. */
  fallback?: string
  /** What Skip types into a `type` stop. */
  sample?: string
  /** Puts the caption at the top of the screen, for a stop whose lit area needs the room below. */
  place?: 'top'
}

const WELCOME: Step = { chapter: 'Welcome', advance: 'next',
  title: `What ${APP_NAME} is`,
  body: `${APP_NAME} helps alumni of the same school stay in touch with each other, and lets students reach them. Everyone on it is verified by the school. This guide shows what it does and how you use it. You do the tapping.` }

/* ---- signing up: where the guide begins, and where it splits by the app the viewer picks ---- */

/** Asks the sign-up screen to fill in whatever is still missing, so the viewer only taps. */
const fill = (what: 'school' | 'all' | 'extras') => () => window.dispatchEvent(new CustomEvent('kudzu:fill', { detail: what }))
/** The demo personas study at the first school in the data, so its email domain is the one to type. */
const DOMAIN = listSchools()[0].domains[0]
const STUDENT = STUDENT_PERSONA.name.split(' ')[0]
const ALUM = ALUM_PERSONA.name.split(' ')[0]

const SIGNUP_START: Step[] = [
  { chapter: 'Welcome', advance: 'next',
    title: `What ${APP_NAME} is`,
    body: `${APP_NAME} helps alumni of the same school stay in touch with each other, and lets students reach them. Everyone on it is verified by the school. This guide starts where a new member does, at sign-up. You do the tapping.` },
  { chapter: 'Signing up', target: 'signin', advance: 'tap',
    title: 'It starts with your school',
    body: 'Nobody looks around first. You sign in with a school email address or LinkedIn, and that is where checking that you are a real student or graduate begins. Tap the school email button.' },
  { chapter: 'Signing up', target: 'app-choice', advance: 'tap', place: 'top',
    title: 'Two ways to use it. Pick one',
    body: 'One is for meeting people from your school, the other only for staying close to those you know. The guide follows your choice.' },
  { chapter: 'Signing up', target: 'choose-continue', advance: 'tap',
    title: 'Continue',
    body: 'A member can change this later in their settings. Tap Continue.' },
]

/** The optional boxes: what each is for, filled in so the viewer can see them ticked. */
const OPTIONAL_SIGNUP: Step = { chapter: 'Signing up', target: 'signup-optional', advance: 'next', before: fill('extras'),
  title: 'The other four are optional',
  body: 'What you’re here for and the fields you’re interested in decide who the app suggests to you. Hobbies and prompts give people something to start a conversation over. A member can leave these for later. Here they have just been filled in for you.' }

const FINISH_SIGNUP: Step = { chapter: 'Signing up', target: 'signup-finish', advance: 'tap', before: fill('extras'),
  title: 'That’s sign-up',
  body: 'Every box is ticked. Tap Get started.' }

/** The short route: the list is shown, filled in. */
const SIGNUP_QUICK: Step[] = [
  { chapter: 'Signing up', target: 'signup-needed', advance: 'next', before: fill('all'),
    title: 'A short list, not a long form',
    body: 'Three things are needed: who you are and where you studied, what you do now, and the people you already know. For this quick guide they are filled in for you, as a sample member with a verified school email.' },
  OPTIONAL_SIGNUP,
  FINISH_SIGNUP,
]

/** The full route: the viewer verifies with a school email and adds someone they know. */
const SIGNUP_FULL: Step[] = [
  { chapter: 'Signing up', target: 'signup-needed', advance: 'next',
    title: 'A short list, not a long form',
    body: 'Three things are needed, in any order. The optional ones below can wait until later.' },
  { chapter: 'Signing up', target: 'section-school', advance: 'tap',
    title: 'First, your school',
    body: 'Tap “You and your school”.' },
  { chapter: 'Verified members only', target: 'signup-email', advance: 'type', sample: `you@${DOMAIN}`,
    title: 'Your school email',
    body: `Type a school email address. For this demo, anything ending in @${DOMAIN} will do.` },
  { chapter: 'Verified members only', target: 'signup-verified', fallback: 'signup-email', advance: 'next', before: fill('school'),
    title: 'This is how an account is verified',
    body: 'The address belongs to the school, so the school is selected and the account is verified. A name and class year are filled in for you. A graduate with no school email picks their school instead, and is marked “pending” until the alumni office confirms the degree.' },
  { chapter: 'Signing up', target: 'section-done', advance: 'tap',
    title: 'Back to the list',
    body: 'Tap Done.' },
  { chapter: 'Signing up', target: 'section-known', advance: 'tap',
    title: 'Next, people you already know',
    body: 'Staying in touch with them is what the app is for, so it asks at the start. Tap it.' },
  { chapter: 'Signing up', target: 'signup-known', advance: 'tap',
    title: 'Add someone you know',
    body: 'The app suggests classmates, and you can search by name. Tap this person to add them. Your list of people is not empty on the first day.' },
  { chapter: 'Signing up', target: 'section-done', advance: 'tap',
    title: 'Back to the list',
    body: 'A member could add more people here, or invite someone by phone. Tap the button to go back.' },
  { chapter: 'Signing up', target: 'signup-needed', advance: 'next', before: fill('all'),
    title: 'All three done',
    body: 'The last one, your current role, is the first thing people read about you. It is filled in for you to save typing.' },
  OPTIONAL_SIGNUP,
  FINISH_SIGNUP,
]

/** The first stop of an app's walkthrough when it follows sign-up, or is shown as the other app. */
const BRIDGE: Record<'full' | 'simple', Record<TourIntro, Step>> = {
  full: {
    signup: { chapter: 'You’re in', advance: 'next',
      title: 'Signed up, and verified',
      body: `This is Grow my network. For the rest of the guide you are ${STUDENT}, a student whose account already has some history, so there is something to look at.` },
    other: { chapter: 'The other app', advance: 'next',
      title: 'Grow my network',
      body: `This version adds a way to reach people from your school you have not met. You are now ${STUDENT}, a student. It starts in the same place: the people you know.` },
  },
  simple: {
    signup: { chapter: 'You’re in', advance: 'next',
      title: 'Signed up, and verified',
      body: `This is Keep in touch, the simpler app. For the rest of the guide you are ${ALUM}, who graduated some years ago and has people to stay in touch with.` },
    other: { chapter: 'The other app', advance: 'next',
      title: 'Keep in touch',
      body: `This version is for people who are not looking for new connections. It does one thing: it helps you stay in touch with the people you already know from school. You are now ${ALUM}, a graduate.` },
  },
}

const NETWORK: Step[] = [
  { chapter: 'Your network', target: 'tab-network', advance: 'tap', route: '/find',
    title: 'Start with the people you know',
    body: 'Most of what you do here is with people you already know from school. Tap Network.' },
  { chapter: 'Your network', target: 'map', advance: 'next', route: '/network',
    title: 'Everyone you know, on one map',
    body: 'Each leaf is someone you know. Green means you’re in close touch. Yellow means it has been a while. A grey bud is resting: not lost, and ready to pick up again.' },
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
  { chapter: 'Staying in touch', target: 'person-quiet', fallback: 'person', advance: 'tap', route: '/network',
    title: 'Someone who has gone quiet',
    body: 'A yellow leaf means you haven’t been in touch for a while. Tap this person to open their page.' },
  { chapter: 'Staying in touch', target: 'strength', advance: 'next',
    title: 'How close you are, and why',
    body: 'Closeness adds up real contact: a coffee, an event, a message. It fades as time passes, at a pace set by how often you mean to be in touch. You get a reminder when it has been a while.' },
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
    body: 'The leaf has turned green and the reminder is gone. That is the habit the app is built around: a little contact, noted.' },
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
    body: 'Nobody gets in without being confirmed as a student or graduate of the school, by school email or by the alumni office. So you know every member is a real student or graduate of the school.' },
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
    body: 'Each person takes only a few requests a month, so nobody is flooded.' },
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
    body: 'Meet-ups and reunions are a reason to see people you know again. Tap Events.' },
  { chapter: 'Events', target: 'event', advance: 'tap', route: '/events',
    title: 'Open one',
    body: 'You’re already going to this one. Its page starts with the people you know who are going too. Tap it.' },
  { chapter: 'Events', target: 'event-chat', advance: 'tap', route: '/events',
    title: 'A chat for the people going',
    body: 'Small, and tied to the event. Tap to open it.' },
  { chapter: 'Events', target: 'event-chat-note', advance: 'next',
    title: 'It closes a week after',
    body: 'So it never turns into a noisy standing group. To keep talking with someone, you tap their picture and message them directly.' },
]

/* ---- the keep-in-touch app: one home screen, the map, and nothing about meeting strangers ---- */

const SIMPLE: Step[] = [
  { chapter: 'Welcome', advance: 'next',
    title: 'The simpler way to use it',
    body: `This version of ${APP_NAME} is for people who are not looking for new connections. It does one thing: it helps you stay in touch with the people you already know from school. You do the tapping.` },
  { chapter: 'Your people', target: 'home-person', advance: 'next', route: '/home',
    title: 'Everyone you know, in one list',
    body: 'The people you have gone longest without talking to come first. A grey bud means resting: not lost, and ready to pick up again.' },
  { chapter: 'Catching up', target: 'home-catch', advance: 'tap', route: '/home',
    title: 'Who to write to',
    body: 'The app picks a few people and gives you a reason for each. Tap Catch up.' },
  { chapter: 'Catching up', target: 'home-nudge', advance: 'next', route: '/home',
    title: 'A reason, and one button',
    body: 'Someone is in town, or has news, or it has simply been a while. One tap opens a message with the first line written for you.' },
  { chapter: 'Catching up', target: 'home-caught', advance: 'tap', route: '/home',
    title: 'Already spoke to them?',
    body: 'Most catching up happens by phone or over lunch. That should count too. Tap “We already caught up”.' },
  { chapter: 'Catching up', target: 'log-it', advance: 'tap', route: '/home',
    title: 'Two taps',
    body: 'Choose how and when if you like, then tap Log it. The reminder goes away.' },
  { chapter: 'Helping, if you want to', target: 'home-help', advance: 'tap', route: '/home',
    title: 'Help someone out',
    body: 'Students and recent graduates can ask you for a conversation. This is optional. Tap Help out.' },
  { chapter: 'Helping, if you want to', target: 'home-help-list', advance: 'next', route: '/home',
    title: 'Yes, later, or no',
    body: 'Each request is answered in one tap, and saying no needs no reason.' },
  { chapter: 'Helping, if you want to', target: 'home-help-switch', advance: 'tap', route: '/home',
    title: 'You can switch it off',
    body: 'If you would rather not be shown people to help, that is your choice. Tap the switch to turn it off.' },
  { chapter: 'Helping, if you want to', target: 'home-help', advance: 'next', route: '/home',
    title: 'Off, until you want it',
    body: 'The tile is now a switch. Tap it at any time to turn helping back on. Nothing else about the app changes.' },
  { chapter: 'One person', target: 'home-person', advance: 'tap', route: '/home',
    title: 'Open someone',
    body: 'Tap the first person on your list.' },
  { chapter: 'One person', target: 'strength', advance: 'next',
    title: 'How close you are, and why',
    body: 'Closeness adds up real contact, and fades at a pace set by how often you mean to be in touch. Below this you can choose monthly, each semester, or once a year.' },
  { chapter: 'One person', target: 'back', advance: 'tap',
    title: 'Back to your list',
    body: 'Tap the arrow.' },
  { chapter: 'Adding people', target: 'home-add', advance: 'tap', route: '/home',
    title: 'Add people you already know',
    body: 'Your list starts with the people you named when you signed up. You can add anyone else you know from school, at any time. Tap here.' },
  { chapter: 'Adding people', target: 'know', advance: 'tap', route: '/known',
    title: 'Someone you may know',
    body: 'The app suggests classmates and people your contacts know, and you can search by name. Tap “I know them”.' },
  { chapter: 'Adding people', target: 'know-when', advance: 'tap', route: '/known',
    title: 'When did you last talk?',
    body: 'This sets where they start on your list, so a friend you spoke to last month is not treated like a stranger. Tap one.' },
  { chapter: 'Adding people', target: 'back', advance: 'tap', route: '/known',
    title: 'They’re on your list now',
    body: 'No request and no waiting: they are someone you know. Tap the arrow to go back.' },
  { chapter: 'Where everyone is', target: 'tab-map', advance: 'tap', route: '/home',
    title: 'One more thing: the map',
    body: 'The same people, by where they live. Tap Map.' },
  { chapter: 'Where everyone is', target: 'map', advance: 'next', route: '/network',
    title: 'Your network, on a map',
    body: 'Each leaf is someone you know. Green means you’re in close touch, yellow means it has been a while, and a grey bud is resting.' },
  { chapter: 'Where everyone is', target: 'bundle', advance: 'tap', route: '/network',
    title: 'Tap a bundle',
    body: 'A bundle is several people in one city. Useful before a trip.' },
  { chapter: 'Where everyone is', target: 'map-close', lit: 'map-card', advance: 'tap', route: '/network',
    title: 'The people you know there',
    body: 'Message any of them, or suggest a coffee. Tap the X when you’ve looked.' },
]

type AppTour = Exclude<TourId, 'signup'>
export const TOURS: Record<AppTour, Step[]> = {
  // the short route: the network, one person, then how you reach someone new and who is allowed in
  quick: [WELCOME, ...NETWORK, ...STAYING, BACK_TO_NETWORK, ...REACH],
  // every part, in the order a member would come across them
  full: [WELCOME, ...NETWORK, ...STAYING, ...CATCH_UP, BACK_TO_NETWORK, ...SCHOOL, ...REACH, ...ASK, ...MEET, ...EVENTS],
  // the keep-in-touch app
  simple: SIMPLE,
}
/** Where each walkthrough begins. */
export const TOUR_START: Record<TourId, string> = { signup: '/', quick: '/find', full: '/find', simple: '/home' }

/** The stops of a walkthrough as it is being run. */
export function stepsOf(tour: { id: TourId; intro?: TourIntro }, depth: 'quick' | 'full'): Step[] {
  if (tour.id === 'signup') return [...SIGNUP_START, ...(depth === 'full' ? SIGNUP_FULL : SIGNUP_QUICK)]
  const steps = TOURS[tour.id]
  // after sign-up, or as the second app, the opening stop says where the viewer now is
  return tour.intro ? [BRIDGE[tour.id === 'simple' ? 'simple' : 'full'][tour.intro], ...steps.slice(1)] : steps
}
const APP_NAMES = { full: 'Grow my network', simple: 'Keep in touch' } as const

/** How long the whole screen is shown between one stop and the next. */
const PAUSE_MS = 700
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
  /** Set when a stop has waited several seconds without finding what it points at. */
  const [slow, setSlow] = useState(false)
  /** True for a moment as each stop begins, while the screen is shown with nothing over it. */
  const [clear, setClear] = useState(false)
  const el = useRef<Element | null>(null)
  const path = useRef(pathname)
  path.current = pathname

  const depth = useKudzu((s) => s.tourDepth)
  const seen = useKudzu((s) => s.tourSeen)
  const steps = tour ? stepsOf(tour, depth) : []
  const step = tour ? steps[tour.step] : undefined
  const ended = !!tour && tour.step >= steps.length
  const stepKey = tour ? `${tour.id}-${tour.step}` : ''
  const next = () => { const t = useKudzu.getState().tour; if (t) set({ tour: { ...t, step: t.step + 1 } }) }
  const exit = () => set({ tour: null })
  /** Which of the two apps this walkthrough is in. */
  const app = tour?.id === 'simple' ? 'simple' : 'full'

  // Reaching the end of an app's walkthrough is remembered, so the other app is offered once.
  // The sign-up walkthrough has no end of its own: finishing sign-up starts the app's.
  useEffect(() => {
    if (!ended || !tour) return
    if (tour.id === 'signup') set({ tour: null })
    else if (!seen.includes(app)) set({ tourSeen: [...seen, app] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ended])

  // a stop begins: do its set-up, once
  const ran = useRef('')
  useEffect(() => {
    if (!step) return
    if (ran.current !== stepKey) { ran.current = stepKey; step.before?.() }
    setLit(null); setHole(null); setTyped(false); setSlow(false); el.current = null
    // Between stops the whole screen is shown, undimmed, for a moment, so the viewer
    // sees what the app looks like and where they have been led before the next caption.
    setClear(true)
    const t = setTimeout(() => setClear(false), PAUSE_MS)
    return () => clearTimeout(t)
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
      const found = visible(step.target!) ?? (step.fallback ? visible(step.fallback) : undefined)
      el.current = found ?? null
      if (!found) {
        setLit(null); setHole(null)
        // after a few seconds, say so, so nobody is left looking at "One moment"
        if (Date.now() - began > 5000) setSlow(true)
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

  if (ended && tour.id === 'signup') return null
  if (ended) {
    const other = app === 'simple' ? 'full' : 'simple'
    const offerOther = !seen.includes(other)
    const seeOther = () => { const id = other === 'simple' ? 'simple' : depth; startTour(id, 'other'); nav(TOUR_START[id]) }
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
            {offerOther && (
              <p className="mx-auto mt-4 max-w-[290px] rounded-2xl bg-sage-100 px-3.5 py-2.5 text-left text-[13.5px] leading-snug text-ink/80" data-tour-other>
                You saw <b className="font-semibold">{APP_NAMES[app]}</b>. There is a second version, <b className="font-semibold">{APP_NAMES[other]}</b>, {other === 'simple' ? 'for people who only want to stay close to those they already know' : 'which adds a way to reach people you have not met'}. Would you like to see it too?
              </p>
            )}
            <div className="mt-4 space-y-2">
              {offerOther && <button onClick={seeOther} className="w-full rounded-full bg-vine-700 py-3 text-sm font-semibold text-cream">Show me {APP_NAMES[other]}</button>}
              <button onClick={exit} className={`w-full rounded-full py-3 text-sm font-semibold ${offerOther ? 'border border-vine-700 text-vine-700' : 'bg-vine-700 text-cream'}`}>Explore on my own</button>
              {tour.id === 'quick'
                ? <button onClick={() => { startTour('full'); nav('/find') }} className="w-full py-1.5 text-[13px] font-semibold text-ink/55 underline underline-offset-4">Take the full walkthrough of this app</button>
                : <button onClick={() => { startTour(tour.id, tour.intro); nav(TOUR_START[tour.id]) }} className="w-full py-1.5 text-[13px] font-semibold text-ink/55 underline underline-offset-4">Run it again</button>}
            </div>
          </motion.div>
        </div>
      </Portal>
    )
  }
  if (!step) return null
  // the pause between stops: nothing is dimmed, and nothing can be tapped by accident
  if (clear) return <Portal><div className="pointer-events-auto absolute inset-0 z-[60]" data-tour-overlay data-step-target={step.target} data-step-advance={step.advance} data-step-ready="no" data-step-pause /></Portal>

  const waiting =!!step.target && !lit
  // The caption goes on whichever side of the lit area has room, and never over it.
  // Something that fills most of the screen (the map) has no side with room, so the caption sits inside it, low down.
  const big = !!lit && lit.h > frameH * 0.55
  const roomAbove = lit ? lit.y : 0
  const roomBelow = lit ? frameH - lit.y - lit.h : 0
  const above = !!lit && roomAbove > roomBelow
  const captionStyle = !lit ? { top: '50%', transform: 'translateY(-50%)' } : step.place === 'top' ? { top: 6 } : big ? { bottom: 96 } : above ? { bottom: Math.min(frameH - 150, frameH - lit.y + 10) } : { top: Math.min(frameH - 210, lit.y + lit.h + 10) }
  const shade = 'pointer-events-auto absolute bg-black/55'
  const block = 'pointer-events-auto absolute'
  const canNext = step.advance === 'next' || (step.advance === 'type' && typed)

  return (
    <Portal>
      <motion.div key={stepKey} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 z-[60]" data-tour-overlay data-step-target={step.target} data-step-lit={step.lit ?? step.target} data-step-advance={step.advance} data-step-ready={lit || !step.target ? 'yes' : 'no'}>
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
              <p className="mt-1.5 text-[14px] leading-snug text-ink/70">{slow ? 'This step can’t find what it is looking for. Tap Skip to move on.' : 'One moment…'}</p>
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
      </motion.div>
    </Portal>
  )
}

