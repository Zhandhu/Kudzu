import { AnimatePresence, motion } from 'framer-motion'
import { Coffee, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useKadzu } from '../store/useKadzu'
import { getUser, greetAfterMatch } from '../services'
import { firstName } from '../lib/util'
import { Avatar, Button, Portal } from './ui'

export default function MatchCelebration() {
  const matchWith = useKadzu((s) => s.matchWith)
  const me = useKadzu((s) => s.me)
  const set = useKadzu((s) => s.set)
  const nav = useNavigate()
  const other = matchWith ? getUser(matchWith) : undefined

  const close = (to?: string) => {
    if (matchWith) greetAfterMatch(matchWith)
    set({ matchWith: null })
    if (to) nav(to)
  }

  return (
    <Portal>
      <AnimatePresence>
        {other && (
          <motion.div
            className="pointer-events-auto absolute inset-0 z-50 flex flex-col items-center justify-center bg-vine-800 px-8 text-center text-cream"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-xs font-semibold uppercase tracking-[0.25em] text-vine-200">
              It’s a match
            </motion.p>

            <div className="relative mt-8 flex h-32 w-full max-w-[280px] items-center justify-between">
              <svg className="absolute inset-0" viewBox="0 0 280 128" fill="none" aria-hidden>
                <motion.path
                  d="M52 64c30-46 58-46 88 0s58 46 88 0"
                  stroke="#bfd5ba" strokeWidth="2" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.200, delay: 0.300, ease: 'easeInOut' }}
                />
                {[[96, 34, -30], [140, 64, 20], [184, 94, -20]].map(([x, y, r], i) => (
                  <motion.path
                    key={i}
                    d="M0 0c2-7 7-10 13-10-1 7-6 11-13 10z"
                    fill="#94b98d"
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.700 + i * 0.250 }}
                    style={{ x, y, rotate: r, originX: 0, originY: 0 }}
                  />
                ))}
              </svg>
              <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', delay: 0.100 }} className="relative">
                <Avatar user={me} size={92} ring />
              </motion.div>
              <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', delay: 0.100 }} className="relative">
                <Avatar user={other} size={92} ring />
              </motion.div>
            </div>

            <motion.h2 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.900 }} className="mt-8 font-display text-[26px] font-semibold leading-tight">
              You and {firstName(other.name)} both want to grab coffee ☕
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.100 }} className="mt-2 text-sm text-vine-100">
              {other.title}{other.company ? ` at ${other.company}` : ''} · Class of {other.gradYear}
            </motion.p>

            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.300 }} className="mt-10 flex w-full flex-col gap-3">
              <Button variant="coffee" onClick={() => close(`/messages/${other.id}?propose=1`)}><Coffee size={17} /> Propose a coffee chat</Button>
              <Button variant="secondary" onClick={() => close(`/messages/${other.id}`)}><MessageCircle size={17} /> Send a message</Button>
              <button onClick={() => close()} className="py-2 text-sm font-medium text-vine-100">Keep browsing</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  )
}
