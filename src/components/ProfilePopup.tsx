import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Coffee, MessageCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { User } from '../types'
import { useKudzu, useNow } from '../store/useKudzu'
import { REQUEST_LIMIT, answerRequest, awaitingConfirm, canRequest, daysLeft, getUser, incomingRequests, isEstablished, requestTo } from '../services'
import { firstName } from '../lib/util'
import { TendrilIcon } from './brand'
import { Button, Portal } from './ui'
import { ProfileView } from './ProfileView'
import { KnowButton } from './KnowButton'
import { RequestSheet } from './RequestSheet'

/**
 * A whole profile with what you can do about it: the scrolling body and the bar
 * of actions under it. Used by the profile page and by the floating popup on Find.
 * `onDone` is called when the profile should go away (declined, blocked).
 */
export function ProfileBody({ user, onDone }: { user: User; onDone: () => void }) {
  const now = useNow()
  const s = useKudzu()
  const [asking, setAsking] = useState(false)
  const [promptId, setPromptId] = useState<string | null>(null)
  const id = user.id
  const name = firstName(user.name)
  const isMe = id === 'me'
  const inWeb = s.connections.some((c) => c.otherId === id && isEstablished(c))
  const state = canRequest(s, user, now)
  const sent = requestTo(s, id, now)
  // they asked you first: answer here instead of sending a request back
  const theirs = incomingRequests(s, now).find((r) => r.fromId === id)
  const ask = (p: string | null) => { setPromptId(p); setAsking(true) }

  return (
    <>
      <div className="app-scroll min-h-0 flex-1 overflow-y-auto">
        {/* liking a prompt is still the easiest way to start: it opens the request with that answer attached */}
        <ProfileView user={user} onLikePrompt={!isMe && state === 'ok' && !theirs ? (p) => ask(p) : undefined} onBlocked={onDone} />
      </div>
      <div className={isMe ? 'hidden' : 'border-t border-sage-200 bg-cream px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3'}>
        {state === 'connected' && awaitingConfirm(s, id) ? (
          <p className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-[13px] leading-snug text-slate-600">You added {name} as someone you know. You can message here once {name} confirms.</p>
        ) : state === 'connected' ? (
          <div className="flex gap-2.5" data-tour="profile-actions">
            <Link to={`/messages/${id}`} data-tour="go-message" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-vine-700 py-3 text-sm font-semibold text-cream"><MessageCircle size={17} /> Message</Link>
            <Link to={`/messages/${id}?coffee=1`} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-coffee-500 py-3 text-sm font-semibold text-cream"><Coffee size={17} /> Propose coffee</Link>
          </div>
        ) : theirs ? (
          <>
            <p className="mb-2 text-center text-[13px] text-ink/65">{name} asked you for a chat: “{theirs.note}”</p>
            <div className="grid grid-cols-3 gap-2">
              <Link to={`/messages/${id}`} onClick={() => answerRequest(theirs.id, 'accept')} className="rounded-full bg-vine-700 py-2.5 text-center text-xs font-semibold text-cream">Accept</Link>
              <Link to={`/messages/${id}`} onClick={() => answerRequest(theirs.id, 'later')} className="rounded-full border border-vine-700 py-2.5 text-center text-xs font-semibold text-vine-700">Later on</Link>
              <button onClick={() => { answerRequest(theirs.id, 'decline'); onDone() }} className="rounded-full border border-coffee-200 bg-coffee-100 py-2.5 text-xs font-semibold text-coffee-700">Not right now</button>
            </div>
          </>
        ) : state === 'sent' && sent ? (
          <div className="flex items-center gap-3 rounded-full bg-sage-100 px-4 py-2.5">
            <TendrilIcon size={20} />
            <span className="flex-1 text-[13px] font-medium text-ink/75">Request sent · {daysLeft(sent, now)} days left for {name} to answer</span>
            <button onClick={() => s.dismissRequest(sent.id)} className="text-xs font-semibold text-ink/50">Withdraw</button>
          </div>
        ) : state === 'full' ? (
          <>
            <Button className="w-full" variant="secondary" onClick={() => s.say(`We’ll tell you when ${name} has a spot`)}>Tell me when {name} has a spot</Button>
            <p className="mt-2 text-center text-xs text-ink/50">{name} is full this month, so requests are closed. This keeps anyone from waiting on a reply that can’t come.</p>
          </>
        ) : state === 'limit' ? (
          <>
            <Button className="w-full" variant="secondary" disabled>You have {REQUEST_LIMIT} requests open</Button>
            <p className="mt-2 text-center text-xs text-ink/50">Wait for an answer or withdraw one, then ask {name}. A few considered requests get more replies than many.</p>
          </>
        ) : (
          <Button tour="ask" className="w-full" onClick={() => ask(null)}><TendrilIcon size={18} color="#faf6ee" /> Ask {name} for a chat</Button>
        )}
        {!inWeb && !theirs && <KnowButton user={user} variant="link" />}
      </div>

      <RequestSheet user={user} open={asking} onClose={() => setAsking(false)} promptId={promptId} />
    </>
  )
}

/**
 * The whole profile as a card floating over the page you were on. One tap on a
 * leaf opens it and one tap outside closes it, so you never leave your search.
 */
export function ProfilePopup({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const user = userId ? getUser(userId) : undefined
  return (
    <Portal>
      <AnimatePresence>
        {user && (
          <motion.div
            className="pointer-events-auto absolute inset-0 z-30 bg-black/45"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              role="dialog" aria-label={`${user.name}’s profile`}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.86, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="absolute inset-x-3 bottom-4 top-10 flex flex-col overflow-hidden rounded-3xl bg-cream shadow-2xl"
            >
              <button onClick={onClose} className="absolute right-3 top-3 z-10 rounded-full bg-black/35 p-1.5 text-white" aria-label="Close profile"><X size={18} /></button>
              <ProfileBody user={user} onDone={onClose} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  )
}
