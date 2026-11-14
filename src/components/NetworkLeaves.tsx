import { HandHeart, Sprout, UserRoundPlus } from 'lucide-react'

export type LeafKey = 'reach' | 'pending' | 'grow'

export interface LeafItem {
  key: LeafKey
  label: string
  /** Shown in the berry. Zero hides it. */
  count: number
  onClick: () => void
}

const LOOK: Record<LeafKey, { color: string; icon: typeof Sprout; tilt: number }> = {
  reach: { color: '#2b502a', icon: HandHeart, tilt: 14 },
  pending: { color: '#8b5e3c', icon: UserRoundPlus, tilt: 0 },
  grow: { color: '#6fa565', icon: Sprout, tilt: -14 },
}

const LEAF_PATH = 'M12 2.5C6.5 6 4 10.5 5 15.5c.8 4 3.8 6 7 6s6.2-2 7-6c1-5-1.5-9.5-7-13z'

/**
 * The notification bubble, drawn as a berry: a small round fruit with a green
 * calyx on top, holding the count.
 */
export function Berry({ n, className = '' }: { n: number; className?: string }) {
  if (n <= 0) return null
  return (
    <span className={`pointer-events-none absolute flex h-[19px] min-w-[19px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white ring-2 ring-cream ${className}`} style={{ background: 'radial-gradient(circle at 35% 30%, #c0563f, #96341f)' }} aria-hidden>
      <svg className="absolute -top-[6px] left-1/2 -translate-x-1/2" width="10" height="7" viewBox="0 0 10 7" fill="none">
        <path d="M5 7V3M5 4C3 4 1.5 3 1 1M5 4c2 0 3.5-1 4-3" stroke="#356433" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {n > 9 ? '9+' : n}
    </span>
  )
}

const aria = (i: LeafItem) => (i.count > 0 ? `${i.label}, ${i.count} waiting` : i.label)

/**
 * Option A: three leaves hanging from a vine, floating above the tab bar.
 * Each leaf hangs from its stem, so the tip points down.
 */
export function LeafDock({ items }: { items: LeafItem[] }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-[1100] flex justify-center">
      <div className="pointer-events-auto relative flex items-start rounded-[28px] bg-cream/90 px-3 pb-2 pt-3 shadow-lg ring-1 ring-sage-200 backdrop-blur">
        {/* the vine the leaves hang from */}
        <svg className="pointer-events-none absolute left-3 right-3 top-[7px]" height="12" viewBox="0 0 228 12" preserveAspectRatio="none" fill="none" aria-hidden style={{ width: 'calc(100% - 24px)' }}>
          <path d="M2 7c20-7 36-7 56 0s36 7 56 0 36-7 56 0 36 7 56 0" stroke="#94b98d" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {items.map((i) => {
          const look = LOOK[i.key]
          return (
            <button key={i.key} onClick={i.onClick} aria-label={aria(i)} className="group relative flex w-[80px] flex-col items-center">
              <span className="relative block transition-transform group-hover:scale-110 group-active:scale-95">
                <svg width="50" height="50" viewBox="0 0 24 24" aria-hidden>
                  {/* turned upside down so the leaf hangs from the vine, tip pointing down */}
                  <g transform={`rotate(${180 + look.tilt} 12 12)`}>
                    <path d={LEAF_PATH} fill={look.color} />
                    <path d="M12 6v17" stroke="#fff" strokeOpacity=".28" strokeWidth=".8" strokeLinecap="round" />
                  </g>
                </svg>
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center pb-2 text-white"><look.icon size={18} /></span>
              </span>
              <Berry n={i.count} className="right-[11px] top-[1px]" />
              <span className="mt-1 whitespace-nowrap text-[10.5px] font-semibold text-ink/75">{i.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Option B: a slim row under the header. Never covers the list or the map. */
export function LeafRow({ items }: { items: LeafItem[] }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {items.map((i) => {
        const look = LOOK[i.key]
        return (
          <button key={i.key} onClick={i.onClick} aria-label={aria(i)} className="relative flex items-center justify-center gap-1 rounded-full border border-sage-200 bg-white px-1.5 py-2 text-[11.5px] font-semibold text-ink/80 hover:bg-sage-50">
            <svg className="shrink-0" width="17" height="17" viewBox="0 0 24 24" aria-hidden>
              <path d={LEAF_PATH} fill={look.color} />
              <path d="M12 6v15" stroke="#fff" strokeOpacity=".3" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span className="whitespace-nowrap">{i.label}</span>
            <Berry n={i.count} className="-right-1 -top-1.5" />
          </button>
        )
      })}
    </div>
  )
}
