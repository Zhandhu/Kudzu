import type { Intention, Strength } from '../types'

/** Change the product name here and it changes everywhere. */
export const APP_NAME = 'Kadzu'
export const TAGLINE = 'Coffee chats, matched.'

export const INTENTIONS: Intention[] = [
  'Coffee chat',
  'Mentorship',
  'Career advice',
  'Job/referral help',
  'Long-term connection',
]

export const INDUSTRIES = [
  'Tech',
  'Aerospace',
  'Consulting',
  'Finance',
  'Energy',
  'Healthcare',
  'Startups',
  'Government',
  'Design',
]

export const STRENGTH_META: Record<Strength, { label: string; color: string; hint: string }> = {
  strong: { label: 'Strong', color: '#2b502a', hint: 'Talked in the last month' },
  steady: { label: 'Steady', color: '#6fa565', hint: '1–3 months' },
  fading: { label: 'Fading', color: '#c9a227', hint: '3–6 months' },
  dormant: { label: 'Dormant', color: '#8b5e3c', hint: '6+ months' },
}

export const STRENGTH_ORDER: Strength[] = ['strong', 'steady', 'fading', 'dormant']

export const FEEDBACK_TAGS = [
  'Insightful',
  'Generous with time',
  'Great listener',
  'Not a good fit',
  'Felt like a sales pitch',
]
