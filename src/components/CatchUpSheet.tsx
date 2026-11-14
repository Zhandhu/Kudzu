import { useState } from 'react'
import { MessageSquareText, Phone, Users } from 'lucide-react'
import type { CaughtUpHow, User } from '../types'
import { useKudzu } from '../store/useKudzu'
import { HOW_LABEL } from '../services'
import { firstName } from '../lib/util'
import { Button, Sheet, inputCls } from './ui'

const HOWS: { id: CaughtUpHow; icon: typeof Phone }[] = [
  { id: 'person', icon: Users },
  { id: 'call', icon: Phone },
  { id: 'text', icon: MessageSquareText },
]
const WHENS = [
  { label: 'Today', days: 0 },
  { label: 'This week', days: 3 },
  { label: 'Earlier this month', days: 14 },
]

/**
 * "We caught up": two taps to record a catch-up that happened outside the app.
 * Most of staying in touch is a call or a lunch, and without this the app would
 * show those ties as fading and keep reminding you to reach out.
 */
export function CatchUpSheet({ user, open, onClose, onLogged }: { user: User; open: boolean; onClose: () => void; onLogged?: () => void }) {
  const logCatchUp = useKudzu((s) => s.logCatchUp)
  const [how, setHow] = useState<CaughtUpHow>('call')
  const [days, setDays] = useState(0)
  const [note, setNote] = useState('')
  const name = firstName(user.name)
  return (
    <Sheet open={open} onClose={onClose} title={`You caught up with ${name}`}>
      <div className="mb-2 text-sm font-semibold">How?</div>
      <div className="grid grid-cols-3 gap-2">
        {HOWS.map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => setHow(id)} aria-pressed={how === id} className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-center text-[12.5px] font-semibold leading-tight ${how === id ? 'border-vine-700 bg-vine-700 text-cream' : 'border-sage-200 bg-white'}`}>
            <Icon size={20} /> {HOW_LABEL[id]}
          </button>
        ))}
      </div>
      <div className="mb-2 mt-5 text-sm font-semibold">When?</div>
      <div className="flex flex-wrap gap-2">
        {WHENS.map((w) => (
          <button key={w.label} onClick={() => setDays(w.days)} aria-pressed={days === w.days} className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold ${days === w.days ? 'border-vine-700 bg-vine-700 text-cream' : 'border-sage-200 bg-white'}`}>{w.label}</button>
        ))}
      </div>
      <input className={`${inputCls} mt-5`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="A note for yourself (optional)" aria-label="Note about the catch-up" maxLength={120} />
      <Button className="mt-5 w-full" onClick={() => { logCatchUp(user.id, how, days, note); setNote(''); onClose(); onLogged?.() }}>Log it</Button>
      <p className="mt-2 text-center text-xs text-ink/50">Only you see this. It keeps {name} from showing as someone you’ve lost touch with.</p>
    </Sheet>
  )
}
