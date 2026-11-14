import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion'
import { Coffee, SlidersHorizontal, Users, X } from 'lucide-react'
import type { User } from '../types'
import { useKadzu } from '../store/useKadzu'
import { accountStanding, buildDeck, promptText } from '../services'
import { firstName } from '../lib/util'
import { Logo } from '../components/brand'
import { Avatar, Button, EmptyState, SchoolChip, Sheet, Toggle, inputCls } from '../components/ui'
import { ProfileView, roleLine } from '../components/ProfileView'
import { PrefsForm } from '../components/PrefsForm'
import { AccountNotice } from '../components/AccountNotice'

type Dir = 'like' | 'pass'

function SwipeCard({ user, onSwipe, onLikePrompt }: { user: User; onSwipe: (d: Dir) => void; onLikePrompt: (promptId: string) => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-9, 9])
  const likeOpacity = useTransform(x, [30, 130], [0, 1])
  const passOpacity = useTransform(x, [-130, -30], [1, 0])
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden rounded-3xl bg-cream shadow-card ring-1 ring-sage-200"
      style={{ x, rotate, touchAction: 'pan-y' }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > 110) onSwipe('like')
        else if (info.offset.x < -110) onSwipe('pass')
      }}
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit="exit"
      variants={{ exit: (d: Dir) => ({ x: d === 'like' ? 480 : -480, rotate: d === 'like' ? 16 : -16, opacity: 0, transition: { duration: 0.28 } }) }}
    >
      <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute left-5 top-6 z-10 -rotate-12 rounded-xl border-[3px] border-vine-500 bg-cream/90 px-3 py-1 font-display text-xl font-bold text-vine-600">CONNECT</motion.div>
      <motion.div style={{ opacity: passOpacity }} className="pointer-events-none absolute right-5 top-6 z-10 rotate-12 rounded-xl border-[3px] border-coffee-500 bg-cream/90 px-3 py-1 font-display text-xl font-bold text-coffee-600">PASS</motion.div>
      <div className="app-scroll h-full overflow-y-auto pb-24">
        <ProfileView user={user} onLikePrompt={onLikePrompt} onBlocked={() => onSwipe('pass')} />
      </div>
    </motion.div>
  )
}

