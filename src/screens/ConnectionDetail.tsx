import { CalendarDays, Coffee, Handshake, MessageCircle, StickyNote, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { InteractionType } from '../types'
import { STRENGTH_META } from '../config/brand'
import { useKadzu, useNow } from '../store/useKadzu'
import { getUser, strengthOf } from '../services'
import { ago, firstName, fmtDate } from '../lib/util'
import { LeafIcon, StrengthBadge } from '../components/brand'
import { Avatar, BackHeader, inputCls } from '../components/ui'
import { MoreMenu, roleLine } from '../components/ProfileView'

const KIND: Record<InteractionType, { label: string; icon: typeof Coffee }> = {
  matched: { label: 'Matched on Kadzu', icon: Handshake },
  messaged: { label: 'Exchanged messages', icon: MessageCircle },
  coffee: { label: 'Had a coffee chat', icon: Coffee },
  event: { label: 'Attended an event together', icon: CalendarDays },
}

export default function ConnectionDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const now = useNow()
  const user = getUser(id)
  const conn = useKadzu((s) => s.connections.find((c) => c.otherId === id))
  const setNote = useKadzu((s) => s.setNote)
  if (!user || !conn) return <><BackHeader title="Connection" /><p className="p-8 text-center text-sm text-ink/60">You’re not connected with this person yet.</p></>

  const st = strengthOf(conn, now)
  const meta = STRENGTH_META[st.level]
  const timeline = [...conn.interactions].sort((a, b) => b.at - a.at)

  return (
    <div className="app-scroll h-full overflow-y-auto pb-8">
      <BackHeader title={user.name} right={<MoreMenu user={user} onBlocked={() => nav('/network')} />} />

      <div className="flex flex-col items-center px-5 pt-6 text-center">
        <Avatar user={user} size={88} />
        <h2 className="mt-3 font-display text-2xl font-semibold">{user.name}</h2>
        <p className="text-sm text-ink/60">{roleLine(user)}</p>
        <p className="text-xs text-ink/45">{user.city} · Class of {user.gradYear}</p>
      </div>

      <div className="mx-4 mt-5 flex items-center gap-3 rounded-2xl p-4" style={{ background: `${meta.color}14` }}>
        <LeafIcon level={st.level} size={40} />
        <div>
          <StrengthBadge level={st.level} />
          <div className="mt-1 text-[13px] text-ink/70">
            Last in touch {st.days === 0 ? 'today' : `${st.days} days ago`}.{' '}
            {st.level === 'strong' ? 'This one is thriving.' : st.level === 'steady' ? 'A quick note keeps it growing.' : st.level === 'fading' ? 'A hello would go a long way.' : 'It’s been a while. Worth reviving?'}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <Link to={`/messages/${user.id}`} className="flex flex-col items-center gap-1 rounded-2xl bg-vine-700 py-3 text-xs font-semibold text-cream"><MessageCircle size={18} /> Message</Link>
        <Link to={`/messages/${user.id}?propose=1`} className="flex flex-col items-center gap-1 rounded-2xl bg-coffee-500 py-3 text-xs font-semibold text-cream"><Coffee size={18} /> Propose coffee</Link>
        <Link to={`/u/${user.id}`} className="flex flex-col items-center gap-1 rounded-2xl border border-sage-200 bg-white py-3 text-xs font-semibold"><UserRound size={18} /> Profile</Link>
      </div>

      <section className="mx-4 mt-6">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><StickyNote size={15} className="text-coffee-500" /> Private note</h3>
        <textarea
          className={`${inputCls} h-24 resize-none`}
          placeholder={`Met at the fall mixer, works on climate tech… Only you can see this.`}
          value={conn.note}
          onChange={(e) => setNote(id, e.target.value)}
          aria-label="Private note"
        />
      </section>

      <section className="mx-4 mt-6">
        <h3 className="mb-3 text-sm font-semibold">Your history with {firstName(user.name)}</h3>
        <ol className="relative ml-4 border-l-2 border-sage-200">
          {timeline.map((i, idx) => {
            const k = KIND[i.type]
            return (
              <li key={idx} className="relative pb-5 pl-6 last:pb-0">
                <span className="absolute -left-[15px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-sage-100 text-vine-700 ring-4 ring-cream"><k.icon size={14} /></span>
                <div className="text-sm font-medium">{k.label}</div>
                {i.note && <div className="text-[13px] text-ink/60">{i.note}</div>}
                <div className="text-xs text-ink/45">{fmtDate(i.at)} · {ago(i.at, now)}</div>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
