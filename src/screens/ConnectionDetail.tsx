import { useState } from 'react'
import { CalendarDays, ChevronDown, Coffee, Handshake, HeartHandshake, MessageCircle, Repeat, StickyNote, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { InteractionType } from '../types'
import { STRENGTH_META } from '../config/brand'
import { useKudzu, useNow } from '../store/useKudzu'
import { RHYTHMS, closeness, getUser, isEstablished, matchInfo, strengthOf } from '../services'
import { ago, firstName, fmtDate } from '../lib/util'
import { LeafIcon, StrengthBadge } from '../components/brand'
import { Avatar, BackHeader, Chip, inputCls } from '../components/ui'
import { ModeTag, MoreMenu, roleLine } from '../components/ProfileView'

const KIND: Record<InteractionType, { label: string; icon: typeof Coffee }> = {
  matched: { label: 'Connected on Kudzu', icon: Handshake },
  messaged: { label: 'Exchanged messages', icon: MessageCircle },
  coffee: { label: 'Had a coffee chat', icon: Coffee },
  event: { label: 'Attended an event together', icon: CalendarDays },
  known: { label: 'Knew each other before Kudzu', icon: UserRound },
  thanks: { label: 'Exchanged a thank-you', icon: HeartHandshake },
}

/** The score at which the closeness bar reads as full. */
const FULL = 1.5

export default function ConnectionDetail() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const now = useNow()
  const user = getUser(id)
  const conn = useKudzu((s) => s.connections.find((c) => c.otherId === id))
  const setNote = useKudzu((s) => s.setNote)
  const setRhythm = useKudzu((s) => s.setRhythm)
  const me = useKudzu((s) => s.me)
  const [showWhy, setShowWhy] = useState(false)
  if (!user || !conn) return <><BackHeader title="Connection" /><p className="p-8 text-center text-sm text-ink/60">You’re not connected with this person yet.</p></>

  const st = strengthOf(conn, now)
  const info = matchInfo(me, user)
  const meta = STRENGTH_META[st.level]
  const timeline = [...conn.interactions].sort((a, b) => b.at - a.at)
  const inWeb = isEstablished(conn)
  const name = firstName(user.name)
  const parts = closeness(conn, now).parts.filter((p) => p.value >= 0.01)
  const nextDue = conn.rhythmDays ? conn.rhythmDays - st.days : null

  return (
    <div className="app-scroll h-full overflow-y-auto pb-8">
      <BackHeader title={user.name} right={<MoreMenu user={user} onBlocked={() => nav('/network')} />} />

      <div className="flex flex-col items-center px-5 pt-6 text-center">
        <Avatar user={user} size={88} />
        <h2 className="mt-3 font-display text-2xl font-semibold">{user.name}</h2>
        <p className="text-sm text-ink/60">{roleLine(user)}</p>
        <p className="text-xs text-ink/45">{user.city} · Class of {user.gradYear}</p>
        <div className="mt-2"><ModeTag mode={info.mode} /></div>
        <p className="mt-1.5 text-[13px] text-ink/65">{info.reason}</p>
      </div>

      {!inWeb ? (
        <div className="mx-4 mt-5 rounded-2xl border border-dashed border-sage-300 bg-white/60 p-4 text-center">
          <div className="text-sm font-semibold">Not in your web yet</div>
          <p className="mt-1 text-[13px] leading-relaxed text-ink/60">You and {name} have matched. A match isn’t a relationship yet: {name} joins your web after your first coffee chat.</p>
        </div>
      ) : (
        <div className="mx-4 mt-5 rounded-2xl p-4" style={{ background: `${meta.color}14` }}>
          <div className="flex items-center gap-3">
            <LeafIcon level={st.level} size={40} />
            <div className="min-w-0 flex-1">
              <StrengthBadge level={st.level} />
              <div className="mt-1 text-[13px] text-ink/70">
                Last in touch {st.days === 0 ? 'today' : `${st.days} days ago`}.{' '}
                {st.level === 'strong' ? 'This one is thriving.' : st.level === 'steady' ? 'A quick note keeps it growing.' : st.level === 'fading' ? 'A hello would go a long way.' : 'It’s been a while. Worth reviving?'}
              </div>
            </div>
          </div>

          <div className="mt-3" role="img" aria-label={`Closeness ${Math.round(Math.min(1, st.score / FULL) * 100)} percent`}>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/70">
              <div className="h-full rounded-full" style={{ width: `${Math.min(1, st.score / FULL) * 100}%`, background: meta.color }} />
            </div>
          </div>
          <button onClick={() => setShowWhy(!showWhy)} className="mt-2 flex items-center gap-1 text-xs font-semibold" style={{ color: meta.color }} aria-expanded={showWhy}>
            What this is based on <ChevronDown size={14} className={showWhy ? 'rotate-180' : ''} />
          </button>
          {showWhy && (
            <div className="mt-2 rounded-xl bg-white/70 p-3">
              <p className="text-xs leading-relaxed text-ink/60">
                Closeness adds up everything you’ve done together. A coffee chat counts most, more so if it went well. Each one counts for less as time passes, halving about every two months.
              </p>
              <ul className="mt-2 space-y-1.5">
                {parts.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <span className="min-w-0 flex-1 truncate">
                      {KIND[p.type].label}
                      {p.quality === 'up' && ' (went well)'}
                      {p.quality === 'down' && ' (not great)'}
                      <span className="text-ink/45"> · {ago(p.at, now)}</span>
                    </span>
                    <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-sage-200">
                      <span className="block h-full rounded-full bg-vine-600" style={{ width: `${Math.min(100, (p.value / 1.3) * 100)}%` }} />
                    </span>
                  </li>
                ))}
                {parts.length === 0 && <li className="text-xs text-ink/50">Everything here was long enough ago that it has faded.</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <Link to={`/messages/${user.id}`} className="flex flex-col items-center gap-1 rounded-2xl bg-vine-700 py-3 text-xs font-semibold text-cream"><MessageCircle size={18} /> Message</Link>
        <Link to={`/messages/${user.id}?coffee=1`} className="flex flex-col items-center gap-1 rounded-2xl bg-coffee-500 py-3 text-xs font-semibold text-cream"><Coffee size={18} /> Propose coffee</Link>
        <Link to={`/u/${user.id}`} className="flex flex-col items-center gap-1 rounded-2xl border border-sage-200 bg-white py-3 text-xs font-semibold"><UserRound size={18} /> Profile</Link>
      </div>

      {inWeb && (
        <section className="mx-4 mt-6">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold"><Repeat size={15} className="text-coffee-500" /> Keeping in touch</h3>
          <p className="mb-2 text-xs text-ink/55">
            {nextDue === null
              ? `Choose a rhythm and we’ll remind you before things go quiet with ${name}.`
              : nextDue > 0
                ? `Your next catch-up with ${name} is due in ${nextDue} ${nextDue === 1 ? 'day' : 'days'}.`
                : `Your catch-up with ${name} is due now.`}
          </p>
          <div className="flex flex-wrap gap-2">
            {RHYTHMS.map((r) => (
              <Chip key={r.label} active={conn.rhythmDays === r.days} onClick={() => setRhythm(id, r.days)}>{r.short}</Chip>
            ))}
          </div>
        </section>
      )}

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
        <h3 className="mb-3 text-sm font-semibold">Your history with {name}</h3>
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
