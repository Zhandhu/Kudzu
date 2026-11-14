import { CalendarCheck, HeartHandshake, MessageCircle, ShieldCheck } from 'lucide-react'
import { APP_NAME } from '../config/brand'
import { VineDivider } from '../components/brand'
import { BackHeader } from '../components/ui'

const RULES = [
  { icon: CalendarCheck, title: 'Show up', body: 'If you confirm a chat, be there. If something comes up, reschedule in the app at least a few hours ahead.' },
  { icon: HeartHandshake, title: 'Be generous', body: 'Everyone here is giving their time. Come with real questions, and offer help where you can.' },
  { icon: MessageCircle, title: 'No pitches', body: `${APP_NAME} is for conversations, not selling. Recruiting for your company is fine; pushing a product is not.` },
  { icon: ShieldCheck, title: 'Keep it respectful', body: 'Harassment, discrimination and unwanted advances lead to removal. Report anything that feels off.' },
]

export default function Guidelines() {
  return (
    <div className="app-scroll h-full overflow-y-auto pb-10">
      <BackHeader title="Community guidelines" />
      <div className="px-5 pt-5">
        <h1 className="font-display text-2xl font-semibold">Keeping your profile in good standing</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/65">
          After each coffee chat we privately ask both people how it went. Those answers are never shown on a profile. They help us suggest people well and notice when something is going wrong.
        </p>
        <div className="mt-5 space-y-3">
          {RULES.map((r) => (
            <div key={r.title} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-sage-200">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-100 text-vine-700"><r.icon size={19} /></div>
              <div><div className="font-semibold">{r.title}</div><p className="mt-0.5 text-[13.5px] leading-relaxed text-ink/65">{r.body}</p></div>
            </div>
          ))}
        </div>
        <VineDivider />
        <h2 className="text-sm font-semibold">If you received a notice</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink/65">
          A notice means a few recent chats were reported as missed or didn’t go well. Nothing has been removed. Showing up to your next few chats clears it. If it keeps happening, your profile is shown to fewer people for a while.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink/65">Think a report was a mistake? Contact support from Profile → Settings and we’ll take a look.</p>
      </div>
    </div>
  )
}
