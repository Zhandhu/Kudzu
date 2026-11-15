import { Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useKudzu } from '../store/useKudzu'
import { knownAsks } from '../services'
import { firstName } from '../lib/util'
import { Avatar } from './ui'
import { roleLine } from './ProfileView'

/**
 * People who have added the user as someone they know. They sit at the top of the
 * user's own list of people, in a grey box, until answered. Yes puts them in the list
 * below. "Not really" drops it, and the other person is never told.
 */
export function KnownAsks({ onOpen }: { onOpen?: (id: string) => void }) {
  const s = useKudzu()
  const nav = useNavigate()
  const asks = knownAsks(s)
  const open = onOpen ?? ((id: string) => nav(`/u/${id}`))
  if (!asks.length) return null
  return (
    <div className="mb-2 space-y-2" data-tour="known-asks">
      {asks.map((u) => (
        <div key={u.id} className="rounded-2xl bg-slate-100 p-3 ring-1 ring-slate-200" role="group" aria-label={`${u.name} says you know each other`}>
          <button onClick={() => open(u.id)} className="flex w-full items-center gap-3 text-left">
            <Avatar user={u} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-semibold">{u.name}</span>
              <span className="block truncate text-[13px] text-ink/55">{roleLine(u)}</span>
              <span className="block text-[13px] font-medium text-slate-600">Says you know each other</span>
            </span>
          </button>
          <div className="mt-2.5 flex gap-2">
            <button onClick={() => s.answerKnown(u.id, true)} className="flex-1 rounded-full bg-vine-700 py-2.5 text-[13px] font-semibold text-cream">Yes, I know {firstName(u.name)}</button>
            <button onClick={() => s.answerKnown(u.id, false)} className="rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-ink/65">Not really</button>
          </div>
        </div>
      ))}
    </div>
  )
}

/** The tag on someone the user has added who has not confirmed yet. */
export function AwaitingTag({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ${className}`}>
      <Clock size={11} /> Waiting to confirm
    </span>
  )
}
