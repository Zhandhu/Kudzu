import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronLeft, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { User } from '../types'
import { avatarGradient, initials } from '../lib/util'
import { useKudzu } from '../store/useKudzu'
import { getSchool, listSchools } from '../services'
import { Tendril } from './brand'

/** Element inside the phone frame that sheets and overlays render into. */
export const OverlayContext = createContext<HTMLElement | null>(null)

export function Portal({ children }: { children: ReactNode }) {
  const el = useContext(OverlayContext)
  return el ? createPortal(children, el) : null
}

export function Avatar({ user, size = 44, ring = false }: { user: Pick<User, 'id' | 'name'>; size?: number; ring?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${ring ? 'ring-2 ring-cream' : ''}`}
      style={{ width: size, height: size, background: avatarGradient(user.id + user.name), fontSize: size * 0.38 }}
    >
      {initials(user.name)}
    </div>
  )
}

export function Chip({
  children, active = false, onClick, tone = 'sage', small = false,
}: { children: ReactNode; active?: boolean; onClick?: () => void; tone?: 'sage' | 'coffee' | 'plain'; small?: boolean }) {
  const base = small ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1.5 text-[13px]'
  const tones = {
    sage: active ? 'bg-vine-700 text-cream border-vine-700' : 'bg-sage-100 text-vine-800 border-sage-200',
    coffee: active ? 'bg-coffee-500 text-cream border-coffee-500' : 'bg-coffee-100 text-coffee-700 border-coffee-200',
    plain: active ? 'bg-vine-700 text-cream border-vine-700' : 'bg-white text-ink border-sage-200',
  }
  const cls = `inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-medium transition-colors ${base} ${tones[tone]}`
  return onClick ? (
    <button type="button" onClick={onClick} className={cls}>{children}</button>
  ) : (
    <span className={cls}>{children}</span>
  )
}

export function Button({
  children, onClick, variant = 'primary', className = '', disabled = false, type = 'button',
}: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'coffee' | 'danger'; className?: string; disabled?: boolean; type?: 'button' | 'submit' }) {
  const v = {
    primary: 'bg-vine-700 text-cream hover:bg-vine-800',
    coffee: 'bg-coffee-500 text-cream hover:bg-coffee-600',
    secondary: 'bg-white text-vine-800 border border-sage-200 hover:bg-sage-50',
    ghost: 'text-vine-700 hover:bg-sage-100',
    danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
  }[variant]
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-40 ${v} ${className}`}
    >
      {children}
    </button>
  )
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="pointer-events-auto absolute inset-0 z-40 flex items-end bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="app-scroll max-h-[90%] w-full overflow-y-auto rounded-t-3xl bg-cream px-5 pb-8 pt-3"
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-sage-300" />
              {title && (
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold">{title}</h2>
                  <button onClick={onClose} className="rounded-full p-1.5 text-ink/60 hover:bg-sage-100" aria-label="Close"><X size={20} /></button>
                </div>
              )}
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? 'bg-vine-600' : 'bg-sage-300'}`}
    >
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )
}

export function DualRange({ min, max, value, onChange }: { min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void }) {
  const [lo, hi] = value
  const pct = (v: number) => ((v - min) / (max - min)) * 100
  return (
    <div className="relative h-8">
      <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-sage-200" />
      <div className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-vine-600" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
      <input type="range" className="dual" min={min} max={max} value={lo} onChange={(e) => onChange([Math.min(+e.target.value, hi), hi])} aria-label="Minimum" />
      <input type="range" className="dual" min={min} max={max} value={hi} onChange={(e) => onChange([lo, Math.max(+e.target.value, lo)])} aria-label="Maximum" />
    </div>
  )
}

export function EmptyState({ title, body, children }: { title: string; body?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 py-12 text-center">
      <Tendril animate />
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      {body && <p className="mt-1 text-sm text-ink/60">{body}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}

/** Header for pushed (non-tab) screens. */
export function BackHeader({ title, right }: { title?: string; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-sage-200 bg-cream/95 px-3 py-3 backdrop-blur">
      <button onClick={() => nav(-1)} className="rounded-full p-1.5 hover:bg-sage-100" aria-label="Back"><ChevronLeft size={22} /></button>
      <h1 className="flex-1 truncate font-display text-lg font-semibold">{title}</h1>
      {right}
    </div>
  )
}

/**
 * The school network being looked at. Tapping it lists the user's networks:
 * one is the default the app opens on, and the others are a tap away.
 */
export function SchoolChip() {
  const schoolId = useKudzu((s) => s.schoolId)
  const homeSchoolId = useKudzu((s) => s.homeSchoolId)
  const me = useKudzu((s) => s.me)
  const { viewSchool, setHomeSchool, addSchool } = useKudzu.getState()
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const school = getSchool(schoolId)
  const others = listSchools().filter((sc) => !me.schoolIds.includes(sc.id))
  const close = () => { setOpen(false); setAdding(false) }
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink/70" aria-label={`${school.shortName}. Your school networks`}>
        <span className="h-2 w-2 rounded-full" style={{ background: school.accent }} />
        {school.shortName}
        <ChevronDown size={12} className="text-ink/40" />
      </button>
      <Sheet open={open} onClose={close} title={adding ? 'Add a school' : 'Your school networks'}>
        {adding ? (
          <div className="space-y-2">
            <p className="mb-3 text-sm text-ink/60">Add another school you have a degree from. You’ll be able to swap into its network.</p>
            {others.map((sc) => (
              <button key={sc.id} onClick={() => { addSchool({ schoolId: sc.id, level: 'Master’s', major: '', gradYear: me.gradYear }); setAdding(false) }} className="flex w-full items-center gap-3 rounded-2xl border border-sage-200 bg-white p-3 text-left">
                <span className="h-9 w-9 shrink-0 rounded-xl" style={{ background: sc.accent }} />
                <span className="min-w-0 flex-1"><span className="block font-semibold">{sc.name}</span><span className="block text-xs text-ink/50">{sc.city}</span></span>
              </button>
            ))}
            {others.length === 0 && <p className="py-4 text-center text-sm text-ink/55">You’re in every school on Kudzu.</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {me.schoolIds.map((id) => {
              const sc = getSchool(id)
              const d = me.degrees?.find((x) => x.schoolId === id)
              const isHome = id === homeSchoolId
              const viewing = id === schoolId
              return (
                <div key={id} className={`rounded-2xl border p-3 ${viewing ? 'border-vine-600 bg-vine-50' : 'border-sage-200 bg-white'}`}>
                  <button onClick={() => { viewSchool(id); close() }} className="flex w-full items-center gap-3 text-left" aria-pressed={viewing} aria-label={`Open ${sc.name}`}>
                    <span className="h-9 w-9 shrink-0 rounded-xl" style={{ background: sc.accent }} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 font-semibold">{sc.name}{isHome && <span className="rounded-full bg-vine-700 px-2 py-0.5 text-[10px] font-bold uppercase text-cream">Default</span>}</span>
                      <span className="block text-xs text-ink/50">{d ? `${d.level}${d.major ? ` · ${d.major}` : ''} · ’${String(d.gradYear).slice(2)}` : sc.city}{viewing ? ' · Viewing now' : ''}</span>
                    </span>
                  </button>
                  {!isHome && <button onClick={() => setHomeSchool(id)} className="mt-2 text-[12px] font-semibold text-vine-700 underline underline-offset-4">Make this my default</button>}
                </div>
              )
            })}
            <button onClick={() => setAdding(true)} className="w-full rounded-2xl border border-dashed border-sage-300 p-3 text-center text-sm font-semibold text-vine-700">+ Add another school</button>
            <p className="px-1 pt-1 text-xs text-ink/50">Everything you see is from one school at a time. The app opens on your default.</p>
          </div>
        )}
      </Sheet>
    </>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</span>
      {children}
    </label>
  )
}

export const inputCls =
  'w-full rounded-xl border border-sage-200 bg-white px-3.5 py-2.5 text-sm outline-none placeholder:text-ink/35 focus:border-vine-500'

export function Toast() {
  const toast = useKudzu((s) => s.toast)
  const set = useKudzu((s) => s.set)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => set({ toast: null }), 2600)
    return () => clearTimeout(t)
  }, [toast, set])
  return (
    <Portal>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 top-4 z-[60] flex justify-center px-6"
          >
            <div className="rounded-full bg-ink px-4 py-2 text-center text-[13px] font-medium text-cream shadow-lg">{toast.text}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Portal>
  )
}
