import { useEffect, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, Lock, Send, Users } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { openEvent, useKudzu, useNow } from '../store/useKudzu'
import { EVENT_CHAT_CLOSES_DAYS, eventChatMessages, eventChatState, eventGuests, getUser, sendEventMessage } from '../services'
import { DAY, firstName, fmtDateTime, fmtTime } from '../lib/util'
import { Avatar, BackHeader, inputCls } from '../components/ui'
import { ProfilePopup } from '../components/ProfilePopup'

/**
 * The chat for one event, for the people going to it. It is small because the
 * event is, it has a reason to exist, and it closes a week after: it never
 * becomes a standing group. Tapping anyone opens their profile, which is how a
 * conversation here turns into one between two people.
 */
export default function EventChat() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const now = useNow()
  const s = useKudzu()
  const e = s.events.find((x) => x.id === id)
  const [text, setText] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const messages = e ? eventChatMessages(s, e, now) : []
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [messages.length])

  if (!e) return <><BackHeader title="Event chat" /><p className="p-8 text-center text-sm text-ink/60">This event is no longer available.</p></>
  const state = eventChatState(e, s.me, now)
  if (state === 'none' || state === 'toobig' || state === 'soon') {
    return (
      <>
        <BackHeader title={e.title} />
        <p className="p-8 text-center text-sm text-ink/60">
          {state === 'none' ? 'This chat is for people who are going. RSVP “Going” to join it.' : state === 'toobig' ? 'This event is too large for a chat.' : 'This chat opens three days before the event.'}
        </p>
      </>
    )
  }
  const open = state === 'open'
  const guests = eventGuests(e, s.me)
  const closesIn = Math.max(0, Math.ceil((e.start + EVENT_CHAT_CLOSES_DAYS * DAY - now) / DAY))
  const send = () => { const t = text.trim(); if (!t) return; setText(''); sendEventMessage(e, t) }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-2 border-b border-sage-200 bg-cream px-2 py-2.5">
        <button onClick={() => nav(-1)} className="rounded-full p-1.5 hover:bg-sage-100" aria-label="Back"><ChevronLeft size={22} /></button>
        <button onClick={openEvent(e.id)} className="min-w-0 flex-1 text-left">
          <div className="truncate font-semibold">{e.title}</div>
          <div className="flex items-center gap-2 truncate text-xs text-ink/55">
            <span className="flex items-center gap-1"><Users size={12} /> {guests.length} going</span>
            <span className="flex items-center gap-1"><CalendarDays size={12} /> {fmtDateTime(e.start)}</span>
          </div>
        </button>
        <div className="flex -space-x-2 pr-1">{guests.slice(0, 3).map((g) => <Avatar key={g.id} user={g} size={26} ring />)}</div>
      </header>

      <div className="app-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
        <p className="mx-auto max-w-[88%] rounded-2xl bg-sage-100 px-3.5 py-2.5 text-center text-[12.5px] leading-snug text-ink/65">
          Only people going to this event are here. {open ? `The chat closes ${closesIn <= 1 ? 'tomorrow' : `in ${closesIn} days`}, a week after the event.` : 'The chat has closed.'} To keep talking with someone, tap their picture.
        </p>
        {messages.map((m) => {
          const mine = m.from === 'me'
          const u = mine ? s.me : getUser(m.from)
          if (!u) return null
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && <button onClick={() => setPicked(u.id)} aria-label={`${u.name}’s profile`}><Avatar user={u} size={30} /></button>}
              <div className="max-w-[76%]">
                {!mine && <div className="mb-0.5 ml-1 text-[11px] font-semibold text-ink/55">{firstName(u.name)} <span className="font-normal text-ink/40">· {new Date(m.at).toLocaleDateString('en-US', { weekday: 'short' })} {fmtTime(m.at)}</span></div>}
                <div className={`rounded-2xl px-3.5 py-2 text-[14.5px] leading-snug ${mine ? 'rounded-br-md bg-vine-700 text-cream' : 'rounded-bl-md bg-white ring-1 ring-sage-200'}`}>{m.text}</div>
              </div>
            </div>
          )
        })}
        {messages.length === 0 && <p className="pt-6 text-center text-sm text-ink/50">Nobody has said anything yet. Say hello.</p>}
        <div ref={endRef} />
      </div>

      {open ? (
        <form onSubmit={(ev) => { ev.preventDefault(); send() }} className="flex items-center gap-2 border-t border-sage-200 bg-cream px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5">
          <input className={`${inputCls} !rounded-full`} placeholder="Message everyone going" value={text} onChange={(ev) => setText(ev.target.value)} aria-label="Message everyone going" />
          <button type="submit" disabled={!text.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vine-700 text-cream disabled:opacity-40" aria-label="Send"><Send size={17} /></button>
        </form>
      ) : (
        <div className="flex items-center justify-center gap-2 border-t border-sage-200 bg-sage-100 px-4 py-3.5 text-[13px] font-medium text-ink/60"><Lock size={14} /> This chat closed a week after the event. Tap someone’s picture to message them.</div>
      )}

      <ProfilePopup userId={picked} onClose={() => setPicked(null)} />
    </div>
  )
}
