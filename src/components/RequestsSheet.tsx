import { ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { Request } from '../types'
import { topicLabel } from '../config/brand'
import { useKudzu, useNow } from '../store/useKudzu'
import { REQUEST_LIMIT, answerRequest, daysLeft, getUser, requestState } from '../services'
import { ago, firstName } from '../lib/util'
import { TendrilIcon } from './brand'
import { Avatar, Chip, Sheet } from './ui'
import { roleLine } from './ProfileView'

/**
 * Requests in both directions: the ones asked of you, each answered in one tap,
 * and the ones you are waiting on. Opened from the Requests card on Messages.
 */
export function RequestsSheet({ open, onClose, incoming, outgoing }: { open: boolean; onClose: () => void; incoming: Request[]; outgoing: Request[] }) {
  const s = useKudzu()
  const now = useNow()
  const nav = useNavigate()
  return (
    <Sheet open={open} onClose={onClose} title="Requests">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Asked of you · {incoming.length}</h3>
      {incoming.length === 0 && <p className="mb-4 rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">Nobody is waiting on you.</p>}
      <div className="space-y-3">
        {incoming.map((r) => {
          const u = getUser(r.fromId)
          if (!u) return null
          return (
            <div key={r.id} className="rounded-2xl bg-white p-3.5 ring-1 ring-sage-200">
              <Link to={`/u/${u.id}`} className="flex items-center gap-3">
                <Avatar user={u} size={42} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{u.name}</span>
                  <span className="block truncate text-xs text-ink/55">{roleLine(u)}</span>
                </span>
                <span className="shrink-0 text-[11px] text-ink/45">{requestState(r, now) === "expired" ? `Waiting ${Math.round((now - r.at) / 86400000)} days` : `${daysLeft(r, now)}d left`}</span>
              </Link>
              {r.topic && <div className="mt-2.5"><Chip small tone="coffee">{topicLabel(r.topic)}</Chip></div>}
              <p className="mt-2 text-[14px] leading-snug text-ink/80">“{r.note}”</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button onClick={() => { answerRequest(r.id, 'accept'); onClose(); nav(`/messages/${u.id}`) }} className="rounded-full bg-vine-700 py-2 text-xs font-semibold text-cream">Accept</button>
                <button onClick={() => { answerRequest(r.id, 'later'); onClose(); nav(`/messages/${u.id}`) }} className="rounded-full border border-vine-700 py-2 text-xs font-semibold text-vine-700">Later on</button>
                <button onClick={() => answerRequest(r.id, 'decline')} className="rounded-full border border-coffee-200 bg-coffee-100 py-2 text-xs font-semibold text-coffee-700">Not right now</button>
              </div>
            </div>
          )
        })}
      </div>
      {incoming.length > 0 && <p className="mt-2 text-center text-[11px] text-ink/45">Every answer is one tap. “Not right now” sends a kind note for you and never needs a reason.</p>}

      <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-ink/50">Waiting on · {outgoing.filter((r) => requestState(r, now) === 'pending').length} of {REQUEST_LIMIT}</h3>
      {outgoing.length === 0 && <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">You have no requests out. Find someone and ask.</p>}
      <div className="space-y-2">
        {outgoing.map((r) => {
          const u = getUser(r.toId)
          if (!u) return null
          const lapsed = requestState(r, now) === 'expired'
          return (
            <div key={r.id} className={`rounded-2xl p-3 ring-1 ${lapsed ? 'bg-coffee-100/60 ring-coffee-200' : 'bg-white ring-sage-200'}`}>
              <div className="flex items-center gap-3">
                <TendrilIcon size={22} color={lapsed ? '#8b5e3c' : '#356433'} />
                <Link to={`/u/${u.id}`} className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{u.name}</span>
                  <span className="block truncate text-xs text-ink/55">
                    {lapsed ? `${firstName(u.name)} hasn’t answered yet. If they do, it still counts` : `Sent ${ago(r.at, now)} · ${daysLeft(r, now)} days left`}
                    {r.topic ? ` · ${topicLabel(r.topic)}` : ''}
                  </span>
                </Link>
                <button onClick={() => s.dismissRequest(r.id)} className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-ink/50 hover:bg-sage-100">{lapsed ? 'Clear' : 'Withdraw'}</button>
              </div>
              {lapsed && (
                <button
                  onClick={() => { onClose(); nav(r.topic ? `/find?topic=${r.topic}` : "/find") }}
                  className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-full bg-coffee-500 py-2 text-xs font-semibold text-cream"
                >
                  See who else can help{r.topic ? ` with ${topicLabel(r.topic).toLowerCase()}` : ''} <ChevronRight size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}
