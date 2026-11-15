import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Check, GraduationCap, Hand, Megaphone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { openEvent, useKudzu, useNow } from '../store/useKudzu'
import { alumniServices, announcementAudience, getSchool, myAnnouncements } from '../services'
import { ago } from '../lib/util'
import { Portal } from './ui'

/**
 * Notices to your class and your city. A cohort is hundreds or thousands of
 * people, far too many for a chat, so these go one way and come a few times a
 * year. They are sent by the school's alumni services, not by other members.
 * There is no reply: the most you do is say you are interested.
 */
export function AnnouncementList({ onLeave, only }: { onLeave?: () => void; /** Show only the posts to the class, or only those to the city. */ only?: 'class' | 'city' }) {
  const s = useKudzu()
  const now = useNow()
  const list = myAnnouncements(s, now).filter((a) => !only || !!a.years === (only === 'class'))
  const school = getSchool(s.schoolId)
  if (list.length === 0) {
    return <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">Nothing from {alumniServices(s.schoolId)} yet. Announcements are rare: a reunion, a city meet-up.</p>
  }
  return (
    <div className="space-y-2.5">
      {list.map((a) => {
        const fresh = !s.readAnnouncements.includes(a.id)
        const keen = s.interestedIn.includes(a.id)
        const hasEvent = !!a.eventId && s.events.some((e) => e.id === a.eventId)
        return (
          <article key={a.id} data-tour="announcement" className={`rounded-2xl p-3.5 ring-1 ${fresh ? 'bg-vine-50 ring-vine-300' : 'bg-white ring-sage-200'}`}>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-vine-700">
              <Megaphone size={13} /> {announcementAudience(a)}
              {fresh && <span className="rounded-full bg-vine-700 px-1.5 py-0.5 text-[9.5px] font-bold text-cream">New</span>}
              <span className="ml-auto font-medium normal-case tracking-normal text-ink/45">{ago(a.at, now)}</span>
            </div>
            <h3 className="mt-1.5 font-display text-[17px] font-semibold leading-snug">{a.title}</h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink/75">{a.body}</p>
            <div className="mt-2.5 flex items-center gap-2 text-xs text-ink/55">
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md text-white" style={{ background: school.accent }}><GraduationCap size={13} /></span>
              From {alumniServices(a.schoolId)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {hasEvent && (
                <button onClick={() => { onLeave?.(); openEvent(a.eventId!)() }} className="flex items-center gap-1.5 rounded-full bg-vine-700 px-3.5 py-2 text-xs font-semibold text-cream"><CalendarDays size={14} /> See the event</button>
              )}
              <button
                onClick={() => { s.set({ interestedIn: keen ? s.interestedIn.filter((x) => x !== a.id) : [...s.interestedIn, a.id] }); if (!keen) s.say('Alumni Services will know you’re interested') }}
                aria-pressed={keen}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold ${keen ? 'border-vine-700 bg-vine-100 text-vine-800' : 'border-sage-200 bg-white text-vine-800'}`}
              >
                {keen ? <Check size={14} /> : <Hand size={14} />} {keen ? 'You’re interested' : 'I’m interested'}
              </button>
            </div>
          </article>
        )
      })}
      <p className="px-1 text-[11px] leading-relaxed text-ink/45">Announcements come from {alumniServices(s.schoolId)}, to a whole class or city, a few times a year. Nobody can reply to everyone.</p>
    </div>
  )
}

/**
 * What an announcement looks like when it arrives: a notification at the top of
 * the screen, the way a phone shows one. Tapping it opens the announcements. It
 * leaves by itself after a few seconds. Mocked: nothing is really pushed.
 */
export function PushBanner() {
  const push = useKudzu((s) => s.push)
  const set = useKudzu((s) => s.set)
  const nav = useNavigate()
  useEffect(() => {
    if (!push) return
    // during a walkthrough it stays until tapped, so nobody misses the step
    if (useKudzu.getState().tour) return
    const t = setTimeout(() => set({ push: null }), 7000)
    return () => clearTimeout(t)
  }, [push, set])
  return (
    <Portal>
      <AnimatePresence>
        {push && (
          <motion.button
            key={push.id}
            data-tour="push"
            onClick={() => { set({ push: null, openNews: true }); nav("/network") }}
            initial={{ y: -120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -120, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="pointer-events-auto absolute inset-x-2.5 top-2.5 z-50 rounded-[22px] bg-white/95 p-3 text-left shadow-2xl ring-1 ring-black/5 backdrop-blur"
            aria-label={`Notification from ${push.from}: ${push.title}`}
          >
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink/45">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-vine-700 text-cream"><Megaphone size={12} /></span>
              Kudzu <span className="ml-auto font-medium normal-case tracking-normal">now</span>
            </span>
            <span className="mt-1.5 block text-[14px] font-semibold leading-tight">{push.from}</span>
            <span className="block text-[14px] font-medium leading-snug">{push.title}</span>
            <span className="mt-0.5 block text-[13px] leading-snug text-ink/60" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{push.body}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </Portal>
  )
}
