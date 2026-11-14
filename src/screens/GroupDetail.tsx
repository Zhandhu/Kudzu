import { ChevronRight, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useKudzu, useNow } from '../store/useKudzu'
import { groupMembers } from '../services'
import { DAY, fmtDateTime } from '../lib/util'
import { Avatar, BackHeader, Button } from '../components/ui'
import { roleLine } from '../components/ProfileView'

export default function GroupDetail() {
  const { id = '' } = useParams()
  const now = useNow()
  const g = useKudzu((s) => s.groups.find((x) => x.id === id))
  const me = useKudzu((s) => s.me)
  const events = useKudzu((s) => s.events)
  const toggle = useKudzu((s) => s.toggleGroup)
  if (!g) return <><BackHeader title="Group" /><p className="p-8 text-center text-sm text-ink/60">This group is no longer available.</p></>

  const members = groupMembers(g.id, me)
  const joined = me.groupIds.includes(g.id)
  const groupEvents = events.filter((e) => e.groupId === g.id && e.start > now - DAY).sort((a, b) => a.start - b.start)

  return (
    <div className="app-scroll h-full overflow-y-auto pb-8">
      <BackHeader title="Group" />
      <div className="px-5 pb-5 pt-6 text-cream" style={{ background: g.color }}>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20"><Users size={26} /></div>
        <h1 className="mt-3 font-display text-2xl font-semibold">{g.name}</h1>
        <p className="mt-1 text-sm text-white/85">{g.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium">{members.length} {members.length === 1 ? 'member' : 'members'}</span>
          <Button variant="secondary" className="!py-2" onClick={() => toggle(g.id)}>{joined ? 'Leave group' : 'Join group'}</Button>
        </div>
      </div>

      <div className="px-5">
        <h2 className="mb-2 mt-5 text-sm font-semibold">Upcoming events</h2>
        {groupEvents.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/50">No events planned yet. Host one from the Events tab.</p>
        ) : (
          <div className="space-y-2">
            {groupEvents.map((e) => (
              <Link key={e.id} to={`/events/${e.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-sage-200">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-coffee-500">{fmtDateTime(e.start)}</div>
                  <div className="truncate text-sm font-semibold">{e.title}</div>
                </div>
                <ChevronRight size={18} className="text-ink/30" />
              </Link>
            ))}
          </div>
        )}

        <h2 className="mb-2 mt-6 text-sm font-semibold">Members</h2>
        <div className="divide-y divide-sage-200 rounded-2xl bg-white ring-1 ring-sage-200">
          {members.length === 0 && <p className="p-4 text-center text-sm text-ink/50">No members yet. Be the first to join.</p>}
          {members.map((m) => (
            <Link key={m.id} to={m.id === 'me' ? '/profile' : `/u/${m.id}`} className="flex items-center gap-3 px-3 py-2.5">
              <Avatar user={m} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{m.id === 'me' ? `${m.name} (you)` : m.name}</div>
                <div className="truncate text-xs text-ink/55">{roleLine(m)}</div>
              </div>
              <ChevronRight size={18} className="text-ink/30" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
