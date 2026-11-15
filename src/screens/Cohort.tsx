import { useEffect, useState } from 'react'
import { CalendarDays, ChevronRight, GraduationCap, MapPin, Megaphone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import type { User } from '../types'
import { nowOf, openEvent, useKudzu, useNow } from '../store/useKudzu'
import { alumniServices, unreadAnnouncements, byCity, cityCohort, isEstablished, classCohort, classLabel, getSchool, isClassEvent, schoolEvents, schoolUsers, strengthOf } from '../services'
import { fmtDateTime } from '../lib/util'
import { LeafIcon } from '../components/brand'
import { Avatar, BackHeader, Chip, EmptyState } from '../components/ui'
import { roleLine } from '../components/ProfileView'
import { KnowButton } from '../components/KnowButton'
import { AnnouncementList } from '../components/Announcements'

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
  const [city, setCity] = useState<string | null>(isClass ? null : s.me.city)

  // for the city view, everyone at the school is counted so the switcher can show each city's size
  const everyone = isClass ? classCohort(s) : schoolUsers(s.schoolId).filter((u) => !s.blocked.includes(u.id))
  const cities = byCity(everyone)
  const people = (isClass ? (city ? everyone.filter((u) => u.city === city) : everyone) : cityCohort(s, city ?? s.me.city))
    .sort((a, b) => a.name.localeCompare(b.name))
  const known = people.filter((u) => s.connections.some((c) => c.otherId === u.id && isEstablished(c))).length
  const events = schoolEvents(s, now).filter((e) => (isClass ? isClassEvent(e, s.me) : e.city === city))
  const title = isClass ? classLabel(s.me) : `${school.shortName} in ${city}`
  // the user's own class, or their own city: the group they are in, and the one the school posts to
  const mine = isClass || city === s.me.city
  // posts count as read once the page has been looked at and left
  useEffect(() => () => {
    const st = useKudzu.getState()
    st.markAnnouncementsRead(unreadAnnouncements(st, nowOf(st)).filter((a) => !!a.years === isClass).map((a) => a.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const row = (u: User) => {
    const conn = s.connections.find((c) => c.otherId === u.id && isEstablished(c))
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
      <BackHeader title="Group" />
      <div className="bg-vine-700 px-5 pb-5 pt-6 text-cream">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">{isClass ? <GraduationCap size={26} /> : <MapPin size={26} />}</div>
        <h1 className="mt-3 font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-vine-100">
          {isClass ? 'Everyone you graduated with.' : `Everyone from ${school.name} in ${city}.`} You’re in this group automatically, and {alumniServices(s.schoolId)} posts to it.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium">{people.length} {people.length === 1 ? 'member' : 'members'}{known > 0 && ` · ${known} in your network`}</span>
          {mine && <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-vine-800">Yours</span>}
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* what the school has posted to this group: one way, a few times a year */}
        {mine && (
          <section className="mb-5" data-tour="group-news">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Megaphone size={15} className="text-coffee-500" /> From {alumniServices(s.schoolId)}</h2>
            <AnnouncementList only={isClass ? 'class' : 'city'} />
          </section>
        )}

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
                <Link key={e.id} to={`/events/${e.id}`} onClick={openEvent(e.id)} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-sage-200">
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
