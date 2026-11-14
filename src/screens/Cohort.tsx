import { useState } from 'react'
import { CalendarDays, ChevronRight, GraduationCap, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import type { User } from '../types'
import { useKudzu, useNow } from '../store/useKudzu'
import { byCity, cityCohort, classCohort, classLabel, getSchool, isClassEvent, schoolEvents, schoolUsers, strengthOf } from '../services'
import { fmtDateTime } from '../lib/util'
import { LeafIcon } from '../components/brand'
import { Avatar, BackHeader, Chip, EmptyState } from '../components/ui'
import { roleLine } from '../components/ProfileView'
import { KnowButton } from '../components/KnowButton'

/**
 * A cohort is a slice of your school you belong to without joining anything:
 * the people you graduated with, or everyone from your school in a city.
 */
export default function Cohort() {
  const { kind = 'class' } = useParams()
  const s = useKudzu()
  const now = useNow()
  const isClass = kind === 'class'
  const school = getSchool(s.schoolId)
  const [city, setCity] = useState<string | null>(isClass ? null : s.prefs.travelingTo ?? s.me.city)

  // for the city view, everyone at the school is counted so the switcher can show each city's size
  const everyone = isClass ? classCohort(s) : schoolUsers(s.schoolId).filter((u) => !s.blocked.includes(u.id))
  const cities = byCity(everyone)
  const people = (isClass ? (city ? everyone.filter((u) => u.city === city) : everyone) : cityCohort(s, city ?? s.me.city))
    .sort((a, b) => a.name.localeCompare(b.name))
  const known = people.filter((u) => s.connections.some((c) => c.otherId === u.id)).length
  const events = schoolEvents(s, now).filter((e) => (isClass ? isClassEvent(e, s.me) : e.city === city))
  const title = isClass ? classLabel(s.me) : `${school.shortName} in ${city}`

  const row = (u: User) => {
    const conn = s.connections.find((c) => c.otherId === u.id)
    return (
      <div key={u.id} className="flex items-center gap-3 px-3 py-2.5">
        <Link to={conn ? `/network/${u.id}` : `/u/${u.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar user={u} size={42} />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{u.name}</div>
            <div className="truncate text-xs text-ink/55">{roleLine(u)}</div>
            <div className="text-[11px] text-ink/45">{isClass ? u.city : `Class of ${u.gradYear}`}</div>
          </div>
        </Link>
        {conn ? <LeafIcon level={strengthOf(conn, now).level} size={20} /> : <KnowButton user={u} />}
      </div>
    )
  }

  return (
    <div className="app-scroll h-full overflow-y-auto pb-8">
      <BackHeader title={isClass ? 'Your class' : 'Your city'} />
      <div className="bg-vine-700 px-5 pb-5 pt-6 text-cream">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">{isClass ? <GraduationCap size={24} /> : <MapPin size={24} />}</div>
        <h1 className="mt-3 font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-vine-100">
          {people.length} {people.length === 1 ? 'person' : 'people'} from {school.name} on Kudzu{known > 0 && ` · ${known} in your network`}
        </p>
      </div>

      <div className="px-4 pt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">{isClass ? 'Where your class is' : 'Switch city'}</div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {isClass && <Chip tone="plain" active={!city} onClick={() => setCity(null)}>Everywhere · {everyone.length}</Chip>}
          {cities.map(([c, n]) => (
            <Chip key={c} tone="plain" active={city === c} onClick={() => setCity(isClass && city === c ? null : c)}>{c} · {n}</Chip>
          ))}
        </div>

        {events.length > 0 && (
          <>
            <h2 className="mb-2 mt-5 flex items-center gap-2 text-sm font-semibold"><CalendarDays size={15} className="text-coffee-500" /> {isClass ? 'For your class' : `Coming up in ${city}`}</h2>
            <div className="space-y-2">
              {events.slice(0, 3).map((e) => (
                <Link key={e.id} to={`/events/${e.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-sage-200">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-coffee-500">{fmtDateTime(e.start)}</div>
                    <div className="truncate text-sm font-semibold">{e.title}</div>
                  </div>
                  <ChevronRight size={18} className="text-ink/30" />
                </Link>
              ))}
            </div>
          </>
        )}

        <h2 className="mb-2 mt-5 text-sm font-semibold">People</h2>
        {people.length === 0 ? (
          <EmptyState title="No one here yet" body="As more of your school joins, they’ll show up here." />
        ) : (
          <div className="divide-y divide-sage-200 rounded-2xl bg-white ring-1 ring-sage-200">{people.map(row)}</div>
        )}
      </div>
    </div>
  )
}