/** One mocked example of a group chat: you and a friend with two alumni. */
function BringFriendCard({ alums, onDone }: { alums: User[]; onDone: (requested: boolean) => void }) {
  const me = useKadzu((s) => s.me)
  const friend = { id: 'friend', name: 'Avery Brooks' }
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl bg-vine-700 p-6 text-cream shadow-card">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-vine-200">Bring a friend</div>
      <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">A double coffee chat with {alums.map((a) => firstName(a.name)).join(' & ')}</h2>
      <p className="mt-2 text-sm text-vine-100">You and a friend meet two alumni together. Less pressure, twice the perspective.</p>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-vine-200">You two</div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3"><Avatar user={me} size={44} ring /><Avatar user={friend} size={44} ring /></div>
            <div className="text-sm">{firstName(me.name)} + Avery <span className="text-vine-200">(friend from class)</span></div>
          </div>
        </div>
        <div className="rounded-2xl bg-white/10 p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-vine-200">Matched alumni</div>
          {alums.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-1.5">
              <Avatar user={a} size={40} />
              <div className="min-w-0 text-sm">
                <div className="font-semibold">{a.name} <span className="font-normal text-vine-200">’{String(a.gradYear).slice(2)}</span></div>
                <div className="truncate text-vine-100">{roleLine(a)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={() => onDone(false)}>Not now</Button>
        <Button variant="coffee" className="flex-1" onClick={() => onDone(true)}>Request group chat</Button>
      </div>
    </div>
  )
}

export default function Meet() {
  const s = useKadzu()
  const [dir, setDir] = useState<Dir>('like')
  const [filters, setFilters] = useState(false)
  const [liking, setLiking] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [friendDone, setFriendDone] = useState(false)

  const deck = useMemo(
    () => buildDeck(s),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.me, s.prefs, s.schoolId, s.swiped, s.connections, s.blocked, s.feedback, s.groups],
  )
  const top = deck[0]
  const next = deck[1]
  const groupAlums = useMemo(() => deck.filter((u) => u.role === 'alum').slice(1, 3), [deck])
  const showFriendCard = s.bringFriend && !friendDone && groupAlums.length === 2

  const act = (d: Dir, like?: { promptId: string; comment: string }) => {
    if (!top) return
    setDir(d)
    // let AnimatePresence pick up the direction before the card leaves
    requestAnimationFrame(() => {
      const matched = s.swipe(top.id, d, like)
      if (d === 'like' && !matched) s.say(`Sent to ${firstName(top.name)}. We’ll let you know if it’s mutual.`)
    })
  }

  const activeFilters =
    (s.prefs.show !== 'both' ? 1 : 0) + (s.prefs.industries.length ? 1 : 0) + (s.prefs.modes.length ? 1 : 0) +
    (s.prefs.maxDistance < 3000 ? 1 : 0) + (s.prefs.travelingTo ? 1 : 0) + (s.prefs.gradRange[0] > 2005 || s.prefs.gradRange[1] < 2030 ? 1 : 0)

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <Logo />
        <div className="flex items-center gap-2">
          <SchoolChip />
          <button
            onClick={() => { s.set({ bringFriend: !s.bringFriend }); setFriendDone(false); s.say(s.bringFriend ? 'Bring a friend is off' : 'Bring a friend is on') }}
            className={`rounded-full p-2 ${s.bringFriend ? 'bg-vine-700 text-cream' : 'bg-white text-ink/70 ring-1 ring-sage-200'}`}
            aria-label="Bring a friend mode" aria-pressed={s.bringFriend}
          >
            <Users size={18} />
          </button>
          <button onClick={() => setFilters(true)} className="relative rounded-full bg-white p-2 text-ink/70 ring-1 ring-sage-200" aria-label="Filters">
            <SlidersHorizontal size={18} />
            {activeFilters > 0 && <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-coffee-500 text-[9px] font-bold text-white">{activeFilters}</span>}
          </button>
        </div>
      </header>

      {accountStanding(s) === 'warning' && <div className="px-4 pb-2"><AccountNotice compact /></div>}
      {s.prefs.travelingTo && <div className="px-4 pb-1 text-center text-xs font-medium text-coffee-600">Showing people near {s.prefs.travelingTo}</div>}

      <div className="relative mx-3 mb-3 mt-1 min-h-0 flex-1">
        {s.paused ? (
          <EmptyState title="Your profile is paused" body="You won’t be shown to anyone, and you won’t see new people until you turn it back on.">
            <Button onClick={() => s.set({ paused: false })}>Unpause my profile</Button>
          </EmptyState>
        ) : showFriendCard ? (
          <BringFriendCard
            alums={groupAlums}
            onDone={(requested) => {
              setFriendDone(true)
              if (requested) s.say(`Group chat requested with ${groupAlums.map((a) => firstName(a.name)).join(' & ')}`)
            }}
          />
        ) : !top ? (
          <EmptyState title="You’re all caught up" body="No one new matches your filters right now. Widen them, or take another look at people you passed on.">
            <div className="flex flex-col gap-2">
              <Button onClick={() => setFilters(true)}>Adjust filters</Button>
              <Button variant="secondary" onClick={s.resetPasses}>See everyone again</Button>
            </div>
          </EmptyState>
        ) : (
          <>
            {next && <div className="absolute inset-0 translate-y-2 scale-[0.97] rounded-3xl bg-sage-100 ring-1 ring-sage-200" />}
            <AnimatePresence custom={dir} mode="popLayout">
              <SwipeCard key={top.id} user={top} onSwipe={(d) => act(d)} onLikePrompt={(p) => { setComment(''); setLiking(p) }} />
            </AnimatePresence>
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-6">
              <button onClick={() => act('pass')} className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-coffee-600 shadow-lg ring-1 ring-sage-200" aria-label="Pass"><X size={26} /></button>
              <button onClick={() => act('like')} className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-vine-700 text-cream shadow-lg" aria-label="Connect"><Coffee size={28} /></button>
            </div>
          </>
        )}
      </div>

      <Sheet open={filters} onClose={() => setFilters(false)} title="Who you’ll meet">
        <PrefsForm prefs={s.prefs} onChange={s.setPrefs} homeCity={s.me.city} />
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-sage-200 bg-white p-4">
          <div>
            <div className="text-sm font-semibold">Bring a friend</div>
            <div className="text-xs text-ink/55">Pair up with a friend to meet two alumni together.</div>
          </div>
          <Toggle on={s.bringFriend} onChange={(v) => { s.set({ bringFriend: v }); setFriendDone(false) }} label="Bring a friend" />
        </div>
        <Button className="mt-6 w-full" onClick={() => setFilters(false)}>Show {deck.length} {deck.length === 1 ? 'person' : 'people'}</Button>
      </Sheet>

      <Sheet open={!!liking} onClose={() => setLiking(null)} title={top ? `Like ${firstName(top.name)}’s answer` : ''}>
        {top && liking && (
          <>
            <div className="rounded-2xl border border-sage-200 bg-white p-4">
              <div className="text-xs font-semibold text-coffee-500">{promptText(liking)}</div>
              <div className="mt-1 font-display text-lg leading-snug">{top.prompts.find((p) => p.promptId === liking)?.answer}</div>
            </div>
            <textarea
              className={`${inputCls} mt-3 h-24 resize-none`}
              placeholder="Add a comment. It’s the best way to start a conversation."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              autoFocus
            />
            <Button
              className="mt-3 w-full"
              onClick={() => { const promptId = liking; setLiking(null); act('like', { promptId, comment: comment.trim() }) }}
            >
              <Coffee size={17} /> {comment.trim() ? 'Send like with comment' : 'Send like'}
            </Button>
          </>
        )}
      </Sheet>

    </div>
  )
}
