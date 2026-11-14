import { useEffect, useState } from 'react'
import { Check, HeartHandshake, Lock, Repeat, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { Feedback } from '../types'
import { FEEDBACK_TAGS } from '../config/brand'
import { useKudzu } from '../store/useKudzu'
import { RHYTHMS, getUser, submitCheckin } from '../services'
import { firstName } from '../lib/util'
import { Avatar, Button, Chip, Sheet, inputCls } from './ui'

const STARTERS = [
  'Thank you for making the time.',
  'Your advice changed what I’ll do next.',
]

/** Private post-chat check-in. Answers are never shown on anyone's profile. */
export default function CheckInSheet() {
  const checkin = useKudzu((s) => s.checkin)
  const set = useKudzu((s) => s.set)
  const other = checkin ? getUser(checkin.otherId) : undefined
  const [met, setMet] = useState<Feedback['met'] | null>(null)
  const [rating, setRating] = useState<'up' | 'down' | undefined>()
  const [tags, setTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [thanks, setThanks] = useState('')
  const [rhythm, setRhythm] = useState<number | undefined>()

  useEffect(() => {
    if (!checkin) return
    setMet(null); setRating(undefined); setTags([]); setNote(''); setThanks('')
    // keep any rhythm already chosen for this person
    setRhythm(useKudzu.getState().connections.find((c) => c.otherId === checkin.otherId)?.rhythmDays)
  }, [checkin])

  const name = other ? firstName(other.name) : ''
  const h = 'mb-2 mt-5 text-sm font-semibold'

  return (
    <Sheet open={!!checkin && !!other} onClose={() => set({ checkin: null })} title="How did it go?">
      {other && checkin && (
        <>
          <div className="flex items-center gap-3">
            <Avatar user={other} size={48} />
            <div>
              <div className="font-semibold">Your coffee chat with {name}</div>
              <div className="flex items-center gap-1 text-xs text-ink/55"><Lock size={12} /> Private. {name} won’t see your answers.</div>
            </div>
          </div>

          <div className={h}>Did you meet?</div>
          <div className="flex flex-wrap gap-2">
            {([['yes', 'Yes'], ['noshow', 'They didn’t show'], ['rescheduled', 'Rescheduled']] as const).map(([v, label]) => (
              <Chip key={v} active={met === v} onClick={() => setMet(v)}>{label}</Chip>
            ))}
          </div>

          {met === 'yes' && (
            <>
              <div className={h}>How was it?</div>
              <div className="flex gap-3">
                {([['up', ThumbsUp, 'Good'], ['down', ThumbsDown, 'Not great']] as const).map(([v, Icon, label]) => (
                  <button
                    key={v}
                    onClick={() => setRating(v)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-semibold ${rating === v ? 'border-vine-700 bg-vine-700 text-cream' : 'border-sage-200 bg-white'}`}
                    aria-pressed={rating === v}
                  >
                    <Icon size={20} /> {label}
                  </button>
                ))}
              </div>

              <div className={h}>Anything stand out? <span className="font-normal text-ink/45">Optional</span></div>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TAGS.map((t) => (
                  <Chip key={t} tone="plain" active={tags.includes(t)} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>{t}</Chip>
                ))}
              </div>
            </>
          )}

          <div className={h}>Private note <span className="font-normal text-ink/45">Optional</span></div>
          <textarea className={`${inputCls} h-20 resize-none`} placeholder="Only our team sees this." value={note} onChange={(e) => setNote(e.target.value)} />

          {met === 'yes' && rating !== 'down' && (
            <div className="mt-5 rounded-2xl border border-coffee-200 bg-coffee-100/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-coffee-700"><HeartHandshake size={17} /> Send {name} a thank-you</div>
              <p className="mt-1 text-xs leading-relaxed text-ink/60">
                This is the only part {name} will see. One line about what helped is what makes people glad they said yes.
              </p>
              <textarea
                className={`${inputCls} mt-3 h-20 resize-none`}
                placeholder={`Thanks for… It helped me…`}
                value={thanks}
                onChange={(e) => setThanks(e.target.value)}
                aria-label={`Thank-you note to ${name}`}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {STARTERS.map((st) => (
                  <Chip key={st} small tone="plain" onClick={() => setThanks(st)}>{st}</Chip>
                ))}
              </div>
            </div>
          )}

          {met === 'yes' && rating !== 'down' && (
            <div className="mt-4 rounded-2xl border border-vine-200 bg-vine-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-vine-800"><Repeat size={16} /> What next with {name}?</div>
              <p className="mt-1 text-xs leading-relaxed text-ink/60">
                {name} is now in your web. One good chat is a start. Pick how you’d like to keep in touch and we’ll remind you when it’s time.
              </p>
              <div className="mt-3 space-y-2">
                {RHYTHMS.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => setRhythm(r.days)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium ${rhythm === r.days ? 'border-vine-700 bg-vine-700 text-cream' : 'border-sage-200 bg-white'}`}
                    aria-pressed={rhythm === r.days}
                  >
                    {r.label}
                    {rhythm === r.days && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            className="mt-5 w-full" disabled={!met}
            onClick={() => met && submitCheckin({ otherId: checkin.otherId, met, rating: met === 'yes' ? rating : undefined, tags: met === 'yes' ? tags : [], note }, checkin.msgId, rating === 'down' ? '' : thanks, rhythm)}
          >
            {met === 'yes' && rating !== 'down' && thanks.trim() ? 'Submit and send thank-you' : 'Submit'}
          </Button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink/45">
            Your answers above the thank-you are used to improve who we suggest and keep the community healthy. They never appear on profiles.
          </p>
        </>
      )}
    </Sheet>
  )
}
