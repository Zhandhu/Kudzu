import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, Check, ChevronLeft, Coffee, HeartHandshake, MapPin, Send, Video, X } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Message, Mode, User } from '../types'
import { useKudzu, useNow } from '../store/useKudzu'
import { acceptTheirProposal, getUser, matchInfo, promptText, sendText, strengthOf } from '../services'
import { firstName, fmtDateTime } from '../lib/util'
import { LeafIcon, Tendril } from '../components/brand'
import { Avatar, Button, Chip, inputCls } from '../components/ui'
import { MoreMenu } from '../components/ProfileView'
import { ProposeSheet } from '../components/ProposeSheet'

/** First-message suggestions, which differ by the soft role of the match. */
function openers(mode: Mode, other: User): string[] {
  const name = firstName(other.name)
  if (mode === 'learn') return [`Hi ${name}! I’d love to hear how you got into ${other.industry.toLowerCase()}.`, 'What do you wish you’d known at my stage?']
  if (mode === 'give') return [`Hi ${name}! Happy to help. What’s on your mind?`, 'Ask me anything. I was in your spot not long ago.']
  return [`Hi ${name}! Want to compare notes?`, 'How are you approaching this semester?']
}

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
  // A coffee button elsewhere brings you here to talk. Proposing a chat stays your choice:
  // the sheet never opens by itself. A bubble points at the button the first time,
  // and again whenever you arrive from a coffee button.
  const [proposing, setProposing] = useState(false)
  const hintSeen = useKudzu((s) => s.coffeeHintSeen)
  const [hint, setHint] = useState(!hintSeen || params.get('coffee') === '1')
  const endRef = useRef<HTMLDivElement>(null)
  const closeHint = () => { setHint(false); useKudzu.getState().set({ coffeeHintSeen: true }) }

  useEffect(() => { if (other) ensureConversation(id) }, [id, other, ensureConversation])
  useEffect(() => { if (params.has('draft') || params.has('coffee')) setParams({}, { replace: true }) }, [params, setParams])
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

      <div className="app-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 pb-20 pt-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center px-6 pt-10 text-center">
            <Tendril animate />
            <p className="mt-3 font-display text-lg font-semibold">You’re connected with {firstName(other.name)}</p>
            <p className="mt-1 text-sm text-ink/55">{info.reason}. Say hello. When you’re ready, the cup at the bottom right proposes a coffee chat.</p>
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

      {/* the coffee button sits at the bottom right, just above the message box */}
      <div className="relative">
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
          <AnimatePresence>
            {hint && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1, transition: { delay: 0.4 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }}
                className="relative flex items-center gap-1.5 rounded-2xl bg-ink py-2 pl-3 pr-1.5 text-[12.5px] font-medium text-cream shadow-lg"
                role="status"
              >
                You can propose a coffee chat
                <button onClick={closeHint} className="rounded-full p-1 text-cream/70" aria-label="Dismiss tip"><X size={13} /></button>
                <span className="absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-ink" aria-hidden />
              </motion.div>
            )}
          </AnimatePresence>
          <button type="button" onClick={() => { closeHint(); setProposing(true) }} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coffee-500 text-cream shadow-lg" aria-label="Propose a coffee chat"><Coffee size={21} /></button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex items-center gap-2 border-t border-sage-200 bg-cream px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5">
        <input className={`${inputCls} !rounded-full`} placeholder={`Message ${firstName(other.name)}`} value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" />
        <button type="submit" disabled={!text.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vine-700 text-cream disabled:opacity-40" aria-label="Send"><Send size={17} /></button>
      </form>

      <ProposeSheet open={proposing} onClose={() => setProposing(false)} other={other} />
    </div>
  )
}
