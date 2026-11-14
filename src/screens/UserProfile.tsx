import { useState } from 'react'
import { Coffee, MessageCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useKadzu } from '../store/useKadzu'
import { getUser, promptText } from '../services'
import { firstName } from '../lib/util'
import { BackHeader, Button, Sheet, inputCls } from '../components/ui'
import { ProfileView } from '../components/ProfileView'

/** Full profile page, reached from guest lists, groups, chats and the network. */
export default function UserProfile() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const user = getUser(id)
  const connected = useKadzu((s) => s.connections.some((c) => c.otherId === id))
  const liked = useKadzu((s) => s.swiped[id] === 'like')
  const swipe = useKadzu((s) => s.swipe)
  const say = useKadzu((s) => s.say)
  const [liking, setLiking] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  if (!user) return <><BackHeader title="Profile" /><p className="p-8 text-center text-sm text-ink/60">This profile is no longer available.</p></>

  const name = firstName(user.name)
  const isMe = user.id === 'me'
  const connect = (like?: { promptId: string; comment: string }) => {
    if (!swipe(user.id, 'like', like)) say(`Sent to ${name}. We’ll let you know if it’s mutual.`)
  }

  return (
    <div className="flex h-full flex-col">
      <BackHeader title={isMe ? 'How others see you' : user.name} />
      <div className="app-scroll min-h-0 flex-1 overflow-y-auto">
        <ProfileView user={user} onLikePrompt={isMe || connected || liked ? undefined : (p) => { setComment(''); setLiking(p) }} onBlocked={() => nav(-1)} />
      </div>
      <div className={isMe ? 'hidden' : 'border-t border-sage-200 bg-cream px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3'}>
        {connected ? (
          <div className="flex gap-2.5">
            <Link to={`/messages/${user.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-vine-700 py-3 text-sm font-semibold text-cream"><MessageCircle size={17} /> Message</Link>
            <Link to={`/messages/${user.id}?propose=1`} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-coffee-500 py-3 text-sm font-semibold text-cream"><Coffee size={17} /> Propose coffee</Link>
          </div>
        ) : liked ? (
          <Button className="w-full" variant="secondary" disabled>Request sent · waiting for {name}</Button>
        ) : (
          <Button className="w-full" onClick={() => connect()}><Coffee size={17} /> Connect with {name}</Button>
        )}
      </div>

      <Sheet open={!!liking} onClose={() => setLiking(null)} title={`Like ${name}’s answer`}>
        {liking && (
          <>
            <div className="rounded-2xl border border-sage-200 bg-white p-4">
              <div className="text-xs font-semibold text-coffee-500">{promptText(liking)}</div>
              <div className="mt-1 font-display text-lg leading-snug">{user.prompts.find((p) => p.promptId === liking)?.answer}</div>
            </div>
            <textarea className={`${inputCls} mt-3 h-24 resize-none`} placeholder="Add a comment to start the conversation." value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button className="mt-3 w-full" onClick={() => { const promptId = liking; setLiking(null); connect({ promptId, comment: comment.trim() }) }}>
              <Coffee size={17} /> Send like
            </Button>
          </>
        )}
      </Sheet>
    </div>
  )
}
