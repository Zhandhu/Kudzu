import type { Prefs } from '../types'
import { INDUSTRIES, INTENTIONS } from '../config/brand'
import { CITY_NAMES } from '../lib/util'
import { Chip, DualRange } from './ui'

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

/** Matching preferences. Shared by the Meet filter sheet, Profile and onboarding. */
export function PrefsForm({ prefs, onChange, homeCity }: { prefs: Prefs; onChange: (patch: Partial<Prefs>) => void; homeCity: string }) {
  const h = 'mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50'
  return (
    <div className="space-y-6">
      <section>
        <div className={h}>Show me</div>
        <div className="flex gap-2">
          {(['both', 'student', 'alum'] as const).map((v) => (
            <Chip key={v} active={prefs.show === v} onClick={() => onChange({ show: v })}>
              {v === 'both' ? 'Both' : v === 'student' ? 'Students' : 'Alumni'}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <div className={h}>Grad year</div>
          <div className="text-sm font-semibold text-vine-700">{prefs.gradRange[0]} – {prefs.gradRange[1]}</div>
        </div>
        <DualRange min={2005} max={2030} value={prefs.gradRange} onChange={(gradRange) => onChange({ gradRange })} />
        <div className="flex justify-between text-[11px] text-ink/45"><span>More experienced</span><span>Current students</span></div>
      </section>

      <section>
        <div className={h}>Industries</div>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((i) => (
            <Chip key={i} active={prefs.industries.includes(i)} onClick={() => onChange({ industries: toggle(prefs.industries, i) })}>{i}</Chip>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-ink/45">Leave empty to see every industry.</p>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <div className={h}>Distance</div>
          <div className="text-sm font-semibold text-vine-700">{prefs.maxDistance >= 3000 ? 'Anywhere' : `Within ${prefs.maxDistance} mi`}</div>
        </div>
        <input
          type="range" min={0} max={7} step={1} className="w-full"
          value={DIST_STEPS.indexOf(prefs.maxDistance) === -1 ? 7 : DIST_STEPS.indexOf(prefs.maxDistance)}
          onChange={(e) => onChange({ maxDistance: DIST_STEPS[+e.target.value] })}
          aria-label="Maximum distance"
        />
      </section>

      <section>
        <div className={h}>Location</div>
        <div className="flex flex-wrap gap-2">
          <Chip active={!prefs.travelingTo} onClick={() => onChange({ travelingTo: null })}>Current city · {homeCity}</Chip>
        </div>
        <div className="mt-3 text-[13px] font-medium text-ink/70">Traveling to…</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {CITY_NAMES.filter((c) => c !== homeCity).map((c) => (
            <Chip key={c} tone="coffee" active={prefs.travelingTo === c} onClick={() => onChange({ travelingTo: prefs.travelingTo === c ? null : c })}>{c}</Chip>
          ))}
        </div>
      </section>

      <section>
        <div className={h}>Looking for</div>
        <div className="flex flex-wrap gap-2">
          {INTENTIONS.map((i) => (
            <Chip key={i} active={prefs.intentions.includes(i)} onClick={() => onChange({ intentions: toggle(prefs.intentions, i) })}>{i}</Chip>
          ))}
        </div>
      </section>
    </div>
  )
}

const DIST_STEPS = [10, 25, 50, 100, 250, 500, 1000, 3000]
