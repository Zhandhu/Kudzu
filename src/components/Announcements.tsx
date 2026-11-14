import { CalendarDays, Megaphone, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { openEvent, useKudzu, useNow } from '../store/useKudzu'
import { announcementAudience, getUser, myAnnouncements } from '../services'
import { ago, firstName } from '../lib/util'
import { Avatar } from './ui'

/**
 * Notices to your class and your city. A cohort is hundreds or thousands of
 * people, far too many for a chat, so these go one way and come a few times a
 * year. There is no "reply all": answering one writes to the person who posted it.
 */
export function AnnouncementList({ onLeave }: { onLeave?: () => void }) {
  const s = useKudzu()
  const now = useNow()
  const list = myAnnouncements(s, now)
  if (list.length === 0) {
    return <p className="rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">Nothing from your class or city yet. Announcements are rare: a reunion, a city meet-up.</p>
  }
  return (
    <div className="space-y-2.5">
      {list.map((a) => {
        const from = getUser(a.fromId)
        const fresh = !s.readAnnouncements.includes(a.id)
        const hasEvent = !!a.eventId && s.events.some((e) => e.id === a.eventId)
        return (
          <article key={a.id} className={`rounded-2xl p-3.5 ring-1 ${fresh ? 'bg-vine-50 ring-vine-300' : 'bg-white ring-sage-200'}`}>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-vine-700">
              <Megaphone size={13} /> {announcementAudience(a)}
              {fresh && <span className="rounded-full bg-vine-700 px-1.5 py-0.5 text-[9.5px] font-bold text-cream">New</span>}
              <span className="ml-auto font-medium normal-case tracking-normal text-ink/45">{ago(a.at, now)}</span>
            </div>
            <h3 className="mt-1.5 font-display text-[17px] font-semibold leading-snug">{a.title}</h3>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink/75">{a.body}</p>
            {from && (
              <div className="mt-2.5 flex items-center gap-2 text-xs text-ink/55"><Avatar user={from} size={22} /> Posted by {from.name}</div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {hasEvent && (
                <button onClick={() => { onLeave?.(); openEvent(a.eventId!)() }} className="flex items-center gap-1.5 rounded-full bg-vine-700 px-3.5 py-2 text-xs font-semibold text-cream"><CalendarDays size={14} /> See the event</button>
              )}
              {from && (
                <Link to={`/messages/${from.id}?draft=${encodeURIComponent(`Hi ${firstName(from.name)}, about “${a.title}”: `)}`} className="flex items-center gap-1.5 rounded-full border border-sage-200 bg-white px-3.5 py-2 text-xs font-semibold text-vine-800">
                  <MessageCircle size={14} /> Reply to {firstName(from.name)}
                </Link>
              )}
            </div>
          </article>
        )
      })}
      <p className="px-1 text-[11px] leading-relaxed text-ink/45">Announcements go to a whole class or city, a few times a year. A reply goes only to the person who posted it.</p>
    </div>
  )
}
