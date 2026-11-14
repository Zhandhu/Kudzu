import { useEffect, useMemo, useState } from 'react'
import { Coffee, Video } from 'lucide-react'
import type { User } from '../types'
import { useNow } from '../store/useKudzu'
import { sendProposal } from '../services'
import { DAY, HOUR, firstName, fmtTime, startOfDay } from '../lib/util'
import { Button, Chip, Sheet, inputCls } from './ui'

const PLACES = ['Vine & Bean Café, Midtown', 'Student Center coffee bar', 'A spot near your office', 'Video call']

/** Pick two or three times and a place, and send them as a coffee-chat proposal. */
export function ProposeSheet({ open, onClose, other, onSent }: { open: boolean; onClose: () => void; other: User; onSent?: () => void }) {
  const now = useNow()
  const options = useMemo(() => {
    const d0 = startOfDay(now)
    return [[1, 9], [2, 8.5], [3, 14], [4, 10], [5, 16], [7, 9.5]].map(([d, h]) => d0 + d * DAY + h * HOUR)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  const [slots, setSlots] = useState<number[]>([])
  const [place, setPlace] = useState(PLACES[0])
  useEffect(() => { if (open) setSlots([options[0], options[2]]) }, [open, options])
  const toggle = (t: number) => setSlots(slots.includes(t) ? slots.filter((x) => x !== t) : slots.length < 3 ? [...slots, t].sort() : slots)
  return (
    <Sheet open={open} onClose={onClose} title={`Coffee with ${firstName(other.name)}`}>
      <div className="mb-2 text-sm font-semibold">Pick 2–3 times that work for you</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((t) => (
          <button key={t} onClick={() => toggle(t)} className={`rounded-xl border px-3 py-2.5 text-left text-[13px] font-medium ${slots.includes(t) ? 'border-vine-700 bg-vine-700 text-cream' : 'border-sage-200 bg-white'}`} aria-pressed={slots.includes(t)}>
            {new Date(t).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            <div className="opacity-75">{fmtTime(t)}</div>
          </button>
        ))}
      </div>
      <div className="mb-2 mt-5 text-sm font-semibold">Where?</div>
      <div className="flex flex-wrap gap-2">
        {PLACES.map((p) => <Chip key={p} active={place === p} onClick={() => setPlace(p)}>{p === 'Video call' && <Video size={13} />}{p}</Chip>)}
      </div>
      <input className={`${inputCls} mt-3`} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Or type a place" aria-label="Place" />
      <Button
        variant="coffee" className="mt-5 w-full" disabled={slots.length < 2 || !place.trim()}
        onClick={() => { sendProposal(other.id, { slots, place: place.trim(), mode: place === 'Video call' ? 'virtual' : 'in-person' }); onClose(); onSent?.() }}
      >
        <Coffee size={17} /> Send proposal
      </Button>
      {slots.length < 2 && <p className="mt-2 text-center text-xs text-ink/50">Choose at least two times.</p>}
    </Sheet>
  )
}
