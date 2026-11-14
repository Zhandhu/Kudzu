import { HandHeart, Sprout, UserRoundPlus } from 'lucide-react'

export type LeafKey = 'reach' | 'pending' | 'grow'

export interface LeafItem {
  key: LeafKey
  label: string
  /** Shown in the blossom. Zero hides it. */
  count: number
  onClick: () => void
}

/** Size of the corner area the sprig lives in, and the point it grows from. */
const BOX = 136
const ORIGIN = 118
const REACH = 66
const LEAF = 44

/** `turn` is how far each leaf leans from pointing straight up, in degrees. */
const LOOK: Record<LeafKey, { color: string; icon: typeof Sprout; turn: number }> = {
  reach: { color: '#2b502a', icon: HandHeart, turn: -10 },
  pending: { color: '#8b5e3c', icon: UserRoundPlus, turn: -45 },
  grow: { color: '#6fa565', icon: Sprout, turn: -80 },
}

const LEAF_PATH = 'M12 2.5C6.5 6 4 10.5 5 15.5c.8 4 3.8 6 7 6s6.2-2 7-6c1-5-1.5-9.5-7-13z'

/** Where a leaf's centre sits, given how far it leans. */
function place(turn: number, distance = REACH) {
  const a = (turn * Math.PI) / 180
  return { x: ORIGIN + Math.sin(a) * distance, y: ORIGIN - Math.cos(a) * distance }
}

/** The count at which the blossom reaches its darkest purple. */
const FULL_BLOOM = 8

/** Five petals around the centre, the first pointing straight up. */
const PETALS = [0, 1, 2, 3, 4].map((k) => {
  const a = ((-90 + k * 72) * Math.PI) / 180
  return { cx: 12 + Math.cos(a) * 6.4, cy: 12 + Math.sin(a) * 6.4 }
})

/**
 * The notification bubble, drawn as a kudzu blossom with the count in its centre.
 * Kudzu flowers are purple, and this one deepens as the count rises: pale lilac
 * for one, dark purple for eight or more. The number is always shown as well, so
 * the shade adds to the count and never replaces it.
 */
export function Blossom({ n, className = '' }: { n: number; className?: string }) {
  if (n <= 0) return null
  const depth = Math.min(1, (n - 1) / (FULL_BLOOM - 1))
  const petal = 84 - depth * 46 // lightness: 84% down to 38%
  const centre = Math.max(22, petal - 16)
  return (
    <span className={`pointer-events-none absolute block h-[26px] w-[26px] ${className}`} aria-hidden>
      <svg width="26" height="26" viewBox="0 0 24 24">
        {PETALS.map((p, k) => (
          <circle key={k} cx={p.cx} cy={p.cy} r="5.2" fill={`hsl(276 58% ${petal}%)`} stroke="#faf6ee" strokeWidth="1" />
        ))}
        <circle cx="12" cy="12" r="5.6" fill={`hsl(276 62% ${centre}%)`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9.5px] font-bold leading-none" style={{ color: centre < 58 ? '#fff' : '#3b1560' }}>
        {n > 9 ? '9+' : n}
      </span>
    </span>
  )
}

/**
 * Three leaves sprouting from the bottom-right corner of the Network tab.
 * Each opens one part of the page that used to sit above the network.
 */
export function LeafSprig({ items }: { items: LeafItem[] }) {
  return (
    <div
      className="pointer-events-none absolute bottom-0 right-0 z-[1100]"
      style={{ width: BOX, height: BOX, background: 'radial-gradient(circle at 100% 100%, rgba(250,246,238,0.96) 0, rgba(250,246,238,0.9) 52%, rgba(250,246,238,0) 74%)' }}
    >
      {/* stems running from the corner to each leaf */}
      <svg className="absolute inset-0" width={BOX} height={BOX} viewBox={`0 0 ${BOX} ${BOX}`} fill="none" aria-hidden>
        {items.map((i) => {
          const base = place(LOOK[i.key].turn, REACH - LEAF / 2 + 4)
          return <path key={i.key} d={`M${BOX} ${BOX} Q${ORIGIN} ${ORIGIN} ${base.x} ${base.y}`} stroke="#94b98d" strokeWidth="2" strokeLinecap="round" />
        })}
      </svg>

      {items.map((i) => {
        const look = LOOK[i.key]
        const at = place(look.turn)
        return (
          <button
            key={i.key}
            onClick={i.onClick}
            title={i.label}
            aria-label={i.count > 0 ? `${i.label}, ${i.count} waiting` : i.label}
            className="group pointer-events-auto absolute"
            style={{ left: at.x - LEAF / 2, top: at.y - LEAF / 2, width: LEAF, height: LEAF }}
          >
            <span className="relative block h-full w-full drop-shadow-sm transition-transform group-hover:scale-110 group-active:scale-95">
              <svg width={LEAF} height={LEAF} viewBox="0 0 24 24" aria-hidden>
                <g transform={`rotate(${look.turn} 12 12)`}>
                  <path d={LEAF_PATH} fill={look.color} />
                  <path d="M12 6v15" stroke="#fff" strokeOpacity=".28" strokeWidth=".8" strokeLinecap="round" />
                </g>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white"><look.icon size={16} /></span>
            </span>
            <Blossom n={i.count} className="-left-2 -top-2" />
          </button>
        )
      })}
    </div>
  )
}
