import { useEffect, useMemo, useState } from 'react'
import { CalendarCheck, CalendarPlus, Coffee, Video } from 'lucide-react'
import type { User } from '../types'
import { useKudzu, useNow } from '../store/useKudzu'
import { hasCalendar, sendProposal, slotOptions } from '../services'
import { firstName, fmtTime } from '../lib/util'
import { Button, Chip, Sheet, inputCls } from './ui'

const PLACES = ['Vine & Bean Café, Midtown', 'Student Center coffee bar', 'A spot near your office', 'Video call']
const CALENDARS = ['Google', 'Outlook', 'Apple']

/**
 * Pick two or three times and a place, and send them as a coffee-chat proposal.
 * With a calendar linked (mocked), times that work for both people come first
 * and are picked for you. `replaces` is the id of their proposal that this answers.
 */
export function ProposeSheet({ open, onClose, other, replaces }: { open: boolean; onClose: () => void; other: User; replaces?: string }) {
  const now = useNow()
  const connected = useKudzu((s) => s.calendarConnected)
  const set = useKudzu((s) => s.set)
  const say = useKudzu((s) => s.say)
  const name = firstName(other.name)
  const theirs = hasCalendar(other.id)
  const options = useMemo(
    () => slotOptions(now, other.id, connected).slice(0, 6),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, connected, other.id],
  )
  const [slots, setSlots] = useState<number[]>([])
  const [place, setPlace] = useState(PLACES[0])
  // start with the two best times: the first that are free for both
  useEffect(() => { if (open) setSlots(options.slice(0, 2).map((o) => o.t).sort()) }, [open, options])
  const toggle = (t: number) => setSlots(slots.includes(t) ? slots.filter((x) => x !== t) : slots.length < 3 ? [...slots, t].sort() : slots)

  return (
    <Sheet open={open} onClose={onClose} title={replaces ? `Other times for ${name}` : `Coffee with ${name}`}>
      {connected ? (
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-vine-100 px-3 py-2.5 text-[12.5px] leading-snug text-vine-800">
          <CalendarCheck size={16} className="mt-0.5 shrink-0" />
          <span>
            {theirs ? `Checked against your calendar and ${name}’s. Times you’re both free come first.` : `Checked against your calendar. ${name} hasn’t linked one, so these are times you’re free.`}
          </span>
        </div>
      ) : (
        <div className="mb-3 rounded-xl border border-sage-200 bg-white p-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold"><CalendarPlus size={16} className="text-vine-700" /> Link your calendar to find times you’re both free</div>
          <div className="mt-2 flex gap-2">
            {CALENDARS.map((c) => (
              <button key={c} onClick={() => { set({ calendarConnected: true }); say(`${c} Calendar linked`) }} className="flex-1 rounded-full border border-sage-200 py-1.5 text-xs font-semibold text-vine-800">{c}</button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-2 text-sm font-semibold">Pick 2–3 times that work for you</div>
      <div className="grid grid-cols-2 gap-2">
        {options.map(({ t, meBusy, themBusy }) => {
          const on = slots.includes(t)
          const note = !connected ? null : meBusy ? 'You’re busy' : themBusy ? `${name} is busy` : theirs ? 'Both free' : 'You’re free'
          const clash = meBusy || themBusy
          return (
            <button key={t} onClick={() => toggle(t)} className={`rounded-xl border px-3 py-2.5 text-left text-[13px] font-medium ${on ? 'border-vine-700 bg-vine-700 text-cream' : 'border-sage-200 bg-white'} ${clash && !on ? 'opacity-60' : ''}`} aria-pressed={on}>
              {new Date(t).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              <div className="opacity-75">{fmtTime(t)}</div>
              {note && <div className={`mt-0.5 text-[11px] font-semibold ${on ? 'text-vine-100' : clash ? 'text-coffee-600' : 'text-vine-600'}`}>{note}</div>}
            </button>
          )
        })}
      </div>
      <div className="mb-2 mt-5 text-sm font-semibold">Where?</div>
      <div className="flex flex-wrap gap-2">
        {PLACES.map((p) => <Chip key={p} active={place === p} onClick={() => setPlace(p)}>{p === 'Video call' && <Video size={13} />}{p}</Chip>)}
      </div>
      <input className={`${inputCls} mt-3`} value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Or type a place" aria-label="Place" />
      <Button
        variant="coffee" className="mt-5 w-full" disabled={slots.length < 2 || !place.trim()}
        onClick={() => { sendProposal(other.id, { slots, place: place.trim(), mode: place === 'Video call' ? 'virtual' : 'in-person' }, replaces); onClose() }}
      >
        <Coffee size={17} /> {replaces ? 'Send these times' : 'Send proposal'}
      </Button>
      {slots.length < 2 && <p className="mt-2 text-center text-xs text-ink/50">Choose at least two times.</p>}
    </Sheet>
  )
}
