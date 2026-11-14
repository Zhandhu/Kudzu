import { useEffect, useMemo, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { AttributionControl, MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { Coffee, MessageCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Strength, User } from '../types'
import { STRENGTH_META, STRENGTH_ORDER } from '../config/brand'
import { hash } from '../lib/util'
import { LeafIcon, StrengthBadge } from './brand'
import { Avatar } from './ui'
import { roleLine } from './ProfileView'

export interface MapPerson {
  user: User
  level: Strength
  days: number
}

type LatLng = [number, number]

/** OpenStreetMap tiles need no API key. CSS (.leaflet-tile-pane) mutes them so the vines stand out. */
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const VINE: Record<Strength, { weight: number; opacity: number; dash?: string }> = {
  strong: { weight: 3.6, opacity: 0.9 },
  steady: { weight: 2.6, opacity: 0.85 },
  fading: { weight: 1.8, opacity: 0.8, dash: '7 8' },
  dormant: { weight: 1.3, opacity: 0.45, dash: '2 8' },
}

const RAD = Math.PI / 180

/** Latitude and longitude to the flat coordinates the map is drawn in (Web Mercator). */
const project = ([lat, lng]: LatLng) => ({ x: lng * RAD, y: Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2)) })
const unproject = (x: number, y: number): LatLng => [(2 * Math.atan(Math.exp(y)) - Math.PI / 2) / RAD, x / RAD]

/**
 * A gently curving, slightly wavy line between two points, like a vine.
 *
 * Two things keep it honest at any zoom:
 *  - It is worked out in the map's own flat coordinates, so what is straight
 *    here is straight on screen.
 *  - The bend and the wave both fade to nothing at each end, with no sideways
 *    slope there. So the line leaves you heading straight for the other person
 *    and arrives at their leaf pointing straight back at you. All of the curve
 *    happens in the middle.
 */
function vinePath(a: LatLng, b: LatLng, seed: number, n = 72): LatLng[] {
  const p = project(a)
  const q = project(b)
  const dx = q.x - p.x
  const dy = q.y - p.y
  const len = Math.hypot(dx, dy) || 1
  // unit vector at right angles to the straight line
  const nx = -dy / len
  const ny = dx / len
  const bend = (seed % 2 === 0 ? 1 : -1) * (0.09 + (seed % 5) * 0.015) * len
  const pts: LatLng[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const ease = Math.sin(Math.PI * t) ** 2 // 0 at both ends, and flat there
    const off = ease * (bend + Math.sin(t * Math.PI * 6) * len * 0.012)
    pts.push(unproject(p.x + dx * t + nx * off, p.y + dy * t + ny * off))
  }
  return pts
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/**
 * The most strands a city's vine is drawn with. A city with more people than
 * this still gets one branch per person, but the vine itself stops thickening,
 * so a hundred connections in one place do not turn into a solid band.
 */
const MAX_STRANDS = 6

/**
 * One strand of the vine that runs from you to a city.
 *
 * Every strand to a city shares the same route to the middle of that city.
 * Each one weaves from side to side around that route, out of step with the
 * others, so together they twist into a single tangled vine. More strands and a
 * slightly wider weave make the vine to a busy city denser, up to MAX_STRANDS.
 *
 * `index` and `count` are this strand's place among the city's strands.
 */
function strandPath(origin: LatLng, hub: LatLng, seed: number, index: number, count: number): LatLng[] {
  const p = project(origin)
  const q = project(hub)
  const dx = q.x - p.x
  const dy = q.y - p.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const bend = (seed % 2 === 0 ? 1 : -1) * (0.09 + (seed % 5) * 0.015) * len
  // how far a strand swings from the shared route, and how many times it crosses over
  const swing = count > 1 ? clamp(len * 0.012, 0.004, 0.009) * (0.7 + 0.15 * count) : 0
  const twists = clamp(len * 8, 1.5, 6)
  const phase = (2 * Math.PI * index) / count

  const pts: LatLng[] = []
  const n = 84
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const ease = Math.sin(Math.PI * t) ** 2 // strands start together and gather again at the city
    const off = ease * (bend + Math.sin(t * Math.PI * 6) * len * 0.012 + swing * Math.sin(2 * Math.PI * twists * t + phase))
    pts.push(unproject(p.x + dx * t + nx * off, p.y + dy * t + ny * off))
  }
  return pts
}

