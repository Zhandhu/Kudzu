import { AnimatePresence, motion } from 'framer-motion'
import { Coffee, MessageCircle, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Nudge } from '../types'
import { useKudzu, useNow } from '../store/useKudzu'
import { computeNudges, getUser } from '../services'
import { Avatar, Sheet } from './ui'

/** One person to catch up with: who, why now, and a button that opens the chat with a first line written. */
function NudgeCard({ n, onGo }: { n: Nudge; onGo: () => void }) {
  const nav = useNavigate()
  const dismiss = useKudzu((s) => s.dismissNudge)
  const u = getUser(n.otherId)
  if (!u) return null
  const go = () => {
    dismiss(n.id)
    onGo()
    nav(n.action === 'coffee' ? `/messages/${u.id}?coffee=1` : `/messages/${u.id}?draft=${encodeURIComponent(n.draft ?? '')}`)
  }
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40 }} className="rounded-2xl border border-sage-200 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar user={u} size={36} />
        <div className="min-w-0 flex-1 pt-0.5 text-[13.5px] leading-snug">{n.text}</div>
        <button onClick={() => dismiss(n.id)} className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-ink/40 hover:bg-sage-100" aria-label="Dismiss"><X size={16} /></button>
      </div>
      <div className="mt-2 flex gap-2 pl-12">
        <button onClick={go} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${n.action === 'coffee' ? 'bg-coffee-500 text-cream' : 'bg-vine-700 text-cream'}`}>
          {n.action === 'coffee' ? <><Coffee size={14} /> Propose coffee</> : <><MessageCircle size={14} /> Message</>}
        </button>
        <button onClick={() => dismiss(n.id)} className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink/50 hover:bg-sage-100">Not now</button>
      </div>
    </motion.div>
  )
}

/**
 * Who to catch up with, and why now. Catch-ups the user planned come first, then
 * timely reasons to say hello, then ties that have gone quiet. Opened from the
 * Catch up box on Messages.
 */
export function ReachOutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useKudzu()
  const now = useNow()
  const nudges = computeNudges(s, now)
  return (
    <Sheet open={open} onClose={onClose} title="Catch up">
      {nudges.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink/55">You’re all caught up. Nobody is waiting to hear from you.</p>
      ) : (
        <div className="space-y-2">
          <p className="mb-1 text-[13px] text-ink/60">Catch-ups you planned come first, then timely reasons to say hello, then ties that have gone quiet.</p>
          <AnimatePresence initial={false}>{nudges.map((n) => <NudgeCard key={n.id} n={n} onGo={onClose} />)}</AnimatePresence>
        </div>
      )}
    </Sheet>
  )
}
