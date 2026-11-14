import { useState } from 'react'
import { Check, UserPlus } from 'lucide-react'
import type { LastTalked, User } from '../types'
import { useKudzu } from '../store/useKudzu'
import { firstName } from '../lib/util'
import { isEstablished } from '../services'
import { Avatar, Sheet } from './ui'

const OPTIONS: { when: LastTalked; label: string; hint: string }[] = [
  { when: 'recent', label: 'In the past month', hint: 'Starts as a strong connection' },
  { when: 'months', label: 'A few months ago', hint: 'Starts as fading, with a nudge to catch up' },
  { when: 'year', label: 'Over a year ago', hint: 'Starts as resting, ready to pick up again' },
]

/**
 * "I know them": adds someone the user already knew outside the app.
 * Asking when they last talked dates the tie, so the leaf starts in the right state.
 */
export function KnowButton({ user, variant = 'pill' }: { user: User; variant?: 'pill' | 'link' }) {
  const [open, setOpen] = useState(false)
  // "in your network" means in your web, not merely matched
  const connected = useKudzu((s) => s.connections.some((c) => c.otherId === user.id && isEstablished(c)))
  const addKnown = useKudzu((s) => s.addKnown)
  const name = firstName(user.name)

  if (connected) {
    return variant === 'link' ? null : (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sage-100 px-3 py-1.5 text-xs font-semibold text-vine-700"><Check size={13} /> In your network</span>
    )
  }

  return (
    <>
      {variant === 'link' ? (
        <button onClick={() => setOpen(true)} className="w-full py-2 text-center text-[13px] font-semibold text-vine-700 underline underline-offset-4">
          I already know {name}
        </button>
      ) : (
        <button data-tour="know" onClick={() => setOpen(true)} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-vine-600 px-3 py-1.5 text-xs font-semibold text-vine-700 hover:bg-vine-50" aria-label={`I know ${user.name}`}>
          <UserPlus size={13} /> I know them
        </button>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title={`You know ${name}`}>
        <div className="flex items-center gap-3">
          <Avatar user={user} size={48} />
          <div className="text-sm text-ink/65">When did you two last talk? This sets where {name} starts in your network.</div>
        </div>
        <div className="mt-4 space-y-2">
          {OPTIONS.map((o) => (
            <button key={o.when} data-tour="know-when" onClick={() => { addKnown(user.id, o.when); setOpen(false) }} className="w-full rounded-2xl border border-sage-200 bg-white px-4 py-3 text-left hover:bg-sage-50">
              <div className="text-sm font-semibold">{o.label}</div>
              <div className="text-xs text-ink/55">{o.hint}</div>
            </button>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-ink/45">
          In the full app, {name} would be asked to confirm before you appear in each other’s networks.
        </p>
      </Sheet>
    </>
  )
}