/**
 * The branch from the middle of a city to one person's leaf. It sets off in the
 * direction the vine arrived from, then curls round to the leaf.
 */
function branchPath(origin: LatLng, hub: LatLng, leaf: LatLng): LatLng[] {
  const p = project(origin)
  const q = project(hub)
  const r = project(leaf)
  const len = Math.hypot(q.x - p.x, q.y - p.y) || 1
  const reach = Math.hypot(r.x - q.x, r.y - q.y)
  if (reach < 1e-9) return []
  const cx = q.x + ((q.x - p.x) / len) * reach * 0.5
  const cy = q.y + ((q.y - p.y) / len) * reach * 0.5
  const pts: LatLng[] = []
  for (let i = 0; i <= 18; i++) {
    const t = i / 18
    const v = 1 - t
    pts.push(unproject(v * v * q.x + 2 * v * t * cx + t * t * r.x, v * v * q.y + 2 * v * t * cy + t * t * r.y))
  }
  return pts
}

/**
 * Picks who the strands of a city's vine stand for. With few people, everyone
 * gets a strand. With many, it takes an even sample down the list (which is
 * sorted by strength), so the colours of the vine keep the same proportions as
 * the people there.
 */
function strandPeople<T>(list: T[]): T[] {
  if (list.length <= MAX_STRANDS) return list
  return Array.from({ length: MAX_STRANDS }, (_, i) => list[Math.floor(((i + 0.5) * list.length) / MAX_STRANDS)])
}

const leafIcon = (level: Strength, selected: boolean) =>
  L.divIcon({
    className: 'leaflet-div-icon-clear',
    iconSize: [34, 34],
    iconAnchor: [17, 28],
    html: `<div class="leaf-pin" style="${selected ? 'transform:scale(1.3)' : ''}">${renderToStaticMarkup(<LeafIcon level={level} size={34} />)}</div>`,
  })

const clusterIcon = (levels: Strength[], count: number, selected: boolean, offset: boolean) =>
  L.divIcon({
    className: 'leaflet-div-icon-clear',
    iconSize: [56, 46],
    iconAnchor: offset ? [4, 50] : [28, 36],
    html: `<div class="leaf-pin" style="position:relative;width:56px;height:46px;${selected ? 'transform:scale(1.15)' : ''}">
      ${levels.slice(0, 3).map((l, i) => `<div style="position:absolute;left:${[4, 22, 13][i]}px;top:${[10, 10, 0][i]}px;transform:rotate(${[-28, 28, 0][i]}deg)">${renderToStaticMarkup(<LeafIcon level={l} size={30} />)}</div>`).join('')}
      <div style="position:absolute;right:0;bottom:0;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:#1f2a1f;color:#faf6ee;font:700 11px Inter,sans-serif;display:flex;align-items:center;justify-content:center;border:2px solid #faf6ee">${count}</div>
    </div>`,
  })

const rootIcon = L.divIcon({
  className: 'leaflet-div-icon-clear',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  html: `<svg width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="#8b5e3c" fill-opacity=".18"/><circle cx="15" cy="15" r="7" fill="#744a2e" stroke="#faf6ee" stroke-width="2.5"/><path d="M15 22v5M11 21l-3 4M19 21l3 4" stroke="#744a2e" stroke-width="1.6" stroke-linecap="round"/></svg>`,
})

function ZoomWatcher({ onZoom, onMapClick }: { onZoom: (z: number) => void; onMapClick: () => void }) {
  useMapEvents({ zoomend: (e) => onZoom(e.target.getZoom()), click: onMapClick })
  return null
}

function FitTo({ points, token }: { points: LatLng[]; token: string }) {
  const map = useMap()
  useEffect(() => {
    if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 11 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])
  return null
}

