import { useState } from 'react'
import { Bell, BookOpen, CalendarCheck, ChevronRight, Eye, HeartHandshake, Hourglass, Lock, LogOut, MapPin, PauseCircle, Pencil, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { User } from '../types'
import { openEvent, useKudzu, useNow } from '../store/useKudzu'
import { accountStanding, getSchool, promptText, receivedThanks, schoolEvents } from '../services'
import { CITIES, ago, fmtDateTime } from '../lib/util'
import { Logo, VineDivider } from '../components/brand'
import { Avatar, Button, Chip, Field, SchoolChip, Sheet, Toggle } from '../components/ui'
import { Background, TopicRows, roleLine } from '../components/ProfileView'
import { PrefsForm } from '../components/PrefsForm'
import { AsksOffersFields, BasicsFields, CapacityField, InterestsField, PathEditor, PromptEditor } from '../components/ProfileEditor'
import { AccountNotice } from '../components/AccountNotice'

function EditSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const me = useKudzu((s) => s.me)
  const updateMe = useKudzu((s) => s.updateMe)
  const say = useKudzu((s) => s.say)
  const [draft, setDraft] = useState<User>(me)
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setDraft(me)
  }
  const up = (patch: Partial<User>) => setDraft((d) => ({ ...d, ...patch }))
  const save = () => {
    updateMe({ ...draft, coords: CITIES[draft.city] ?? draft.coords, prompts: draft.prompts.filter((p) => p.promptId && p.answer.trim()), path: (draft.path ?? []).filter((p) => p.title.trim()) })
    say('Profile updated')
    onClose()
  }
  return (
    <Sheet open={open} onClose={onClose} title="Edit profile">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar user={draft} size={64} />
          <p className="text-xs text-ink/55">This face stands in for your photo. Photo upload comes later.</p>
        </div>
        <BasicsFields value={draft} onChange={up} />
        <AsksOffersFields value={draft} onChange={up} />
        <CapacityField value={draft.capacity} onChange={(capacity) => up({ capacity })} />
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Career path</div>
          <PathEditor value={draft} onChange={up} />
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">Hobbies, clubs and affiliations</div>
          <InterestsField value={draft.interests ?? []} onChange={(interests) => up({ interests })} />
        </div>
        <Field label="Prompts"><PromptEditor value={draft.prompts} onChange={(prompts) => up({ prompts })} /></Field>
        <Button className="w-full" disabled={!draft.name.trim()} onClick={save}>Save changes</Button>
      </div>
    </Sheet>
  )
}

