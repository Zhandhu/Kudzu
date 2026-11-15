import { GraduationCap, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useKudzu, useNow } from '../store/useKudzu'
import { alumniServices, cityCohort, classCohort, classLabel, getSchool, isEstablished, unreadAnnouncements } from '../services'

/**
 * One of the two groups a member is in from the start: their class, or their school in
 * their city. It looks like any other group, with "Yours" where the join button would be,
 * and a count when alumni services have posted something not yet read.
 */
export function DefaultGroupCard({ kind }: { kind: 'class' | 'city' }) {
  const s = useKudzu()
  const now = useNow()
  const isClass = kind === 'class'
  const people = isClass ? classCohort(s) : cityCohort(s, s.me.city)
  const known = people.filter((u) => s.connections.some((c) => c.otherId === u.id && isEstablished(c))).length
  const fresh = unreadAnnouncements(s, now).filter((a) => !!a.years === isClass).length
  const Icon = isClass ? GraduationCap : MapPin
  return (
    <Link to={`/cohorts/${kind}`} data-tour={`group-${kind}`} className="flex items-center gap-3 rounded-2xl bg-vine-50 p-3 shadow-sm ring-1 ring-vine-200">
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-vine-700 text-cream"><Icon size={20} />
        {fresh > 0 && <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coffee-500 px-1 text-[10px] font-bold text-white ring-2 ring-cream" aria-label={`${fresh} new from your school`}>{fresh}</span>}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{isClass ? classLabel(s.me) : `${getSchool(s.schoolId).shortName} in ${s.me.city}`}</span>
        <span className="block truncate text-[13px] text-ink/55">{people.length} {people.length === 1 ? 'person' : 'people'} · {known} in your network</span>
        <span className="block truncate text-[11px] text-vine-700">{fresh > 0 ? `${fresh} new from ${alumniServices(s.schoolId)}` : `News from ${alumniServices(s.schoolId)}`}</span>
      </span>
      <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-vine-700 ring-1 ring-vine-200">Yours</span>
    </Link>
  )
}
