import type { Intention, PromptAnswer, User } from '../types'
import { INDUSTRIES, INTENTIONS } from '../config/brand'
import { listPrompts } from '../services'
import { CITY_NAMES } from '../lib/util'
import { Chip, Field, inputCls } from './ui'

export function IntentionPicker({ value, onChange }: { value: Intention[]; onChange: (v: Intention[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {INTENTIONS.map((i) => (
        <Chip key={i} active={value.includes(i)} onClick={() => onChange(value.includes(i) ? value.filter((x) => x !== i) : [...value, i])}>{i}</Chip>
      ))}
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
