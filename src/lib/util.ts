export const DAY = 86_400_000
export const HOUR = 3_600_000

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const firstName = (name: string) => name.split(' ')[0]

export function avatarGradient(seed: string): string {
  const h = hash(seed) % 360
  return `linear-gradient(135deg, hsl(${h} 52% 58%), hsl(${(h + 42) % 360} 55% 40%))`
}

/* ---------- geo ---------- */

export const CITIES: Record<string, [number, number]> = {
  Atlanta: [33.7756, -84.3963],
  'New York': [40.7411, -73.9897],
  'Washington, DC': [38.9072, -77.0369],
  'San Francisco': [37.7749, -122.4194],
  Seattle: [47.6062, -122.3321],
  Austin: [30.2672, -97.7431],
  Chicago: [41.8781, -87.6298],
  Charlotte: [35.2271, -80.8431],
  'Athens, GA': [33.9519, -83.3576],
}

export const CITY_NAMES = Object.keys(CITIES)

/** City centre plus a small deterministic offset so pins in one city don't stack. */
export function coordsFor(city: string, seed: string): [number, number] {
  const c = CITIES[city] ?? CITIES.Atlanta
  const h = hash(seed)
  const dx = ((h % 1000) / 1000 - 0.5) * 0.09
  const dy = (((h >> 10) % 1000) / 1000 - 0.5) * 0.07
  return [c[0] + dy, c[1] + dx]
}

export function miles(a: [number, number], b: [number, number]): number {
  const R = 3958.8
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

/* ---------- time formatting ---------- */

export const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

export const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

export const fmtDateTime = (t: number) => `${fmtDate(t)} · ${fmtTime(t)}`

export function ago(t: number, now: number): string {
  const d = Math.max(0, now - t)
  if (d < HOUR) return `${Math.max(1, Math.round(d / 60000))}m ago`
  if (d < DAY) return `${Math.round(d / HOUR)}h ago`
  const days = Math.round(d / DAY)
  if (days < 30) return `${days}d ago`
  const months = Math.round(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.round(months / 12)}y ago`
}

export function startOfDay(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
