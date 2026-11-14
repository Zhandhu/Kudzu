import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { Strength } from '../types'
import { APP_NAME, STRENGTH_META } from '../config/brand'
import { useKudzu } from '../store/useKudzu'

/** Wordmark with a small curling tendril. Tap three times to open the demo panel. */
export function Logo({ size = 24, light = false }: { size?: number; light?: boolean }) {
  const taps = useRef<number[]>([])
  const set = useKudzu((s) => s.set)
  const color = light ? '#faf6ee' : '#2b502a'
  const onTap = () => {
    const t = Date.now()
    taps.current = [...taps.current.filter((x) => t - x < 900), t]
    if (taps.current.length >= 3) {
      taps.current = []
      set({ demoOpen: true })
    }
  }
  return (
    <button onClick={onTap} className="flex select-none items-center gap-1" aria-label={APP_NAME}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 21c0-7 2-11 7-13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 8c1-4 4-6 8-6 0 5-2 8-6 8-1 0-2-1-2-2z" fill={color} />
        <path d="M8.5 13.5c-2.5.5-4-1-4-2.6 0-1.3 1-2.1 2-2.1 1 0 1.6.7 1.6 1.4" stroke={light ? '#e0c9b1' : '#8b5e3c'} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span className="font-display font-semibold tracking-tight" style={{ fontSize: size * 0.95, color, lineHeight: 1 }}>
        {APP_NAME}
      </span>
    </button>
  )
}

/** Connection-strength leaf. Four states: full, lighter, yellowing, curled brown. */
export function LeafIcon({ level, size = 18 }: { level: Strength; size?: number }) {
  const c = STRENGTH_META[level].color
  if (level === 'dormant') {
    return (
      // a closed bud on its stem: resting, and ready to open again
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label={STRENGTH_META.dormant.label}>
        <path d="M12 22v-8" stroke={c} strokeWidth="2" strokeLinecap="round" />
        <path d="M12 3.500c-3.200 2.600-4.300 5.400-3.500 8 .500 1.700 1.900 2.700 3.500 2.700s3-1 3.500-2.700c.800-2.600-.300-5.400-3.500-8z" fill={c} />
        <path d="M12 6v8" stroke="#fff" strokeOpacity=".55" strokeWidth="1" strokeLinecap="round" />
        <path d="M12 18.500c-1.600-.200-2.800-1-3.500-2.300M12 17c1.500-.100 2.700-.800 3.400-1.900" stroke={c} strokeWidth="1.500" strokeLinecap="round" opacity=".7" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label={STRENGTH_META[level].label}>
      <path d="M12 2.5C6.5 6 4 10.5 5 15.5c.8 4 3.800 6 7 6s6.200-2 7-6c1-5-1.500-9.500-7-13z" fill={c} />
      <path d="M12 6v15M12 11l-3.200-2.200M12 11l3.200-2.200M12 15.500l-4-2.500M12 15.500l4-2.500" stroke="#fff" strokeOpacity={level === 'fading' ? 0.75 : 0.5} strokeWidth="1" strokeLinecap="round" />
      {level === 'fading' && (
        <>
          <circle cx="9" cy="17" r="1.1" fill="#8b5e3c" opacity=".7" />
          <circle cx="15.500" cy="12" r=".9" fill="#8b5e3c" opacity=".7" />
          <path d="M17.800 17.500c.9-1.200 1.200-2.200 1.200-3.500" stroke="#8b5e3c" strokeWidth="1.400" strokeLinecap="round" opacity=".7" />
        </>
      )}
    </svg>
  )
}

export function StrengthBadge({ level }: { level: Strength }) {
  const m = STRENGTH_META[level]
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-medium" style={{ color: m.color, border: `1px solid ${m.color}33` }}>
      <LeafIcon level={level} size={13} />
      {m.label}
    </span>
  )
}

/** A light curling vine line, used for empty states and dividers. */
export function Tendril({ className = '', width = 160, animate = false }: { className?: string; width?: number; animate?: boolean }) {
  const d = 'M4 30c18-22 34-22 46-8s24 14 36 0 26-18 38-6 18 14 32 4'
  return (
    <svg className={className} width={width} height={(width * 44) / 160} viewBox="0 0 160 44" fill="none" aria-hidden>
      <motion.path
        d={d}
        stroke="#679a60"
        strokeWidth="1.600"
        strokeLinecap="round"
        initial={animate ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.400, ease: 'easeInOut' }}
      />
      <path d="M50 22c1-6 5-9 10-9-1 6-4 9-10 9z" fill="#94b98d" />
      <path d="M86 22c-1 6 2 10 7 11 1-6-2-10-7-11z" fill="#679a60" />
      <path d="M124 16c2-6 6-8 11-7-2 6-6 8-11 7z" fill="#94b98d" />
    </svg>
  )
}

export function VineDivider() {
  return (
    <div className="my-4 flex items-center justify-center gap-3 text-sage-300">
      <div className="h-px flex-1 bg-sage-200" />
      <Tendril width={64} />
      <div className="h-px flex-1 bg-sage-200" />
    </div>
  )
}

/**
 * A request, drawn as a tendril: the curl a vine sends out before it takes
 * hold, with a bud on the end. It becomes a leaf once the request is accepted.
 */
export function TendrilIcon({ size = 18, color = '#356433' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 22.5C12 16 7.5 13 7.5 8.6a5 5 0 0 1 10 0c0 2.9-2.2 4.7-4.4 4.7-1.7 0-2.9-1.3-2.7-3.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="10.4" cy="9.8" r="2.4" fill="#94b98d" stroke={color} strokeWidth="1.1" />
    </svg>
  )
}
