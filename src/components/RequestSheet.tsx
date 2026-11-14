import { useEffect, useState } from 'react'
import type { User } from '../types'
import { topicLabel } from '../config/brand'
import { useKudzu, useNow } from '../store/useKudzu'
import { REQUEST_LIMIT, matchInfo, openRequestCount, promptText, replyLine, sendRequest } from '../services'
import { firstName } from '../lib/util'
import { TendrilIcon } from './brand'
import { Avatar, Button, Chip, Sheet, inputCls } from './ui'

/**
 * Ask someone for a chat. A request says what it is about and carries one line
 * from the sender, so the person receiving it can decide in a moment.
 */
export function RequestSheet({ user, open, onClose, promptId }: { user: User; open: boolean; onClose: () => void; promptId?: string | null }) {
  const me = useKudzu((s) => s.me)
  const s = useKudzu()
  const now = useNow()
  const info = matchInfo(me, user)
  // topics where their offers meet what the sender is looking for come first
  const topics = [...new Set([...info.topics.filter((t) => user.offers.includes(t)), ...user.offers])]
  const [topic, setTopic] = useState<string | undefined>()
  const [note, setNote] = useState('')
  const name = firstName(user.name)
  const used = openRequestCount(s, now)
  const prompt = promptId ? user.prompts.find((p) => p.promptId === promptId) : undefined

  useEffect(() => {
    if (open) { setTopic(topics[0]); setNote('') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user.id])

  return (
    <Sheet open={open} onClose={onClose} title={`Ask ${name} for a chat`}>
      <div className="flex items-center gap-3">
        <Avatar user={user} size={46} />
        <div className="min-w-0 text-[13px] text-ink/65">
          <div className="font-semibold text-ink">{info.reason}</div>
          <div>{replyLine(user)}</div>
        </div>
      </div>

      {prompt && (
        <div className="mt-4 rounded-2xl border border-sage-200 bg-white p-3">
          <div className="text-xs font-semibold text-coffee-500">{promptText(prompt.promptId)}</div>
          <div className="mt-1 font-display text-[16px] leading-snug">{prompt.answer}</div>
        </div>
      )}

      {topics.length > 0 && (
        <>
          <div className="mb-2 mt-5 text-sm font-semibold">What’s it about?</div>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => <Chip key={t} active={topic === t} onClick={() => setTopic(t)}>{topicLabel(t)}</Chip>)}
          </div>
        </>
      )}

      <div className="mb-2 mt-5 text-sm font-semibold">Add a line</div>
      <textarea
        className={`${inputCls} h-24 resize-none`}
        placeholder={prompt ? `Reply to ${name}’s answer…` : `What would you like to ask ${name}?`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        aria-label="Your note"
        data-tour="note"
      />

      <Button tour="send-request" className="mt-4 w-full" disabled={!note.trim()} onClick={() => { sendRequest(user.id, topic, note, prompt?.promptId); onClose() }}>
        <TendrilIcon size={18} color="#faf6ee" /> Send request
      </Button>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-ink/50">
        {used} of {REQUEST_LIMIT} requests open. If {name} can’t get to it in ten days, we’ll tell you and suggest someone else.
      </p>
    </Sheet>
  )
}
