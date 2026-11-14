import { useEffect, useState } from 'react'
import { Lock, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { Feedback } from '../types'
import { FEEDBACK_TAGS } from '../config/brand'
import { useKadzu } from '../store/useKadzu'
import { getUser } from '../services'
import { firstName } from '../lib/util'
import { Avatar, Button, Chip, Sheet, inputCls } from './ui'

/** Private post-chat check-in. Answers are never shown on anyone's profile. */
export default function CheckInSheet() {
  const checkin = useKadzu((s) => s.checkin)
  const set = useKadzu((s) => s.set)
  const submit = useKadzu((s) => s.submitFeedback)
  const other = checkin ? getUser(checkin.otherId) : undefined
  const [met, setMet] = useState<Feedback['met'] | null>(null)
  const [rating, setRating] = useState<'up' | 'down' | undefined>()
  const [tags, setTags] = useState<string[]>([])
  const [note, setNote] = useState('')

  useEffect(() => {
    if (checkin) { setMet(null); setRating(undefined); setTags([]); setNote('') }
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
              <div className="flex items-center gap-1 text-xs text-ink/55"><Lock size={12} /> Private. {name} will never see this.</div>
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

          <Button
            className="mt-5 w-full" disabled={!met}
            onClick={() => met && submit({ otherId: checkin.otherId, met, rating: met === 'yes' ? rating : undefined, tags: met === 'yes' ? tags : [], note }, checkin.msgId)}
          >
            Submit
          </Button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink/45">
            Feedback is used to improve matching and keep the community healthy. It never appears on profiles.
          </p>
        </>
      )}
    </Sheet>
  )
}
