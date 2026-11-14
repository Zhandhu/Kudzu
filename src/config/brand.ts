import type { Mode, Strength } from '../types'

/** Change the product name here and it changes everywhere. */
export const APP_NAME = 'Kudzu'
export const TAGLINE = 'Coffee chats, matched.'

/**
 * One shared menu of help topics. People pick from it twice: what they are
 * looking for, and what they can offer. A match is strongest where one
 * person's ask meets the other's offer.
 */
export const TOPICS: { id: string; label: string }[] = [
  { id: 'industry', label: 'An inside look at an industry' },
  { id: 'decision', label: 'Talking through a decision' },
  { id: 'path', label: 'Someone who’s been where I am' },
  { id: 'interview', label: 'Interview practice' },
  { id: 'resume', label: 'Resume or portfolio feedback' },
  { id: 'referral', label: 'Referrals and introductions' },
  { id: 'recruiting', label: 'Recruiting tips and timelines' },
  { id: 'campus', label: 'Classes, clubs and campus life' },
]

export const topicLabel = (id: string) => TOPICS.find((t) => t.id === id)?.label ?? id

export const MODE_META: Record<Mode, { label: string; verb: string; tag: string; color: string; bg: string }> = {
  learn: { label: 'Learn from', verb: 'Learn from', tag: 'Learning from', color: '#2b502a', bg: '#dfeadc' },
  give: { label: 'Give back', verb: 'Give back to', tag: 'Giving back', color: '#744a2e', bg: '#f0e4d8' },
  trade: { label: 'Trade notes', verb: 'Trade notes with', tag: 'Trading notes', color: '#7a6312', bg: '#f6edc9' },
}

export const MODES: Mode[] = ['learn', 'trade', 'give']

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
