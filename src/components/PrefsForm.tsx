import type { Prefs } from '../types'
import { INDUSTRIES } from '../config/brand'
import { LEVELS } from '../services'
import { CITY_NAMES } from '../lib/util'
import { Chip } from './ui'

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

/**
 * "Who do you want to find?" Asked once at sign-up and editable from Profile.
 * These answers decide who is shown first. They never hide anyone: a search
 * still finds everybody.
 */
export function PrefsForm({ prefs, onChange, homeCity }: { prefs: Prefs; onChange: (patch: Partial<Prefs>) => void; homeCity: string }) {
  const h = 'mb-1 text-sm font-semibold'
  const sub = 'mb-2 text-xs text-ink/55'
  return (
    <div className="space-y-6">
      <section>
        <div className={h}>Which fields interest you?</div>
        <p className={sub}>Pick any that you work in or are curious about.</p>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((i) => (
            <Chip key={i} active={prefs.industries.includes(i)} onClick={() => onChange({ industries: toggle(prefs.industries, i) })}>{i}</Chip>
          ))}
        </div>
      </section>

      <section>
        <div className={h}>Which cities matter to you?</div>
        <p className={sub}>Where you live, where you’re from, or where you might move.</p>
        <div className="flex flex-wrap gap-2">
          {CITY_NAMES.map((c) => (
            <Chip key={c} tone="coffee" active={prefs.cities.includes(c)} onClick={() => onChange({ cities: toggle(prefs.cities, c) })}>
              {c}{c === homeCity ? ' · home' : ''}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <div className={h}>Who would you most like to hear from?</div>
        <p className={sub}>Leave empty for everyone.</p>
        <div className="space-y-2">
          {LEVELS.map((l) => {
            const on = prefs.levels.includes(l.id)
            return (
              <button key={l.id} onClick={() => onChange({ levels: toggle(prefs.levels, l.id) })} className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left ${on ? 'border-vine-700 bg-vine-700 text-cream' : 'border-sage-200 bg-white'}`} aria-pressed={on}>
                <span className="text-sm font-semibold">{l.label}</span>
                <span className={`text-xs ${on ? 'text-vine-100' : 'text-ink/50'}`}>{l.hint}</span>
              </button>
            )
          })}
        </div>
      </section>

      <p className="rounded-xl bg-sage-100 px-3.5 py-2.5 text-xs leading-relaxed text-ink/65">
        These choices put the right people first. They don’t hide anyone, so you can always search for someone outside them.
      </p>
    </div>
  )
}
