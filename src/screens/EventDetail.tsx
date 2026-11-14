import L from 'leaflet'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { CalendarDays, Check, ChevronRight, MapPin, Star, Users, Video } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useKudzu } from '../store/useKudzu'
import { eventGuests, getUser } from '../services'
import { fmtDateTime } from '../lib/util'
import { Avatar, BackHeader } from '../components/ui'
import { roleLine } from '../components/ProfileView'
import { EventCover } from './Events'
import { TILE_URL } from '../components/NetworkMap'

const pin = L.divIcon({
  className: 'leaflet-div-icon-clear',
  iconSize: [30, 38],
  iconAnchor: [15, 36],
  html: `<svg width="30" height="38" viewBox="0 0 30 38"><path d="M15 37C8 27 2 21 2 14a13 13 0 0126 0c0 7-6 13-13 23z" fill="#8b5e3c" stroke="#faf6ee" stroke-width="2"/><circle cx="15" cy="14" r="5" fill="#faf6ee"/></svg>`,
})

export default function EventDetail() {
  const { id = '' } = useParams()
  const e = useKudzu((s) => s.events.find((x) => x.id === id))
  const me = useKudzu((s) => s.me)
  const groups = useKudzu((s) => s.groups)
  const rsvp = useKudzu((s) => s.rsvp)
  const say = useKudzu((s) => s.say)
  if (!e) return <><BackHeader title="Event" /><p className="p-8 text-center text-sm text-ink/60">This event is no longer available.</p></>

  const guests = eventGuests(e, me)
  const host = getUser(e.hostId)
  const group = groups.find((g) => g.id === e.groupId)
  const set = (status: 'going' | 'interested') => {
    const next = e.myRsvp === status ? undefined : status
    rsvp(e.id, next)
    say(next === 'going' ? 'You’re going!' : next === 'interested' ? 'Saved to your events' : 'RSVP removed')
  }

  return (
    <div className="app-scroll h-full overflow-y-auto pb-8">
      <BackHeader title="Event" />
      <EventCover e={e} tall />
      <div className="px-5 pt-4">
        <h1 className="font-display text-2xl font-semibold leading-tight">{e.title}</h1>
        {group && <Link to={`/groups/${group.id}`} className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-vine-600">{group.name} <ChevronRight size={14} /></Link>}

        <div className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-center gap-2.5"><CalendarDays size={17} className="text-coffee-500" /> {fmtDateTime(e.start)}</div>
          <div className="flex items-center gap-2.5">{e.virtual ? <Video size={17} className="text-coffee-500" /> : <MapPin size={17} className="text-coffee-500" />} {e.virtual ? 'Online · link sent after RSVP' : `${e.place}, ${e.city}`}</div>
          <div className="flex items-center gap-2.5"><Users size={17} className="text-coffee-500" /> {guests.length} going · {Math.max(0, e.capacity - guests.length)} spots left</div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button onClick={() => set('going')} className={`flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold ${e.myRsvp === 'going' ? 'bg-vine-700 text-cream' : 'border border-vine-700 text-vine-700'}`} aria-pressed={e.myRsvp === 'going'}>
            <Check size={16} /> Going
          </button>
          <button onClick={() => set('interested')} className={`flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold ${e.myRsvp === 'interested' ? 'bg-coffee-500 text-cream' : 'border border-coffee-500 text-coffee-600'}`} aria-pressed={e.myRsvp === 'interested'}>
            <Star size={16} /> Interested
          </button>
        </div>

        <h2 className="mb-1.5 mt-6 text-sm font-semibold">About</h2>
        <p className="text-[14.5px] leading-relaxed text-ink/75">{e.description}</p>

        {host && (
          <Link to={host.id === 'me' ? '/profile' : `/u/${host.id}`} className="mt-4 flex items-center gap-3 rounded-2xl border border-sage-200 bg-white p-3">
            <Avatar user={host} size={40} />
            <div className="min-w-0 flex-1"><div className="text-xs text-ink/50">Hosted by</div><div className="truncate text-sm font-semibold">{host.id === 'me' ? 'You' : host.name}</div></div>
            <ChevronRight size={18} className="text-ink/30" />
          </Link>
        )}

        {!e.virtual && e.coords && (
          <div className="relative z-0 mt-5 h-40 overflow-hidden rounded-2xl ring-1 ring-sage-200">
            <MapContainer center={e.coords} zoom={13} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false} attributionControl={false} className="h-full w-full">
              <TileLayer url={TILE_URL} />
              <Marker position={e.coords} icon={pin} interactive={false} />
            </MapContainer>
          </div>
        )}

        <h2 className="mb-1 mt-6 text-sm font-semibold">Guest list · {guests.length}</h2>
        <p className="mb-2 text-xs text-ink/50">Tap someone to see their profile and connect before the event.</p>
        <div className="divide-y divide-sage-200 rounded-2xl bg-white ring-1 ring-sage-200">
          {guests.length === 0 && <p className="p-4 text-center text-sm text-ink/50">Be the first to RSVP.</p>}
          {guests.map((g) => (
            <Link key={g.id} to={g.id === 'me' ? '/profile' : `/u/${g.id}`} className="flex items-center gap-3 px-3 py-2.5">
              <Avatar user={g} size={40} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{g.id === 'me' ? `${g.name} (you)` : g.name}</div>
                <div className="truncate text-xs text-ink/55">{roleLine(g)}</div>
              </div>
              <ChevronRight size={18} className="text-ink/30" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
