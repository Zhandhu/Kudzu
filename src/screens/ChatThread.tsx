import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarCheck, Check, ChevronLeft, Coffee, HeartHandshake, MapPin, Send, Video } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Message, Mode, User } from '../types'
import { useKudzu, useNow } from '../store/useKudzu'
import { acceptTheirProposal, getUser, matchInfo, promptText, sendProposal, sendText, strengthOf } from '../services'
import { DAY, HOUR, firstName, fmtDateTime, fmtTime, startOfDay } from '../lib/util'
import { LeafIcon, Tendril } from '../components/brand'
import { Avatar, Button, Chip, Sheet, inputCls } from '../components/ui'
import { MoreMenu } from '../components/ProfileView'

/** First-message suggestions, which differ by the soft role of the match. */
function openers(mode: Mode, other: User): string[] {
  const name = firstName(other.name)
  if (mode === 'learn') return [`Hi ${name}! I’d love to hear how you got into ${other.industry.toLowerCase()}.`, 'What do you wish you’d known at my stage?']
  if (mode === 'give') return [`Hi ${name}! Happy to help. What’s on your mind?`, 'Ask me anything. I was in your spot not long ago.']
  return [`Hi ${name}! Want to compare notes?`, 'How are you approaching this semester?']
}

const PLACES = ['Vine & Bean Café, Midtown', 'Student Center coffee bar', 'A spot near your office', 'Video call']

