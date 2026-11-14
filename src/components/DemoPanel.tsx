import { AlertTriangle, ClipboardCheck, FastForward, Footprints, GraduationCap, HeartHandshake, Megaphone, RotateCcw, UserRoundCog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { nowOf, useKudzu } from '../store/useKudzu'
import { findCheckinTarget, listSchools, notifyAnnouncement, receiveAnnouncement, receiveRequest, receiveThanks, unreadAnnouncements } from '../services'
import { TendrilIcon } from './brand'
import { Chip, Sheet, Toggle } from './ui'

/** Presenter controls. Open by tapping the logo three times or the wrench button. */
export default function DemoPanel() {
  const s = useKudzu()
  const nav = useNavigate()
  const close = () => s.set({ demoOpen: false })

  const triggerRequest = () => {
    close()
    if (receiveRequest(s, nowOf(s))) nav('/find')
    else s.say('Nobody left who could send you a request.')
  }

  const triggerCheckin = () => {
    close()
    const target = findCheckinTarget(s)
    if (!target) return s.say('No confirmed chat to check in on. Propose a coffee chat first.')
    s.set({ checkin: target })
  }

  const item = 'flex w-full items-center gap-3 rounded-2xl border border-sage-200 bg-white px-4 py-3 text-left'
  const sub = 'block text-xs font-normal text-ink/50'

  return (
    <Sheet open={s.demoOpen} onClose={close} title="Demo controls">
      <div className="space-y-2.5 text-sm font-semibold">
        <button className={item} onClick={() => { s.switchPersona(); close() }}>
          <UserRoundCog size={19} className="text-vine-600" />
          <span className="flex-1">Switch user<span className={sub}>Now: {s.me.name} ({s.me.role}). Flip between the student and alum view.</span></span>
        </button>

        <div className={`${item} flex-col !items-start`}>
          <div className="flex items-center gap-3"><GraduationCap size={19} className="text-vine-600" /><span>Switch school<span className={sub}>Every tab is scoped to the selected school.</span></span></div>
          <div className="flex flex-wrap gap-2">
            {listSchools().map((sc) => <Chip key={sc.id} active={s.schoolId === sc.id} onClick={() => s.switchSchool(sc.id)}>{sc.shortName}</Chip>)}
          </div>
        </div>

        <button className={item} onClick={() => { const seen = unreadAnnouncements(s, nowOf(s)).map((a) => a.id); s.fastForward(30); close(); nav('/network'); const st = useKudzu.getState(); const fresh = unreadAnnouncements(st, nowOf(st)).find((a) => !seen.includes(a.id)); if (fresh) setTimeout(() => notifyAnnouncement(fresh), 1200) }}>
          <FastForward size={19} className="text-coffee-500" />
          <span className="flex-1">Fast-forward one month<span className={sub}>Connections fade, nudges appear, and unanswered requests lapse.{s.timeOffsetDays > 0 ? ` Currently +${s.timeOffsetDays} days.` : ''}</span></span>
        </button>

        <button className={item} onClick={triggerRequest}>
          <TendrilIcon size={20} color="#8b5e3c" />
          <span className="flex-1">Receive a request<span className={sub}>Someone asks you for a chat. It appears under the tendril on Find.</span></span>
        </button>

        <button className={item} onClick={triggerCheckin}>
          <ClipboardCheck size={19} className="text-coffee-500" />
          <span className="flex-1">Trigger a post-chat check-in<span className={sub}>Opens the private feedback form.</span></span>
        </button>

        <button
          className={item}
          onClick={() => {
            close()
            if (receiveThanks(s)) nav('/profile')
            else s.say('Everyone in your network has already thanked you.')
          }}
        >
          <HeartHandshake size={19} className="text-coffee-500" />
          <span className="flex-1">Receive a thank-you note<span className={sub}>Someone you helped thanks you. Shows on your profile and in the chat.</span></span>
        </button>

        <button className={item} onClick={() => { receiveAnnouncement(); close() }}>
          <Megaphone size={19} className="text-vine-600" />
          <span className="flex-1">Receive a class announcement<span className={sub}>Alumni services send a notice to your class. It arrives as a notification.</span></span>
        </button>

        <div className={item}>
          <AlertTriangle size={19} className="text-amber-600" />
          <span className="flex-1">Show account-warning notice<span className={sub}>Appears on Find and Profile.</span></span>
          <Toggle on={s.showWarning} onChange={(showWarning) => s.set({ showWarning })} label="Show account warning" />
        </div>

        {/* either walkthrough starts from fresh data, as the student in the full app */}
        <div className={item}>
          <Footprints size={19} className="text-vine-600" />
          <span className="flex-1">Start the walkthrough<span className={sub}>Resets the demo data and shows you round.</span></span>
          <span className="flex shrink-0 gap-1.5">
            <button onClick={() => { close(); s.startTour('quick'); nav('/find') }} className="rounded-full bg-vine-700 px-3 py-1.5 text-xs font-semibold text-cream">Quick</button>
            <button onClick={() => { close(); s.startTour('full'); nav('/find') }} className="rounded-full border border-vine-700 px-3 py-1.5 text-xs font-semibold text-vine-700">Full</button>
          </span>
        </div>

        <button className={`${item} !border-red-200 text-red-700`} onClick={() => { s.reset(); nav('/') }}>
          <RotateCcw size={19} />
          <span className="flex-1">Reset all demo data<span className={sub}>Clears everything and returns to onboarding.</span></span>
        </button>
      </div>
    </Sheet>
  )
}
