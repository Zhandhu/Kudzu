import { useState } from 'react'
import { Check, Plus, Shuffle, X } from 'lucide-react'
import type { PathStep, PromptAnswer, User } from '../types'
import { ASK_TOPICS, INDUSTRIES, INTEREST_IDEAS, TOPICS } from '../config/brand'
import { listPrompts } from '../services'
import { CITY_NAMES } from '../lib/util'
import { Chip, Field, inputCls } from './ui'

/** Picks help topics from the shared menu. Used twice: for asks and for offers. */
export function TopicPicker({ value, onChange, tone = 'sage', topics = TOPICS }: { value: string[]; onChange: (v: string[]) => void; tone?: 'sage' | 'coffee'; topics?: typeof TOPICS }) {
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((t) => (
        <Chip key={t.id} tone={tone} active={value.includes(t.id)} onClick={() => onChange(value.includes(t.id) ? value.filter((x) => x !== t.id) : [...value, t.id])}>{t.label}</Chip>
      ))}
    </div>
  )
}

/** The two halves of "what you're here for". */
export function AsksOffersFields({ value, onChange }: { value: User; onChange: (patch: Partial<User>) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-1 text-sm font-semibold">I’m looking for</div>
        <p className="mb-2 text-xs text-ink/55">What would help you right now?</p>
        <TopicPicker topics={ASK_TOPICS} value={value.asks} onChange={(asks) => onChange({ asks })} />
      </div>
      <div>
        <div className="mb-1 text-sm font-semibold">I can offer</div>
        <p className="mb-2 text-xs text-ink/55">Everyone has something. A second-year knows things a first-year doesn’t.</p>
        <TopicPicker tone="coffee" value={value.offers} onChange={(offers) => onChange({ offers })} />
      </div>
    </div>
  )
}

/** How many chats a month someone is open to. Zero is allowed: you can be here only to ask. */
export function CapacityField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <Field label={value === 0 ? 'Not taking chats right now' : `Open to ${value} ${value === 1 ? 'chat' : 'chats'} per month`}>
      <input type="range" min={0} max={10} className="w-full" value={value} onChange={(e) => onChange(+e.target.value)} aria-label="Chats per month" />
      {value === 0 && <span className="mt-1 block text-xs normal-case tracking-normal text-ink/55">Nobody can send you a request. You can still ask others.</span>}
    </Field>
  )
}

/** Hobbies, clubs and affiliations: tap an idea or type your own. */
export function InterestsField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [own, setOwn] = useState('')
  const add = () => {
    const v = own.trim()
    if (v && !value.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...value, v])
    setOwn('')
  }
  const extras = value.filter((v) => !INTEREST_IDEAS.includes(v))
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {[...INTEREST_IDEAS, ...extras].map((i) => (
          <Chip key={i} active={value.includes(i)} onClick={() => onChange(value.includes(i) ? value.filter((x) => x !== i) : [...value, i])}>{i}</Chip>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add() }}>
        <input className={inputCls} placeholder="Add your own: a club, a team, a society" value={own} onChange={(e) => setOwn(e.target.value)} aria-label="Add a hobby, club or affiliation" maxLength={40} />
        <button type="submit" disabled={!own.trim()} className="shrink-0 rounded-full bg-vine-700 px-4 text-sm font-semibold text-cream disabled:opacity-40">Add</button>
      </form>
    </div>
  )
}

/** Earlier roles, oldest first, and the flag for people who changed fields. */
export function PathEditor({ value, onChange }: { value: User; onChange: (patch: Partial<User>) => void }) {
  const steps = value.path ?? []
  const setStep = (i: number, patch: Partial<PathStep>) => onChange({ path: steps.map((s, j) => (j === i ? { ...s, ...patch } : s)) })
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-100 text-[11px] font-bold text-vine-700">{i + 1}</span>
          <input className={inputCls} placeholder="Role" value={s.title} onChange={(e) => setStep(i, { title: e.target.value })} aria-label={`Earlier role ${i + 1}`} />
          <input className={inputCls} placeholder="Where" value={s.company} onChange={(e) => setStep(i, { company: e.target.value })} aria-label={`Earlier company ${i + 1}`} />
          <button type="button" onClick={() => onChange({ path: steps.filter((_, j) => j !== i) })} className="shrink-0 rounded-full p-1.5 text-ink/45 hover:bg-sage-100" aria-label={`Remove step ${i + 1}`}><X size={16} /></button>
        </div>
      ))}
      {steps.length < 6 && (
        <button type="button" onClick={() => onChange({ path: [...steps, { title: '', company: '' }] })} className="flex items-center gap-1.5 text-[13px] font-semibold text-vine-700"><Plus size={15} /> Add an earlier role</button>
      )}
      <button
        type="button" onClick={() => onChange({ careerChange: !value.careerChange })} aria-pressed={!!value.careerChange}
        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${value.careerChange ? 'border-coffee-500 bg-coffee-100' : 'border-sage-200 bg-white'}`}
      >
        <Shuffle size={19} className="shrink-0 text-coffee-600" />
        <span className="flex-1 text-[13px]">
          <span className="block font-semibold">I changed careers</span>
          <span className="block text-ink/55">Shown on your profile, so people thinking about the same move can find you.</span>
        </span>
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${value.careerChange ? 'border-coffee-500 bg-coffee-500 text-cream' : 'border-sage-300 text-transparent'}`}><Check size={14} /></span>
      </button>
    </div>
  )
}

