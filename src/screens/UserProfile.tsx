import { useState } from 'react'
import { Coffee, MessageCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useKudzu, useNow } from '../store/useKudzu'
import { REQUEST_LIMIT, answerRequest, canRequest, daysLeft, getUser, incomingRequests, isEstablished, requestTo } from '../services'
import { firstName } from '../lib/util'
import { TendrilIcon } from '../components/brand'
import { BackHeader, Button } from '../components/ui'
import { ProfileView } from '../components/ProfileView'
import { KnowButton } from '../components/KnowButton'
import { RequestSheet } from '../components/RequestSheet'

/** Full profile page, reached from Find, guest lists, groups, chats and the network. */
export default function UserProfile() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const now = useNow()
  const s = useKudzu()
  const user = getUser(id)
  const [asking, setAsking] = useState(false)
  const [promptId, setPromptId] = useState<string | null>(null)
  if (!user) return <><BackHeader title="Profile" /><p className="p-8 text-center text-sm text-ink/60">This profile is no longer available.</p></>

  const name = firstName(user.name)
  const isMe = user.id === 'me'
  const inWeb = s.connections.some((c) => c.otherId === id && isEstablished(c))
  const state = canRequest(s, user, now)
  const sent = requestTo(s, id, now)
  // they asked you first: answer here instead of sending a request back
  const theirs = incomingRequests(s, now).find((r) => r.fromId === id)
  const ask = (p: string | null) => { setPromptId(p); setAsking(true) }

  return (
    <div className="flex h-full flex-col">
      <BackHeader title={isMe ? 'How others see you' : user.name} />
      <div className="app-scroll min-h-0 flex-1 overflow-y-auto">
        {/* liking a prompt is still the easiest way to start: it opens the request with that answer attached */}
        <ProfileView user={user} onLikePrompt={!isMe && state === 'ok' && !theirs ? (p) => ask(p) : undefined} onBlocked={() => nav(-1)} />
      </div>
      <div className={isMe ? 'hidden' : 'border-t border-sage-200 bg-cream px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3'}>
        {state === 'connected' ? (
          <div className="flex gap-2.5">
            <Link to={`/messages/${user.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-vine-700 py-3 text-sm font-semibold text-cream"><MessageCircle size={17} /> Message</Link>
            <Link to={`/messages/${user.id}?propose=1`} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-coffee-500 py-3 text-sm font-semibold text-cream"><Coffee size={17} /> Propose coffee</Link>
          </div>
        ) : theirs ? (
          <>
            <p className="mb-2 text-center text-[13px] text-ink/65">{name} asked you for a chat: “{theirs.note}”</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { answerRequest(theirs.id, 'accept'); nav(`/messages/${user.id}`) }} className="rounded-full bg-vine-700 py-2.5 text-xs font-semibold text-cream">Accept</button>
              <button onClick={() => { answerRequest(theirs.id, 'later'); nav(`/messages/${user.id}`) }} className="rounded-full border border-vine-700 py-2.5 text-xs font-semibold text-vine-700">Later on</button>
              <button onClick={() => { answerRequest(theirs.id, 'decline'); nav(-1) }} className="rounded-full border border-sage-200 bg-white py-2.5 text-xs font-semibold text-ink/60">Not right now</button>
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
          <Button className="w-full" onClick={() => ask(null)}><TendrilIcon size={18} color="#faf6ee" /> Ask {name} for a chat</Button>
        )}
        {!inWeb && !theirs && <KnowButton user={user} variant="link" />}
      </div>

      <RequestSheet user={user} open={asking} onClose={() => setAsking(false)} promptId={promptId} />
    </div>
  )
}