function ProposalCard({ m, other, now }: { m: Message; other: User; now: number }) {
  const set = useKudzu((s) => s.set)
  const p = m.proposal!
  const mine = m.from === 'me'
  const name = firstName(other.name)
  const Mode = p.mode === 'virtual' ? Video : MapPin

  if (p.acceptedSlot) {
    const past = p.acceptedSlot < now
    return (
      <div className="mx-auto w-[88%] overflow-hidden rounded-2xl border border-vine-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-vine-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cream">
          <CalendarCheck size={14} /> {p.checkedIn ? 'Coffee chat completed' : 'Coffee chat confirmed'}
        </div>
        <div className="space-y-1.5 px-4 py-3 text-sm">
          <div className="font-display text-lg font-semibold">{fmtDateTime(p.acceptedSlot)}</div>
          <div className="flex items-center gap-1.5 text-ink/70"><Mode size={14} /> {p.place}</div>
          {p.checkedIn ? (
            <div className="flex items-center gap-1.5 pt-1 text-[13px] font-medium text-vine-600"><Check size={14} /> Check-in submitted</div>
          ) : past ? (
            <Button variant="coffee" className="mt-2 w-full !py-2.5" onClick={() => set({ checkin: { otherId: other.id, msgId: m.id } })}>How did it go?</Button>
          ) : (
            <div className="pt-1 text-[13px] text-ink/50">We’ll check in with you afterwards.</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-[88%] rounded-2xl border border-coffee-200 bg-coffee-100/60 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-coffee-700"><Coffee size={16} /> {mine ? 'You proposed a coffee chat' : `${name} proposed a coffee chat`}</div>
      <div className="mt-1 flex items-center gap-1.5 text-[13px] text-ink/65"><Mode size={13} /> {p.place}</div>
      <div className="mt-3 space-y-2">
        {p.slots.map((slot) =>
          mine ? (
            <div key={slot} className="rounded-xl border border-coffee-200 bg-white px-3 py-2 text-sm">{fmtDateTime(slot)}</div>
          ) : (
            <button key={slot} onClick={() => acceptTheirProposal(other.id, m.id, slot)} className="flex w-full items-center justify-between rounded-xl border border-coffee-300 bg-white px-3 py-2.5 text-sm font-medium hover:bg-coffee-100">
              {fmtDateTime(slot)} <span className="text-xs font-semibold text-coffee-600">Accept</span>
            </button>
          ),
        )}
      </div>
      <div className="mt-2 text-xs text-ink/50">{mine ? `Waiting for ${name} to pick a time…` : 'Tap a time to confirm.'}</div>
    </div>
  )
}

function ProposeSheet({ open, onClose, other }: { open: boolean; onClose: () => void; other: User }) {
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
        onClick={() => { sendProposal(other.id, { slots, place: place.trim(), mode: place === 'Video call' ? 'virtual' : 'in-person' }); onClose() }}
      >
        <Coffee size={17} /> Send proposal
      </Button>
      {slots.length < 2 && <p className="mt-2 text-center text-xs text-ink/50">Choose at least two times.</p>}
    </Sheet>
  )
}

export default function ChatThread() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()
  const now = useNow()
  const other = getUser(id)
  const conv = useKudzu((s) => s.conversations.find((c) => c.otherId === id))
  const connection = useKudzu((s) => s.connections.find((c) => c.otherId === id))
  const typing = useKudzu((s) => !!s.typing[id])
  const me = useKudzu((s) => s.me)
  const { ensureConversation, markRead } = useKudzu.getState()
  const [text, setText] = useState(params.get('draft') ?? '')
  const [proposing, setProposing] = useState(params.get('propose') === '1')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (other) ensureConversation(id) }, [id, other, ensureConversation])
  useEffect(() => { if (params.has('draft') || params.has('propose')) setParams({}, { replace: true }) }, [params, setParams])
  useEffect(() => {
    markRead(id)
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [conv?.messages.length, typing, id, markRead])

  if (!other) return <div className="p-8 text-center text-sm text-ink/60">This conversation is no longer available.</div>
  const messages = conv?.messages ?? []
  const info = matchInfo(me, other)
  const strength = connection ? strengthOf(connection, now).level : null

  const send = () => {
    const t = text.trim()
    if (!t) return
    setText('')
    sendText(id, t)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-sage-200 bg-cream px-2 py-2.5">
        <button onClick={() => nav(-1)} className="rounded-full p-1.5 hover:bg-sage-100" aria-label="Back"><ChevronLeft size={22} /></button>
        <Link to={`/u/${other.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
          <Avatar user={other} size={38} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate font-semibold">{other.name} {strength && <LeafIcon level={strength} size={14} />}</div>
            <div className="truncate text-xs text-ink/55">{other.title}{other.company ? ` @ ${other.company}` : ''}</div>
          </div>
        </Link>
        <MoreMenu user={other} onBlocked={() => nav('/messages')} />
      </header>

      <div className="app-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center px-6 pt-10 text-center">
            <Tendril animate />
            <p className="mt-3 font-display text-lg font-semibold">You matched with {firstName(other.name)}</p>
            <p className="mt-1 text-sm text-ink/55">{info.reason}. Say hello, or skip the small talk and propose a coffee chat.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {openers(info.mode, other).map((q) => (
                <Chip key={q} tone="plain" onClick={() => sendText(id, q)}>{q}</Chip>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => {
          if (m.proposal) return <ProposalCard key={m.id} m={m} other={other} now={now} />
          const mine = m.from === 'me'
          if (m.thanks) {
            return (
              <div key={m.id} className="mx-auto w-[88%] rounded-2xl border border-coffee-200 bg-coffee-100/70 p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-coffee-700">
                  <HeartHandshake size={14} /> {mine ? `You thanked ${firstName(other.name)}` : `${firstName(other.name)} sent you a thank-you`}
                </div>
                <p className="mt-2 font-display text-[16.5px] leading-snug">“{m.text}”</p>
              </div>
            )
          }
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[14.5px] leading-snug ${mine ? 'rounded-br-md bg-vine-700 text-cream' : 'rounded-bl-md bg-white ring-1 ring-sage-200'}`}>
                {m.promptId && (
                  <div className={`mb-1.5 rounded-lg px-2.5 py-1.5 text-xs ${mine ? 'bg-white/15' : 'bg-sage-100'}`}>
                    <div className="font-semibold opacity-80">{promptText(m.promptId)}</div>
                    <div className="opacity-90">{(mine ? other : getUser('me'))?.prompts.find((p) => p.promptId === m.promptId)?.answer}</div>
                  </div>
                )}
                {m.text}
              </div>
            </div>
          )
        })}
        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 ring-1 ring-sage-200">
              {[0, 1, 2].map((i) => <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-ink/50" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex items-center gap-2 border-t border-sage-200 bg-cream px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5">
        <button type="button" onClick={() => setProposing(true)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coffee-100 text-coffee-600" aria-label="Propose a coffee chat"><Coffee size={19} /></button>
        <input className={`${inputCls} !rounded-full`} placeholder={`Message ${firstName(other.name)}`} value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" />
        <button type="submit" disabled={!text.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vine-700 text-cream disabled:opacity-40" aria-label="Send"><Send size={17} /></button>
      </form>

      <ProposeSheet open={proposing} onClose={() => setProposing(false)} other={other} />
    </div>
  )
}