/** Role, company, field and city. */
export function WorkFields({ value, onChange }: { value: User; onChange: (patch: Partial<User>) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Current role"><input className={inputCls} value={value.title ?? ''} onChange={(e) => onChange({ title: e.target.value })} placeholder={value.role === 'alum' ? 'Product Manager' : '3rd-year student, intern…'} aria-label="Current role" /></Field>
        <Field label="Company"><input className={inputCls} value={value.company ?? ''} onChange={(e) => onChange({ company: e.target.value || undefined })} placeholder="Where you work" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Field"><select className={inputCls} value={value.industry} onChange={(e) => onChange({ industry: e.target.value })}>{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select></Field>
        <Field label="City"><select className={inputCls} value={value.city} onChange={(e) => onChange({ city: e.target.value })}>{CITY_NAMES.map((c) => <option key={c}>{c}</option>)}</select></Field>
      </div>
    </div>
  )
}

/** Three prompt slots. Each has a prompt selector and an answer. */
export function PromptEditor({ value, onChange }: { value: PromptAnswer[]; onChange: (v: PromptAnswer[]) => void }) {
  const prompts = listPrompts()
  const slots = [0, 1, 2].map((i) => value[i] ?? { promptId: '', answer: '' })
  const setSlot = (i: number, patch: Partial<PromptAnswer>) => onChange(slots.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  return (
    <div className="space-y-3">
      {slots.map((s, i) => (
        <div key={i} className="rounded-2xl border border-sage-200 bg-white p-3">
          <select className="w-full bg-transparent text-[13px] font-semibold text-coffee-600 outline-none" value={s.promptId} onChange={(e) => setSlot(i, { promptId: e.target.value })} aria-label={`Prompt ${i + 1}`}>
            <option value="">Choose a prompt…</option>
            {prompts.map((p) => (
              <option key={p.id} value={p.id} disabled={slots.some((x, j) => j !== i && x.promptId === p.id)}>{p.text}</option>
            ))}
          </select>
          <textarea
            className="mt-2 h-16 w-full resize-none bg-transparent font-display text-[17px] leading-snug outline-none placeholder:font-sans placeholder:text-sm placeholder:text-ink/35"
            placeholder={s.promptId ? 'Your answer' : 'Pick a prompt first'}
            disabled={!s.promptId}
            value={s.answer}
            onChange={(e) => setSlot(i, { answer: e.target.value })}
            aria-label={`Answer ${i + 1}`}
          />
        </div>
      ))}
    </div>
  )
}

export function BasicsFields({ value, onChange }: { value: User; onChange: (patch: Partial<User>) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Name"><input className={inputCls} value={value.name} onChange={(e) => onChange({ name: e.target.value })} placeholder="First and last name" /></Field>
      <Field label="Major"><input className={inputCls} value={value.major} onChange={(e) => onChange({ major: e.target.value })} placeholder="Industrial Engineering" /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={value.role === 'alum' ? 'Current role' : 'Role (optional)'}><input className={inputCls} value={value.title ?? ''} onChange={(e) => onChange({ title: e.target.value })} placeholder={value.role === 'alum' ? 'Product Manager' : 'Intern, co-op…'} /></Field>
        <Field label="Company"><input className={inputCls} value={value.company ?? ''} onChange={(e) => onChange({ company: e.target.value || undefined })} placeholder={value.role === 'alum' ? 'Where you work' : 'Optional'} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Industry"><select className={inputCls} value={value.industry} onChange={(e) => onChange({ industry: e.target.value })}>{INDUSTRIES.map((i) => <option key={i}>{i}</option>)}</select></Field>
        <Field label="City"><select className={inputCls} value={value.city} onChange={(e) => onChange({ city: e.target.value })}>{CITY_NAMES.map((c) => <option key={c}>{c}</option>)}</select></Field>
      </div>
    </div>
  )
}
