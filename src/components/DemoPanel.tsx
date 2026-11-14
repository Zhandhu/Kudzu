import { AlertTriangle, ClipboardCheck, FastForward, GraduationCap, Heart, HeartHandshake, RotateCcw, UserRoundCog } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useKudzu } from '../store/useKudzu'
import { buildDeck, findCheckinTarget, listSchools, receiveThanks } from '../services'
import { Chip, Sheet, Toggle } from './ui'

/** Presenter controls. Open by tapping the logo three times or the wrench button. */
export default function DemoPanel() {
  const s = useKudzu()
  const nav = useNavigate()
  const close = () => s.set({ demoOpen: false })

  const triggerMatch = () => {
    const next = buildDeck(s)[0]
    close()
    if (!next) return s.say('No one left in the deck. Reset passes or widen filters.')
    s.swipe(next.id, 'like', undefined, true)
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

        <button className={item} onClick={() => { s.fastForward(30); close(); nav('/network') }}>
          <FastForward size={19} className="text-coffee-500" />
          <span className="flex-1">Fast-forward one month<span className={sub}>Connections fade and new nudges appear.{s.timeOffsetDays > 0 ? ` Currently +${s.timeOffsetDays} days.` : ''}</span></span>
        </button>

        <button className={item} onClick={triggerMatch}>
          <Heart size={19} className="text-coffee-500" />
          <span className="flex-1">Trigger a new match<span className={sub}>Matches you with the next person in Meet.</span></span>
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

        <div className={item}>
          <AlertTriangle size={19} className="text-amber-600" />
          <span className="flex-1">Show account-warning notice<span className={sub}>Appears on Meet and Profile.</span></span>
          <Toggle on={s.showWarning} onChange={(showWarning) => s.set({ showWarning })} label="Show account warning" />
        </div>

        <div className={`${item} flex-col !items-start`}>
          <span>Network layout<span className={sub}>Two designs to compare. Both keep your network first.</span></span>
          <div className="flex flex-wrap gap-2">
            <Chip active={s.networkLayout !== 'row'} onClick={() => { s.set({ networkLayout: 'dock' }); close(); nav('/network') }}>Floating leaves</Chip>
            <Chip active={s.networkLayout === 'row'} onClick={() => { s.set({ networkLayout: 'row' }); close(); nav('/network') }}>Row under the header</Chip>
          </div>
        </div>

        <button className={`${item} !border-red-200 text-red-700`} onClick={() => { s.reset(); nav('/') }}>
          <RotateCcw size={19} />
          <span className="flex-1">Reset all demo data<span className={sub}>Clears everything and returns to onboarding.</span></span>
        </button>
      </div>
    </Sheet>
  )
}
