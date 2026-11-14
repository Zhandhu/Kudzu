import { useMemo, useState } from 'react'
import { CalendarDays, Lock, MapPin, Plus, Users, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { EventType, Group, KEvent } from '../types'
import { openEvent, useKudzu, useNow } from '../store/useKudzu'
import { eventGuests, getUser, groupMembers, isForYou, schoolEvents } from '../services'
import { CITIES, CITY_NAMES, DAY, coordsFor, fmtDateTime, uid } from '../lib/util'
import { Avatar, Button, Chip, EmptyState, Field, SchoolChip, Sheet, Toggle, inputCls } from '../components/ui'

const TYPE_COLORS: Record<EventType, [string, string]> = {
  Networking: ['#356433', '#679a60'],
  Social: ['#8b5e3c', '#c9a583'],
  Industry: ['#1a301b', '#477d42'],
}

export function EventCover({ e, tall = false }: { e: KEvent; tall?: boolean }) {
  const [a, b] = TYPE_COLORS[e.type]
  return (
    <div className={`relative overflow-hidden ${tall ? 'h-44' : 'h-24'}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
      <svg className="absolute -right-4 -top-2 opacity-25" width="190" height="120" viewBox="0 0 160 100" fill="none" aria-hidden>
        <path d="M0 80c30-50 50-50 70-20s40 30 90-40" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d="M70 60c2-12 9-17 19-17-2 12-8 18-19 17z" fill="#fff" />
        <path d="M118 40c-2-11 3-18 12-21 2 11-2 18-12 21z" fill="#fff" />
      </svg>
      <div className="absolute left-3 top-3 flex gap-1.5">
        <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink">{e.type}</span>
        {e.virtual && <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink"><Video size={11} /> Virtual</span>}
        {e.visibility === 'community' && <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink"><Lock size={10} /> Community</span>}
      </div>
    </div>
  )
}

function EventCard({ e }: { e: KEvent }) {
  const me = useKudzu((s) => s.me)
  const guests = eventGuests(e, me)
  const host = getUser(e.hostId)
  return (
    <Link to={`/events/${e.id}`} onClick={openEvent(e.id)} className="block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sage-200">
      <EventCover e={e} />
      <div className="p-3.5">
        <div className="text-xs font-semibold text-coffee-500">{fmtDateTime(e.start)}</div>
        <h3 className="mt-0.5 font-display text-[17px] font-semibold leading-snug">{e.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-[13px] text-ink/60">{e.virtual ? <Video size={13} /> : <MapPin size={13} />} {e.virtual ? 'Online' : `${e.place} · ${e.city}`}</div>
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">{guests.slice(0, 4).map((g) => <Avatar key={g.id} user={g} size={26} ring />)}</div>
            <span className="text-xs text-ink/55">{guests.length} going{host ? ` · Hosted by ${host.name}` : ''}</span>
          </div>
          {e.myRsvp && <span className="rounded-full bg-vine-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-vine-700">{e.myRsvp}</span>}
        </div>
      </div>
    </Link>
  )
}

function HostSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useKudzu()
  const now = useNow()
  const myGroups = s.groups.filter((g) => g.schoolId === s.schoolId && s.me.groupIds.includes(g.id))
  const defaultWhen = new Date(now + 7 * DAY)
  defaultWhen.setHours(18, 0, 0, 0)
  const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  const [f, setF] = useState({ title: '', type: 'Networking' as EventType, when: toLocal(defaultWhen), virtual: false, place: '', city: s.me.city, capacity: 30, description: '', community: false, groupId: '' })
  const up = (patch: Partial<typeof f>) => setF((x) => ({ ...x, ...patch }))
  const valid = f.title.trim() && (f.virtual || f.place.trim()) && f.when

  const submit = () => {
    const id = `ev-${uid()}`
    s.addEvent({
      id, schoolId: s.schoolId, title: f.title.trim(), hostId: 'me', type: f.type, virtual: f.virtual,
      start: new Date(f.when).getTime(), place: f.virtual ? 'Video call' : f.place.trim(), city: f.virtual ? 'Virtual' : f.city,
      coords: f.virtual ? undefined : coordsFor(f.city in CITIES ? f.city : 'Atlanta', id), capacity: f.capacity,
      description: f.description.trim() || 'Details to come.', visibility: f.community ? 'community' : 'public',
      groupId: f.community && f.groupId ? f.groupId : undefined, industries: [], attendeeIds: [], myRsvp: 'going',
    })
    s.say('Your event is live')
    onClose()
    s.set({ eventOpen: id })
  }

  return (
    <Sheet open={open} onClose={onClose} title="Host an event">
      <div className="space-y-4">
        <Field label="Title"><input className={inputCls} value={f.title} onChange={(e) => up({ title: e.target.value })} placeholder="Saturday coffee in Midtown" /></Field>
        <Field label="Type">
          <div className="flex gap-2">{(['Networking', 'Social', 'Industry'] as EventType[]).map((t) => <Chip key={t} active={f.type === t} onClick={() => up({ type: t })}>{t}</Chip>)}</div>
        </Field>
        <Field label="Date & time"><input type="datetime-local" className={inputCls} value={f.when} onChange={(e) => up({ when: e.target.value })} /></Field>
        <div className="flex items-center justify-between"><span className="text-sm font-medium">Virtual event</span><Toggle on={f.virtual} onChange={(virtual) => up({ virtual })} label="Virtual event" /></div>
        {!f.virtual && (
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-3"><Field label="Location"><input className={inputCls} value={f.place} onChange={(e) => up({ place: e.target.value })} placeholder="Venue or address" /></Field></div>
            <div className="col-span-2"><Field label="City"><select className={inputCls} value={f.city} onChange={(e) => up({ city: e.target.value })}>{CITY_NAMES.map((c) => <option key={c}>{c}</option>)}</select></Field></div>
          </div>
        )}
        <Field label={`Capacity · ${f.capacity} people`}><input type="range" min={4} max={200} step={2} className="w-full" value={f.capacity} onChange={(e) => up({ capacity: +e.target.value })} /></Field>
        <Field label="Description"><textarea className={`${inputCls} h-20 resize-none`} value={f.description} onChange={(e) => up({ description: e.target.value })} placeholder="What should people expect?" /></Field>
        <div className="rounded-2xl border border-sage-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <div><div className="text-sm font-semibold">Community only</div><div className="text-xs text-ink/55">Only members of one of your groups can see it.</div></div>
            <Toggle on={f.community} onChange={(community) => up({ community, groupId: community ? myGroups[0]?.id ?? '' : '' })} label="Community only" />
          </div>
          {f.community && (
            <select className={`${inputCls} mt-3`} value={f.groupId} onChange={(e) => up({ groupId: e.target.value })} aria-label="Group">
              {myGroups.length === 0 && <option value="">Join a group first</option>}
              {myGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          )}
        </div>
        <Button className="w-full" disabled={!valid} onClick={submit}>Publish event</Button>
      </div>
    </Sheet>
  )
}

export function GroupCard({ g }: { g: Group }) {
  const me = useKudzu((s) => s.me)
  const toggle = useKudzu((s) => s.toggleGroup)
  const members = groupMembers(g.id, me)
  const joined = me.groupIds.includes(g.id)
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-sage-200">
      <Link to={`/groups/${g.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: g.color }}><Users size={20} /></div>
        <div className="min-w-0">
          <div className="truncate font-semibold">{g.name}</div>
          <div className="truncate text-[13px] text-ink/55">{members.length} {members.length === 1 ? 'member' : 'members'} · {g.description}</div>
        </div>
      </Link>
      <button onClick={() => toggle(g.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${joined ? 'bg-sage-100 text-vine-700' : 'bg-vine-700 text-cream'}`}>{joined ? 'Joined' : 'Join'}</button>
    </div>
  )
}

function CreateGroupSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useKudzu()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  return (
    <Sheet open={open} onClose={onClose} title="Start a group">
      <div className="space-y-4">
        <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Alumni in Climate Tech" /></Field>
        <Field label="What’s it for?"><textarea className={`${inputCls} h-20 resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Who should join, and what will you do together?" /></Field>
        <Button
          className="w-full" disabled={!name.trim()}
          onClick={() => {
            s.addGroup({ id: `grp-${uid()}`, schoolId: s.schoolId, name: name.trim(), description: description.trim() || 'A new community.', color: '#477d42' })
            s.say('Group created')
            setName(''); setDescription('')
            onClose()
          }}
        >
          Create group
        </Button>
      </div>
    </Sheet>
  )
}

const FILTERS = ['Networking', 'Social', 'Industry', 'Virtual', 'This week'] as const

export default function Events() {
  const s = useKudzu()
  const now = useNow()
  const [tab, setTab] = useState<'foryou' | 'all' | 'groups'>('foryou')
  const [active, setActive] = useState<string[]>([])
  const [hosting, setHosting] = useState(false)
  const [creating, setCreating] = useState(false)

  const events = useMemo(
    () => schoolEvents(s, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s.events, s.schoolId, s.me, s.timeOffsetDays],
  )
  const types = active.filter((a) => a === 'Networking' || a === 'Social' || a === 'Industry')
  const shown = events
    .filter((e) => tab !== 'foryou' || isForYou(e, s.me, s.prefs))
    .filter((e) => types.length === 0 || types.includes(e.type))
    .filter((e) => !active.includes('Virtual') || e.virtual)
    .filter((e) => !active.includes('This week') || e.start < now + 7 * DAY)
  const groups = s.groups.filter((g) => g.schoolId === s.schoolId)

  return (
    <div className="flex h-full flex-col">
      <header className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-semibold">Events</h1>
          <div className="flex items-center gap-2">
            <SchoolChip />
            <button onClick={() => (tab === 'groups' ? setCreating(true) : setHosting(true))} className="flex items-center gap-1 rounded-full bg-vine-700 px-3 py-1.5 text-xs font-semibold text-cream">
              <Plus size={14} /> {tab === 'groups' ? 'New group' : 'Host'}
            </button>
          </div>
        </div>
        <div className="mt-3 flex border-b border-sage-200">
          {([['foryou', 'For You'], ['all', 'All'], ['groups', 'Groups']] as const).map(([v, label]) => (
            <button key={v} onClick={() => setTab(v)} className={`-mb-px flex-1 border-b-2 pb-2 text-sm font-semibold ${tab === v ? 'border-vine-700 text-vine-700' : 'border-transparent text-ink/45'}`}>{label}</button>
          ))}
        </div>
      </header>

      {tab === 'groups' ? (
        <div className="app-scroll min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-4">
          <p className="px-1 text-[13px] text-ink/55">Communities inside your school. Join one to see its members and events.</p>
          {groups.map((g) => <GroupCard key={g.id} g={g} />)}
        </div>
      ) : (
        <>
          <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-4 py-3">
            {FILTERS.map((f) => (
              <Chip key={f} tone="plain" active={active.includes(f)} onClick={() => setActive(active.includes(f) ? active.filter((x) => x !== f) : [...active, f])}>
                {f === 'This week' && <CalendarDays size={13} />}{f}
              </Chip>
            ))}
          </div>
          <div className="app-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
            {shown.length === 0 ? (
              <EmptyState title="Nothing on the calendar" body="No events match those filters. Clear them, or host the first one yourself.">
                <Button onClick={() => setHosting(true)}><Plus size={16} /> Host an event</Button>
              </EmptyState>
            ) : shown.map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        </>
      )}

      <HostSheet open={hosting} onClose={() => setHosting(false)} />
      <CreateGroupSheet open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
