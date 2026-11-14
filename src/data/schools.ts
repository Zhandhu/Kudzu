import type { School } from '../types'

/** Schools are data. Georgia Tech is first because it is the featured demo school. */
export const SCHOOLS: School[] = [
  { id: 'gt', name: 'Georgia Tech', shortName: 'GT', domains: ['gatech.edu'], city: 'Atlanta', accent: '#B3A369' },
  { id: 'emory', name: 'Emory University', shortName: 'Emory', domains: ['emory.edu'], city: 'Atlanta', accent: '#1D4F91' },
  { id: 'uga', name: 'University of Georgia', shortName: 'UGA', domains: ['uga.edu'], city: 'Athens, GA', accent: '#BA0C2F' },
  { id: 'gsu', name: 'Georgia State University', shortName: 'Georgia State', domains: ['gsu.edu', 'student.gsu.edu'], city: 'Atlanta', accent: '#0039A6' },
]

export const PROMPTS: { id: string; text: string }[] = [
  { id: 'p1', text: 'Ask me about…' },
  { id: 'p2', text: "The career advice I'd give my freshman self…" },
  { id: 'p3', text: 'My coffee order says…' },
  { id: 'p4', text: 'A job I almost took…' },
  { id: 'p5', text: 'I can help you with…' },
  { id: 'p6', text: "I'm currently trying to figure out…" },
  { id: 'p7', text: 'Best class I took in school…' },
  { id: 'p8', text: 'My unpopular career opinion…' },
  { id: 'p9', text: 'You should reach out if…' },
  { id: 'p10', text: "Outside of work, you'll find me…" },
  { id: 'p11', text: 'The best decision I made in college…' },
  { id: 'p12', text: "A skill I wish I'd learned sooner…" },
]
