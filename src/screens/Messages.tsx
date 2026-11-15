import { useMemo, useState } from 'react'
import { ChevronRight, ClipboardCheck, Coffee, MessagesSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Conversation, User } from '../types'
import { useKudzu, useNow } from '../store/useKudzu'
import { dueCheckins, eventChatMessages, eventGuests, getUser, inSchool, incomingRequests, openEventChats, outgoingRequests, requestState } from '../services'
import { ago, firstName, fmtDateTime } from '../lib/util'
import { Avatar, EmptyState, SchoolChip } from '../components/ui'
import { TendrilIcon } from '../components/brand'
import { RequestsSheet } from '../components/RequestsSheet'

function preview(c: Conversation): string {
  const m = c.messages[c.messages.length - 1]
  if (!m) return ''
  const who = m.from === 'me' ? 'You: ' : ''
  if (m.thanks) return m.from === 'me' ? 'You sent a thank-you note' : 'Sent you a thank-you note'
  if (m.proposal) return m.proposal.acceptedSlot ? '☕ Coffee chat confirmed' : `${who}☕ Proposed a coffee chat`
  return who + (m.text ?? '')
}

/** The small cup on someone's picture: you are connected, and have not had a coffee chat yet. */
function CupMark({ done }: { done: boolean }) {
  const label = done ? 'You’ve had a coffee chat' : 'No coffee chat yet'
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-cream ${done ? 'border border-ink/30 bg-cream text-ink/40' : 'bg-coffee-500 text-cream'}`}
      title={label} role="img" aria-label={label} data-cup={done ? 'done' : 'todo'}
    >
      <Coffee size={11} strokeWidth={done ? 2 : 2.4} />
    </span>
  )
}

export default function Messages() {
  const s = useKudzu()
  const now = useNow()
  const convs = useMemo(
    () => s.conversations.filter((c) => inSchool(c.otherId, s.schoolId) && !s.blocked.includes(c.otherId)),
    [s.conversations, s.schoolId, s.blocked],
  )
  const fresh = convs.filter((c) => c.messages.length === 0)
  const threads = convs
    .filter((c) => c.messages.length > 0)
    .sort((a, b) => b.messages[b.messages.length - 1].at - a.messages[a.messages.length - 1].at)
  // Say hello: connected, and nothing said yet. That is all it takes to be listed here.
  const hello = fresh.map((c) => getUser(c.otherId)).filter((u): u is User => !!u)
  // A small cup marks anyone you have not had a coffee chat with, here and in the list below.
  // The cup on each picture: filled while you have not had a coffee chat with them, a grey outline once you have.
  const hadCoffee = new Set(s.connections.filter((c) => c.interactions.some((i) => i.type === 'coffee')).map((c) => c.otherId))
  const simple = s.experience === 'simple'
  // requests in both directions take the place event chats used to have here
  const incoming = simple ? [] : incomingRequests(s, now)
  const outgoing = simple ? [] : outgoingRequests(s, now)
  const waiting = outgoing.filter((r) => requestState(r, now) === 'pending').length
  const [requestsOpen, setRequestsOpen] = useState(false)
  const due = dueCheckins(s)
  const chats = openEventChats(s, now)

  return (
    <div className="app-scroll h-full overflow-y-auto">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <h1 className="font-display text-2xl font-semibold">Messages</h1>
        <SchoolChip />
      </header>

      {due.map((d) => {
        const u = getUser(d.otherId)
        if (!u) return null
        return (
          <button key={d.msgId} onClick={() => s.set({ checkin: d })} className="mx-4 mb-2 flex w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-coffee-100 p-3 text-left">
            <ClipboardCheck size={20} className="shrink-0 text-coffee-600" />
            <div className="flex-1 text-[13px]">
              <div className="font-semibold text-coffee-700">How was coffee with {firstName(u.name)}?</div>
              <div className="text-coffee-700/70">A 20-second private check-in</div>
            </div>
          </button>
        )
      })}

      {/* Requests, in both directions: people who asked you, and the ones you are waiting on.
          A request is the step before a conversation, so it sits at the top of this tab. */}
      {(incoming.length > 0 || outgoing.length > 0) && (
        <section className="px-4 pb-3">
          <h2 className="pb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Requests</h2>
          <button onClick={() => setRequestsOpen(true)} data-tour="requests" className="flex w-full items-center gap-3 rounded-2xl bg-vine-50 p-3 text-left ring-1 ring-vine-200">
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-vine-700"><TendrilIcon size={22} color="#faf6ee" />
              {incoming.length > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coffee-500 px-1 text-[10px] font-bold text-white ring-2 ring-cream">{incoming.length}</span>}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                {incoming.length > 0 ? `${incoming.length} ${incoming.length === 1 ? 'person' : 'people'} asked you for a chat` : `Waiting on ${waiting} ${waiting === 1 ? 'reply' : 'replies'}`}
              </span>
              <span className="block truncate text-[13px] text-ink/60">
                {incoming.length > 0 ? incoming.map((r) => firstName(getUser(r.fromId)?.name ?? '')).filter(Boolean).join(', ') : 'People you asked, and how long they have to answer'}
              </span>
              {incoming.length > 0 && outgoing.length > 0 && <span className="block text-[11px] text-vine-700">You’re waiting on {waiting} {waiting === 1 ? 'reply' : 'replies'}</span>}
            </span>
            <ChevronRight size={18} className="shrink-0 text-ink/30" />
          </button>
        </section>
      )}

      {/* The keep-in-touch app has no events tab, so its event chats stay here.
          In the full app they are a bubble on the events page. */}
      {simple && chats.length > 0 && (
        <section className="px-4 pb-3">
          <div className="pb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Event chats</div>
          <div className="space-y-2">
            {chats.map((e) => {
              const msgs = eventChatMessages(s, e, now)
              const last = msgs[msgs.length - 1]
              const who = last ? (last.from === 'me' ? 'You' : firstName(getUser(last.from)?.name ?? '')) : ''
              return (
                <Link key={e.id} to={`/event-chat/${e.id}`} className="flex items-center gap-3 rounded-2xl bg-vine-50 p-3 ring-1 ring-vine-200">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-vine-700 text-cream"><MessagesSquare size={20} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{e.title}</span>
                    <span className="block truncate text-[13px] text-ink/60">{last ? `${who}: ${last.text}` : 'Say hello to everyone going'}</span>
                    <span className="block text-[11px] text-vine-700">{eventGuests(e, s.me).length} going · {fmtDateTime(e.start)}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Say hello: people you are connected with and have not written to yet. Once anything
          has been said they are an ordinary conversation in the list below. */}
      {hello.length > 0 && (
        <section className="pb-2" data-tour="say-hello">
          <div className="flex items-baseline gap-2 px-4 pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/50">Say hello</h2>
            <span className="text-xs text-ink/45">Connected, and nothing said yet</span>
          </div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2 pt-1">
            {hello.map((u) => (
              <Link key={u.id} to={`/messages/${u.id}`} className="flex w-16 shrink-0 flex-col items-center gap-1" aria-label={`Say hello to ${u.name}`}>
                <span className="relative rounded-full p-0.5 ring-2 ring-coffee-500"><Avatar user={u} size={56} /><CupMark done={hadCoffee.has(u.id)} /></span>
                <span className="w-full truncate text-center text-xs font-medium">{firstName(u.name)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {threads.length === 0 && hello.length === 0 ? (
        <EmptyState title="No conversations yet" body="When someone accepts your request, or you accept theirs, the chat shows up here.">
          <Link to="/find" className="inline-flex items-center gap-2 rounded-full bg-vine-700 px-5 py-3 text-sm font-semibold text-cream"><Coffee size={16} /> Find people</Link>
        </EmptyState>
      ) : (
        <ul className="px-2">
          {threads.map((c) => {
            const u = getUser(c.otherId)
            if (!u) return null
            const last = c.messages[c.messages.length - 1]
            return (
              <li key={c.id}>
                <Link to={`/messages/${u.id}`} className="flex items-center gap-3 rounded-2xl px-2 py-3 hover:bg-sage-50">
                  <span className="relative shrink-0"><Avatar user={u} size={52} /><CupMark done={hadCoffee.has(u.id)} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`truncate ${c.unread ? 'font-bold' : 'font-semibold'}`}>{u.name}</span>
                      <span className="shrink-0 text-[11px] text-ink/45">{ago(last.at, now)}</span>
                    </div>
                    <div className={`truncate text-[13px] ${c.unread ? 'font-semibold text-ink' : 'text-ink/55'}`}>{s.typing[u.id] ? 'typing…' : preview(c)}</div>
                  </div>
                  {c.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-coffee-500" />}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      <RequestsSheet open={requestsOpen} onClose={() => setRequestsOpen(false)} incoming={incoming} outgoing={outgoing} />
    </div>
  )
}
