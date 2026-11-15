import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, Compass, Footprints, Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { APP_NAME } from '../config/brand'
import { useKudzu } from '../store/useKudzu'
import { Logo } from './brand'
import { Portal } from './ui'

/**
 * The first thing a visitor sees, over the welcome screen and before sign-up: would
 * they like to be shown round, and if so, briefly or in full. Either way the guide
 * begins with sign-up and then follows whichever app they choose there.
 * Offered once. Resetting the demo offers it again.
 */
export function TourOffer() {
  const show = useKudzu((s) => !s.onboarded && !s.tourOffered && !s.tour)
  const set = useKudzu((s) => s.set)
  const startTour = useKudzu((s) => s.startTour)
  const nav = useNavigate()
  const begin = (tourDepth: 'quick' | 'full') => { set({ tourDepth }); startTour('signup'); nav('/') }
  const options = [
    { depth: 'quick' as const, icon: Rocket, title: 'Quick walkthrough', sub: 'About four minutes: signing up and the main ideas. Then explore on your own.' },
    { depth: 'full' as const, icon: Footprints, title: 'Full tutorial', sub: 'About ten minutes. You try every part yourself, starting with sign-up.' },
  ]
  return (
    <Portal>
      <AnimatePresence>
        {show && (
          <motion.div className="pointer-events-auto absolute inset-0 z-[55] flex items-center bg-black/50 px-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full rounded-3xl bg-cream p-5 shadow-2xl" role="dialog" aria-label={`Welcome to ${APP_NAME}`}>
              <Logo size={28} />
              <h2 className="mt-3 font-display text-[24px] font-semibold leading-tight">Would you like a walkthrough?</h2>
              <p className="mt-1.5 text-[14px] leading-snug text-ink/70">{APP_NAME} is a way for alumni of the same school to stay in touch with each other, and for students to reach them.</p>
              <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-snug text-vine-800"><BadgeCheck size={16} className="mt-0.5 shrink-0" /> Every member is a verified student or graduate of the school.</p>
              <div className="mt-4 space-y-2">
                {options.map(({ depth, icon: Icon, title, sub }) => (
                  <button key={depth} onClick={() => begin(depth)} className="flex w-full items-center gap-3 rounded-2xl bg-vine-700 p-3.5 text-left text-cream">
                    <Icon size={20} className="shrink-0" />
                    <span><span className="block text-[15px] font-semibold leading-tight">{title}</span><span className="block text-xs text-vine-100">{sub}</span></span>
                  </button>
                ))}
                <button onClick={() => set({ tourOffered: true })} className="flex w-full items-center gap-3 rounded-2xl border border-sage-200 bg-white p-3.5 text-left">
                  <Compass size={20} className="shrink-0 text-vine-700" />
                  <span><span className="block text-[15px] font-semibold leading-tight">No thanks, I’ll look around</span><span className="block text-xs text-ink/55">Everything works. Sign up, or skip it.</span></span>
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