function FlyButton({ to, label }: { to: LatLng; label: string }) {
  const map = useMap()
  return (
    <button onClick={() => map.flyTo(to, 11, { duration: 0.8 })} className="rounded-full bg-vine-700 px-3 py-1.5 text-xs font-semibold text-cream">
      {label}
    </button>
  )
}

function PersonRow({ p }: { p: MapPerson }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Link to={`/network/${p.user.id}`}><Avatar user={p.user} size={42} /></Link>
      <Link to={`/network/${p.user.id}`} className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate text-sm font-semibold">{p.user.name}</div>
        <div className="truncate text-xs text-ink/55">{roleLine(p.user)}</div>
        <div className="mt-0.5"><StrengthBadge level={p.level} /></div>
      </Link>
      <Link to={`/messages/${p.user.id}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 text-vine-700" aria-label={`Message ${p.user.name}`}><MessageCircle size={17} /></Link>
      <Link to={`/messages/${p.user.id}?propose=1`} className="flex h-9 w-9 items-center justify-center rounded-full bg-coffee-100 text-coffee-600" aria-label={`Propose coffee with ${p.user.name}`}><Coffee size={17} /></Link>
    </div>
  )
}

export default function NetworkMap({ me, people, onSelection }: { me: User; people: MapPerson[]; onSelection?: (open: boolean) => void }) {
  const [zoom, setZoom] = useState(4)
  const [sel, setSel] = useState<{ city: string } | { id: string } | null>(null)
  const [grow, setGrow] = useState(0)

  // lets the page hide floating controls while a person or city card is open
  useEffect(() => { onSelection?.(!!sel) }, [sel, onSelection])

  // vines grow outward from the root marker when the map opens
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1600)
      setGrow(1 - Math.pow(1 - p, 3))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [people.length])

  const cities = useMemo(() => {
    const m = new Map<string, MapPerson[]>()
    for (const p of people) m.set(p.user.city, [...(m.get(p.user.city) ?? []), p])
    return [...m.entries()].map(([city, list]) => ({
      city,
      list: [...list].sort((a, b) => STRENGTH_ORDER.indexOf(a.level) - STRENGTH_ORDER.indexOf(b.level)),
      // the middle of where these people actually are, so a cluster sits where its vines end
      center: [list.reduce((s, p) => s + p.user.coords[0], 0) / list.length, list.reduce((s, p) => s + p.user.coords[1], 0) / list.length] as LatLng,
    }))
  }, [people])

  const detailed = zoom >= 8
  const origin = me.coords
  const selCity = sel && 'city' in sel ? sel.city : null
  const selId = sel && 'id' in sel ? sel.id : null
  const selInCity = selId ? people.find((p) => p.user.id === selId)?.user.city ?? null : null
  const selPeople = selCity ? cities.find((c) => c.city === selCity)?.list ?? [] : selId ? people.filter((p) => p.user.id === selId) : []
  const allPoints = useMemo<LatLng[]>(() => [origin, ...people.map((p) => p.user.coords)], [origin, people])

  // One strand per person. The strands to a city twist together into one vine,
  // then branch to each leaf. The shapes are the same at every zoom level, so
  // nothing jumps when you zoom.
  const strands = useMemo(() => {
    // `id` is set when a line belongs to one person, so it can be picked out when they are selected
    const out: { key: string; id?: string; city: string; level: Strength; pts: LatLng[] }[] = []
    for (const c of cities) {
      if (c.city === me.city) {
        // your own city: a short vine straight from you to each person
        for (const p of c.list) out.push({ key: p.user.id, id: p.user.id, city: c.city, level: p.level, pts: vinePath(origin, p.user.coords, hash(p.user.id) % 10, 40) })
        continue
      }
      const shown = strandPeople(c.list)
      const capped = shown.length < c.list.length
      shown.forEach((p, index) =>
        out.push({ key: `${c.city}-strand-${index}`, id: capped ? undefined : p.user.id, city: c.city, level: p.level, pts: strandPath(origin, c.center, hash(c.city) % 10, index, shown.length) }),
      )
      for (const p of c.list) {
        const pts = branchPath(origin, c.center, p.user.coords)
        if (pts.length) out.push({ key: `${p.user.id}-branch`, id: p.user.id, city: c.city, level: p.level, pts })
      }
    }
    return out.sort((a, b) => STRENGTH_ORDER.indexOf(b.level) - STRENGTH_ORDER.indexOf(a.level)) // strongest drawn last, on top
  }, [cities, origin, me.city])

  return (
    <div className="relative z-0 h-full w-full overflow-hidden">
      <MapContainer center={origin} zoom={4} zoomControl={false} attributionControl={false} className="h-full w-full" minZoom={3} maxZoom={14}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        {/* bottom-left, so the leaves in the bottom-right corner never cover the map credit */}
        <AttributionControl position="bottomleft" />
        <ZoomWatcher onZoom={setZoom} onMapClick={() => setSel(null)} />
        <FitTo points={allPoints} token={`${me.schoolIds[0]}-${people.length}`} />

        {strands.map((v) => {
          // a shared strand (no id) lights up whenever anyone in its city is selected
          const active = !sel || selCity === v.city || (v.id ? selId === v.id : selInCity === v.city)
          const shown = v.pts.slice(0, Math.max(2, Math.ceil(v.pts.length * grow)))
          const style = VINE[v.level]
          return (
            <Polyline
              key={`${v.key}-${v.level}-${active}`}
              positions={shown}
              interactive={false}
              // keep every point: the default simplification turns short curves into visible corners
              smoothFactor={0}
              pathOptions={{
                color: STRENGTH_META[v.level].color,
                weight: style.weight,
                opacity: active ? style.opacity : 0.12,
                dashArray: style.dash,
                lineCap: 'round',
              }}
            />
          )
        })}

        {detailed
          ? people.map((p) => (
              <Marker key={p.user.id} position={p.user.coords} icon={leafIcon(p.level, selId === p.user.id)} eventHandlers={{ click: () => setSel({ id: p.user.id }) }} />
            ))
          : cities.map((c) =>
              c.list.length === 1 ? (
                <Marker key={c.city} position={c.list[0].user.coords} icon={leafIcon(c.list[0].level, selId === c.list[0].user.id)} eventHandlers={{ click: () => setSel({ id: c.list[0].user.id }) }} />
              ) : (
                <Marker
                  key={c.city}
                  position={c.center}
                  icon={clusterIcon(c.list.map((p) => p.level), c.list.length, selCity === c.city, c.city === me.city)}
                  eventHandlers={{ click: () => setSel({ city: c.city }) }}
                />
              ),
            )}

        <Marker position={origin} icon={rootIcon} zIndexOffset={1000} interactive={false} />

        {selPeople.length > 0 && (
          <div
            className="absolute inset-x-3 bottom-3 z-[1000] max-h-[55%] overflow-y-auto rounded-2xl bg-cream p-3 shadow-xl ring-1 ring-sage-200"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            ref={(el) => { if (el) { L.DomEvent.disableClickPropagation(el); L.DomEvent.disableScrollPropagation(el) } }}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                {selCity ? `${selCity} · ${selPeople.length} connections` : selPeople[0].user.city}
              </div>
              <div className="flex items-center gap-2">
                {selCity && !detailed && <FlyButton to={cities.find((c) => c.city === selCity)?.center ?? origin} label="Zoom in" />}
                <button onClick={() => setSel(null)} className="rounded-full p-1 text-ink/50 hover:bg-sage-100" aria-label="Close"><X size={16} /></button>
              </div>
            </div>
            <div className="divide-y divide-sage-200">{selPeople.map((p) => <PersonRow key={p.user.id} p={p} />)}</div>
          </div>
        )}
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 z-[1000] flex flex-wrap gap-1.5">
        {STRENGTH_ORDER.map((l) => (
          <span key={l} className="flex items-center gap-1 rounded-full bg-cream/95 px-2 py-1 text-[10.5px] font-semibold shadow-sm" style={{ color: STRENGTH_META[l].color }}>
            <LeafIcon level={l} size={12} /> {STRENGTH_META[l].label}
          </span>
        ))}
      </div>
    </div>
  )
}