export default function Profile() {
  const s = useKudzu()
  const now = useNow()
  const me = s.me
  const [editing, setEditing] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const simple = s.experience === 'simple'
  const school = getSchool(s.schoolId)
  const myGroups = s.groups.filter((g) => g.schoolId === s.schoolId && me.groupIds.includes(g.id))
  const myEvents = schoolEvents(s, now).filter((e) => e.myRsvp || e.hostId === 'me')
  const thanks = receivedThanks(s)
  const row = 'flex items-center gap-3 px-4 py-3.5'

  return (
    <div className="app-scroll h-full overflow-y-auto pb-8">
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <Logo />
        <SchoolChip />
      </header>

      <div className="flex flex-col items-center px-5 pt-3 text-center">
        <Avatar user={me} size={96} />
        <h1 className="mt-3 font-display text-2xl font-semibold">{me.name}</h1>
        <p className="text-sm text-ink/60">{roleLine(me)}</p>
        <p className="text-xs text-ink/45">{[me.major, `${school.name} ’${String(me.gradYear).slice(2)}`, me.city].filter(Boolean).join(' · ')}</p>
        {me.schoolIds.length > 1 && (
          <p className="text-xs text-ink/45">Also {me.schoolIds.filter((id) => id !== s.schoolId).map((id) => getSchool(id).shortName).join(', ')}</p>
        )}
        {me.verified === 'pending' && <span className="mt-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">Alum verification pending</span>}
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" className="!py-2" onClick={() => setEditing(true)}><Pencil size={15} /> Edit profile</Button>
          <Link to="/u/me" className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-white px-5 py-2 text-sm font-semibold text-vine-800"><Eye size={15} /> Preview</Link>
        </div>
      </div>

      {accountStanding(s) === 'warning' && <div className="mx-4 mt-5"><AccountNotice /></div>}
      {s.paused && <div className="mx-4 mt-4 rounded-2xl bg-sage-100 p-3 text-center text-sm font-medium text-ink/70">Your profile is paused. Nobody new can see you.</div>}

      <section className="mx-4 mt-5 rounded-2xl bg-white p-4 ring-1 ring-sage-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">{me.capacity === 0 ? 'Not taking chats right now' : `Open to ${me.capacity} ${me.capacity === 1 ? 'chat' : 'chats'} per month`}</div>
            <div className="text-xs text-ink/55">{me.capacity === 0 ? 'Nobody can send you a request. You can still ask others.' : `${Math.max(0, me.capacity - me.used)} spots left this month`}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => s.updateMe({ capacity: Math.max(0, me.capacity - 1) })} className="h-8 w-8 rounded-full bg-sage-100 text-lg font-semibold text-vine-700" aria-label="Fewer chats">−</button>
            <button onClick={() => s.updateMe({ capacity: Math.min(10, me.capacity + 1) })} className="h-8 w-8 rounded-full bg-sage-100 text-lg font-semibold text-vine-700" aria-label="More chats">+</button>
          </div>
        </div>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: me.capacity }, (_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i < me.used ? 'bg-coffee-500' : 'bg-sage-200'}`} />)}
        </div>
      </section>

      <section className="mx-4 mt-4 rounded-2xl bg-white p-4 ring-1 ring-sage-200">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><HeartHandshake size={16} className="text-coffee-500" /> Thank-you notes</h2>
          <span className="flex items-center gap-1 text-[11px] text-ink/45"><Lock size={11} /> Only you see these</span>
        </div>
        {thanks.length === 0 ? (
          <p className="mt-2 text-[13px] leading-relaxed text-ink/55">When someone thanks you after a chat, their note shows up here. It’s the one piece of feedback that is shared.</p>
        ) : (
          <>
            <p className="mt-1 text-xs text-ink/55">{thanks.length} {thanks.length === 1 ? 'person has' : 'people have'} thanked you for your time.</p>
            <div className="mt-3 space-y-2.5">
              {thanks.slice(0, 3).map((t) => (
                <Link key={t.from.id + t.at} to={`/messages/${t.from.id}`} className="block rounded-xl bg-coffee-100/60 p-3">
                  <p className="font-display text-[15.5px] leading-snug">“{t.text}”</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-ink/60"><Avatar user={t.from} size={20} /> {t.from.name} · {ago(t.at, now)}</div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="mx-4 mt-4">
        <div className="mb-3"><TopicRows user={me} /></div>
        <div className="mb-3"><Background user={me} /></div>
        <div className="space-y-2">
          {me.prompts.map((p) => (
            <div key={p.promptId} className="rounded-2xl border border-sage-200 bg-white p-3.5">
              <div className="text-xs font-semibold text-coffee-500">{promptText(p.promptId)}</div>
              <div className="mt-1 font-display text-[17px] leading-snug">{p.answer}</div>
            </div>
          ))}
        </div>
      </section>

      <VineDivider />

      <section className={simple ? 'hidden' : 'mx-4'}>
        <h2 className="mb-2 text-sm font-semibold">Your groups</h2>
        {myGroups.length === 0 ? (
          <Link to="/events" className="block rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">You haven’t joined any groups. Browse them in Events → Groups.</Link>
        ) : (
          <div className="flex flex-wrap gap-2">
            {myGroups.map((g) => <Link key={g.id} to={`/groups/${g.id}`}><Chip tone="plain"><span className="h-2 w-2 rounded-full" style={{ background: g.color }} />{g.name}</Chip></Link>)}
          </div>
        )}
      </section>

      <section className={simple ? 'hidden' : 'mx-4 mt-5'}>
        <h2 className="mb-2 text-sm font-semibold">Your events</h2>
        {myEvents.length === 0 ? (
          <Link to="/events" className="block rounded-2xl border border-dashed border-sage-300 p-4 text-center text-sm text-ink/55">No RSVPs yet. Find something in Events.</Link>
        ) : (
          <div className="divide-y divide-sage-200 rounded-2xl bg-white ring-1 ring-sage-200">
            {myEvents.map((e) => (
              <Link key={e.id} to={`/events/${e.id}`} onClick={openEvent(e.id)} className="flex items-center gap-3 px-3.5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{e.title}</div>
                  <div className="text-xs text-ink/55">{fmtDateTime(e.start)}</div>
                </div>
                <span className="rounded-full bg-vine-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-vine-700">{e.hostId === 'me' ? 'Hosting' : e.myRsvp}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-4 mt-6">
        <h2 className="mb-2 text-sm font-semibold">Settings</h2>
        {/* the two apps: one for growing a network, one for keeping it */}
        <div className="mb-3 rounded-2xl bg-white p-3.5 ring-1 ring-sage-200">
          <div className="text-sm font-semibold">What you want from Kudzu</div>
          <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="App style">
            {([['full', 'Grow my network', 'Find, events and the map'], ['simple', 'Keep in touch', 'One simple home screen']] as const).map(([id, label, sub]) => (
              <button key={id} onClick={() => { if (s.experience !== id) { s.set({ experience: id, tourOffered: true }); s.say(id === 'simple' ? 'Switched to the simple app' : 'Switched to the full app') } }} aria-pressed={s.experience === id} className={`rounded-xl border px-3 py-2.5 text-left ${s.experience === id ? 'border-vine-700 bg-vine-50' : 'border-sage-200'}`}>
                <span className="block text-[13px] font-semibold">{label}</span>
                <span className="block text-xs text-ink/55">{sub}</span>
              </button>
            ))}
          </div>
          {simple && (
            <div className="mt-3 flex items-center gap-3">
              <span className="flex-1 text-[13px]"><span className="block font-medium">Show people I could help</span><span className="block text-xs text-ink/50">Students and recent graduates looking for what you offer</span></span>
              <Toggle on={s.openToHelp} onChange={(openToHelp) => s.set({ openToHelp })} label="Show people I could help" />
            </div>
          )}
        </div>
        <div className="divide-y divide-sage-200 rounded-2xl bg-white text-sm ring-1 ring-sage-200">
          {!simple && <button onClick={() => setPrefsOpen(true)} className={`${row} w-full text-left`}><SlidersHorizontal size={18} className="text-vine-600" /><span className="flex-1 font-medium">Who you want to find</span><ChevronRight size={18} className="text-ink/30" /></button>}
          <div className={row}><CalendarCheck size={18} className="text-vine-600" /><span className="flex-1"><span className="font-medium">Calendar</span><span className="block text-xs text-ink/50">{s.calendarConnected ? 'Linked. Coffee chats suggest times you’re free' : 'Link it to find times that work for both of you'}</span></span><Toggle on={s.calendarConnected} onChange={(calendarConnected) => s.set({ calendarConnected })} label="Calendar" /></div>
          <div className={row}><Bell size={18} className="text-vine-600" /><span className="flex-1 font-medium">Notifications</span><Toggle on={s.settings.notifications} onChange={(notifications) => s.set({ settings: { ...s.settings, notifications } })} label="Notifications" /></div>
          {/* The two kinds of reminder the app times for you can each be turned off. Reminders on a rhythm you chose always come. */}
          <div className={row}><MapPin size={18} className="text-vine-600" /><span className="flex-1"><span className="font-medium">Timely reminders</span><span className="block text-xs text-ink/50">When someone you know is in town or has news</span></span><Toggle on={s.settings.nudgeTimely !== false} onChange={(nudgeTimely) => s.set({ settings: { ...s.settings, nudgeTimely } })} label="Timely reminders" /></div>
          <div className={row}><Hourglass size={18} className="text-vine-600" /><span className="flex-1"><span className="font-medium">“It’s been a while” reminders</span><span className="block text-xs text-ink/50">When you haven’t been in touch with someone for some time</span></span><Toggle on={s.settings.nudgeQuiet !== false} onChange={(nudgeQuiet) => s.set({ settings: { ...s.settings, nudgeQuiet } })} label="It’s been a while reminders" /></div>
          <div className={row}><Eye size={18} className="text-vine-600" /><span className="flex-1"><span className="font-medium">Private mode</span><span className="block text-xs text-ink/50">Only people you’ve asked can see you</span></span><Toggle on={s.settings.privateMode} onChange={(privateMode) => s.set({ settings: { ...s.settings, privateMode } })} label="Private mode" /></div>
          <div className={row}><PauseCircle size={18} className="text-vine-600" /><span className="flex-1"><span className="font-medium">Pause my profile</span><span className="block text-xs text-ink/50">Take a break without losing your network</span></span><Toggle on={s.paused} onChange={(paused) => s.set({ paused })} label="Pause my profile" /></div>
          <Link to="/guidelines" className={row}><BookOpen size={18} className="text-vine-600" /><span className="flex-1 font-medium">Community guidelines</span><ChevronRight size={18} className="text-ink/30" /></Link>
          <button onClick={s.signOut} className={`${row} w-full text-left text-coffee-600`}><LogOut size={18} /><span className="flex-1 font-medium">Sign out (replay onboarding)</span></button>
        </div>
      </section>

      <EditSheet open={editing} onClose={() => setEditing(false)} />
      <Sheet open={prefsOpen} onClose={() => setPrefsOpen(false)} title="Who you want to find">
        <PrefsForm prefs={s.prefs} onChange={s.setPrefs} homeCity={me.city} />
        <Button className="mt-6 w-full" onClick={() => setPrefsOpen(false)}>Done</Button>
      </Sheet>
    </div>
  )
}
