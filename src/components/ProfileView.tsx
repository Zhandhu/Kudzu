import { useState } from 'react'
import { ArrowLeftRight, Briefcase, Compass, Flag, GraduationCap, HandHeart, Heart, MapPin, MoreHorizontal, ShieldOff, Sparkles, Sprout, Users } from 'lucide-react'
import type { Mode, User } from '../types'
import { MODE_META, topicLabel } from '../config/brand'
import { useKudzu } from '../store/useKudzu'
import { distanceLabel, inCommon, matchInfo, mutualConnections, networkGap, promptText, spotsLeft } from '../services'
import { avatarGradient, firstName, initials } from '../lib/util'
import { Avatar, Chip, Sheet } from './ui'

const REPORT_REASONS = ['Inappropriate messages', 'Fake profile or impersonation', 'Harassment', 'Soliciting or spam', 'Something else']

/** Report / Block. Separate from private chat feedback; this is for safety issues. */
export function MoreMenu({ user, light = false, onBlocked }: { user: User; light?: boolean; onBlocked?: () => void }) {
  const [open, setOpen] = useState(false)
  const [reporting, setReporting] = useState(false)
  const { block, report } = useKudzu.getState()
  const name = firstName(user.name)
  const close = () => { setOpen(false); setReporting(false) }
  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true) }}
        className={`rounded-full p-1.5 ${light ? 'bg-black/25 text-white' : 'text-ink/60 hover:bg-sage-100'}`}
        aria-label="More options"
      >
        <MoreHorizontal size={20} />
      </button>
      <Sheet open={open} onClose={close} title={reporting ? `Report ${name}` : name}>
        {reporting ? (
          <div className="space-y-2">
            <p className="mb-3 text-sm text-ink/60">Reports are confidential. {name} won’t know who reported them.</p>
            {REPORT_REASONS.map((r) => (
              <button key={r} onClick={() => { report(user.id, r); close() }} className="w-full rounded-xl border border-sage-200 bg-white px-4 py-3 text-left text-sm font-medium hover:bg-sage-50">
                {r}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <button onClick={() => setReporting(true)} className="flex w-full items-center gap-3 rounded-xl border border-sage-200 bg-white px-4 py-3 text-left text-sm font-medium hover:bg-sage-50">
              <Flag size={18} className="text-coffee-500" /> Report {name}
            </button>
            <button onClick={() => { block(user.id); close(); onBlocked?.() }} className="flex w-full items-center gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-left text-sm font-medium text-red-700 hover:bg-red-50">
              <ShieldOff size={18} /> Block {name}
            </button>
            <p className="px-1 pt-2 text-xs text-ink/50">Use these for safety concerns. Feedback about how a coffee chat went is collected separately and stays private.</p>
          </div>
        )}
      </Sheet>
    </>
  )
}

export function ModeIcon({ mode, size = 14 }: { mode: Mode; size?: number }) {
  const Icon = mode === 'learn' ? Compass : mode === 'give' ? HandHeart : ArrowLeftRight
  return <Icon size={size} />
}

/** Small tag naming the soft role of a connection, from the viewer's side. */
export function ModeTag({ mode }: { mode: Mode }) {
  const m = MODE_META[mode]
  return (
    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: m.bg, color: m.color }}>
      <ModeIcon mode={mode} size={11} /> {m.tag}
    </span>
  )
}

/** "Looking for" and "Can offer", with the topics behind the match picked out. */
export function TopicRows({ user, highlightAsks = [], highlightOffers = [] }: { user: User; highlightAsks?: string[]; highlightOffers?: string[] }) {
  const row = (title: string, ids: string[], highlight: string[], tone: 'sage' | 'coffee') =>
    ids.length > 0 && (
      <div>
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink/50">{title}</div>
        <div className="flex flex-wrap gap-1.5">
          {ids.map((id) => <Chip key={id} small tone={tone} active={highlight.includes(id)}>{topicLabel(id)}</Chip>)}
        </div>
      </div>
    )
  return (
    <div className="space-y-3">
      {row('Looking for', user.asks, highlightAsks, 'sage')}
      {row('Can offer', user.offers, highlightOffers, 'coffee')}
    </div>
  )
}

export function roleLine(u: User) {
  if (u.title && u.company) return `${u.title} @ ${u.company}`
  return u.title ?? (u.role === 'student' ? 'Student' : 'Alum')
}

