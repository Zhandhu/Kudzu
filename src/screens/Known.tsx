import { useState } from 'react'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { User } from '../types'
import { useKudzu } from '../store/useKudzu'
import { getSchool, schoolUsers, suggestKnown } from '../services'
import { Avatar, BackHeader, EmptyState, inputCls } from '../components/ui'
import { roleLine } from '../components/ProfileView'
import { KnowButton } from '../components/KnowButton'

/** Add people you already know: suggestions first, then search across the whole school. */
export default function Known() {
  const s = useKudzu()
  const [q, setQ] = useState('')
  const school = getSchool(s.schoolId)
  const suggestions = suggestKnown(s)
  const term = q.trim().toLowerCase()
  const results = term
    ? schoolUsers(s.schoolId).filter((u) => !s.blocked.includes(u.id) && [u.name, u.company, u.major].some((f) => f?.toLowerCase().includes(term)))
    : []

  const row = (u: User, reason?: string) => (
    <div key={u.id} className="flex items-center gap-3 px-3 py-2.5">
      <Link to={`/u/${u.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar user={u} size={42} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{u.name}</div>
          <div className="truncate text-xs text-ink/55">{roleLine(u)}</div>
          <div className="truncate text-[11px] text-vine-600">{reason ?? `Class of ${u.gradYear} · ${u.city}`}</div>
        </div>
      </Link>
      <KnowButton user={u} />
    </div>
  )

  return (
    <div className="app-scroll h-full overflow-y-auto pb-8">
      <BackHeader title="People you know" />
      <div className="px-4 pt-4">
        <p className="text-sm leading-relaxed text-ink/65">
          Add classmates, teammates and colleagues from {school.name} you already know. They join your network straight away, so you can keep in touch without matching first.
        </p>
        <div className="relative mt-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input className={`${inputCls} !rounded-full pl-10`} placeholder="Search by name, company or major" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search people" />
        </div>

        {term ? (
          results.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink/50">No one at {school.shortName} matches “{q}”.</p>
          ) : (
            <div className="mt-4 divide-y divide-sage-200 rounded-2xl bg-white ring-1 ring-sage-200">{results.map((u) => row(u))}</div>
          )
        ) : suggestions.length === 0 ? (
          <EmptyState title="No suggestions right now" body="Search above to find someone by name." />
        ) : (
          <>
            <h2 className="mb-2 mt-5 text-sm font-semibold">You may know</h2>
            <div className="divide-y divide-sage-200 rounded-2xl bg-white ring-1 ring-sage-200">
              {suggestions.map((x) => row(x.user, x.reasons.join(' · ')))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
