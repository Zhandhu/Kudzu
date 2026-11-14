import { useMemo } from 'react'
import { ClipboardCheck, Coffee } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Conversation } from '../types'
import { useKudzu, useNow } from '../store/useKudzu'
import { dueCheckins, getUser, inSchool } from '../services'
import { ago, firstName } from '../lib/util'
import { Avatar, EmptyState, SchoolChip } from '../components/ui'

function preview(c: Conversation): string {
  const m = c.messages[c.messages.length - 1]
  if (!m) return ''
  const who = m.from === 'me' ? 'You: ' : ''
  if (m.thanks) return m.from === 'me' ? 'You sent a thank-you note' : 'Sent you a thank-you note'
  if (m.proposal) return m.proposal.acceptedSlot ? '☕ Coffee chat confirmed' : `${who}☕ Proposed a coffee chat`
  return who + (m.text ?? '')
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
  const due = dueCheckins(s)

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

      {fresh.length > 0 && (
        <section className="pb-2">
          <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">New matches</div>
          <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-2">
            {fresh.map((c) => {
              const u = getUser(c.otherId)
              if (!u) return null
              return (
                <Link key={c.id} to={`/messages/${u.id}`} className="flex w-16 shrink-0 flex-col items-center gap-1">
                  <div className="rounded-full p-0.5 ring-2 ring-coffee-500"><Avatar user={u} size={56} /></div>
                  <span className="w-full truncate text-center text-xs font-medium">{firstName(u.name)}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {threads.length === 0 && fresh.length === 0 ? (
        <EmptyState title="No conversations yet" body="When you match with someone, your chat shows up here.">
          <Link to="/meet" className="inline-flex items-center gap-2 rounded-full bg-vine-700 px-5 py-3 text-sm font-semibold text-cream"><Coffee size={16} /> Meet people</Link>
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
                  <Avatar user={u} size={52} />
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
    </div>
  )
}