/** Full profile body. Used in the swipe card, the profile page and guest lists. */
export function ProfileView({ user, onLikePrompt, showMenu = true, onBlocked }: { user: User; onLikePrompt?: (promptId: string) => void; showMenu?: boolean; onBlocked?: () => void }) {
  const me = useKudzu((s) => s.me)
  const prefs = useKudzu((s) => s.prefs)
  const groups = useKudzu((s) => s.groups)
  const isMe = user.id === 'me'
  const common = isMe ? [] : inCommon(me, user, groups)
  const info = isMe ? null : matchInfo(me, user)
  const spots = spotsLeft(user)
  const connections = useKudzu((s) => s.connections)
  const schoolId = useKudzu((s) => s.schoolId)
  const blocked = useKudzu((s) => s.blocked)
  const net = { connections, schoolId, blocked }
  const mutuals = isMe ? [] : mutualConnections(net, user)
  const gap = isMe || connections.some((c) => c.otherId === user.id) ? null : networkGap(net, user)

  return (
    <div>
      <div className="relative h-64 overflow-hidden" style={{ background: avatarGradient(user.id + user.name) }}>
        <svg className="absolute -right-6 -top-6 opacity-20" width="200" height="200" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 2.500C6.500 6 4 10.500 5 15.500c.800 4 3.800 6 7 6s6.200-2 7-6c1-5-1.500-9.500-7-13z" fill="#fff" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pb-8 font-display text-[88px] font-semibold text-white/90">{initials(user.name)}</div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 pb-4 pt-12 text-white">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="font-display text-[26px] font-semibold leading-tight">{user.name}</h2>
              <p className="text-sm text-white/90">
                {user.role === 'student' ? 'Student' : 'Alum'} · Class of {user.gradYear}
                {user.verified === 'pending' && ' · Pending verification'}
              </p>
            </div>
            {showMenu && !isMe && <MoreMenu user={user} light onBlocked={onBlocked} />}
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2"><Briefcase size={15} className="text-coffee-500" /> {roleLine(user)}</div>
          <div className="flex items-center gap-2"><GraduationCap size={15} className="text-coffee-500" /> {user.major}</div>
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-coffee-500" /> {user.city}
            {!isMe && <span className="text-ink/50">· {distanceLabel(me, prefs, user)}</span>}
          </div>
        </div>

        {info && (
          <div className="rounded-xl px-3.5 py-3" style={{ background: MODE_META[info.mode].bg }}>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: MODE_META[info.mode].color }}>
              <ModeIcon mode={info.mode} size={13} /> {MODE_META[info.mode].label}
            </div>
            <div className="mt-1 text-[14.5px] font-medium leading-snug text-ink">{info.reason}</div>
          </div>
        )}

        <TopicRows user={user} highlightAsks={info?.mode === 'give' ? info.topics : []} highlightOffers={info?.mode === 'learn' ? info.topics : []} />

        <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium ${spots > 0 ? 'bg-coffee-100 text-coffee-700' : 'bg-sage-100 text-ink/60'}`}>
          <Users size={15} />
          {spots > 0 ? `${spots} of ${user.capacity} chat spots left this month` : `Full this month (${user.capacity} chats)`}
        </div>

        {(common.length > 0 || mutuals.length > 0 || gap) && (
          <div className="space-y-2.5 rounded-xl border border-sage-200 bg-sage-50 p-3">
            {common.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-vine-700"><Sparkles size={13} /> In common</div>
                <div className="flex flex-wrap gap-1.5">{common.map((c) => <Chip key={c} small tone="plain">{c}</Chip>)}</div>
              </div>
            )}
            {mutuals.length > 0 && (
              <div className="flex items-center gap-2 text-[13px] text-ink/75">
                <div className="flex shrink-0 -space-x-1.5">{mutuals.slice(0, 3).map((m) => <Avatar key={m.id} user={m} size={22} ring />)}</div>
                <span>
                  You both know <b className="font-semibold text-ink">{mutuals.slice(0, 2).map((m) => firstName(m.name)).join(' and ')}</b>
                  {mutuals.length > 2 && ` and ${mutuals.length - 2} more`}
                </span>
              </div>
            )}
            {gap && (
              <div className="flex items-center gap-2 text-[13px] text-ink/75">
                <Sprout size={15} className="shrink-0 text-vine-600" />
                <span>Would be your first connection in <b className="font-semibold text-ink">{gap}</b></span>
              </div>
            )}
          </div>
        )}

        {user.prompts.map((p) => (
          <div key={p.promptId} className="relative rounded-2xl border border-sage-200 bg-white p-4 pr-14 shadow-sm">
            <div className="text-xs font-semibold text-coffee-500">{promptText(p.promptId)}</div>
            <div className="mt-1.5 font-display text-[19px] leading-snug">{p.answer}</div>
            {onLikePrompt && (
              <button
                onClick={() => onLikePrompt(p.promptId)}
                className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-sage-200 bg-cream text-coffee-500 shadow-sm hover:bg-coffee-100"
                aria-label="Like this answer"
              >
                <Heart size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
