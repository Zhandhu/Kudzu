import { useEffect, useMemo, useState } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { Coffee, MessageCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Strength, User } from '../types'
import { STRENGTH_META, STRENGTH_ORDER } from '../config/brand'
import { CITIES } from '../lib/util'
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

/** A gently curving, slightly wavy line between two points, like a vine. */
function vinePath(a: LatLng, b: LatLng, seed: number, n = 44): LatLng[] {
  const [y1, x1] = a
  const [y2, x2] = b
  const dx = x2 - x1
  const dy = y2 - y1
  const bend = (seed % 2 === 0 ? 1 : -1) * (0.14 + (seed % 5) * 0.02)
  const cx = (x1 + x2) / 2 - dy * bend
  const cy = (y1 + y2) / 2 + dx * bend
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const pts: LatLng[] = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    const wave = Math.sin(t * Math.PI * 4) * len * 0.02 * Math.sin(t * Math.PI)
    pts.push([u * u * y1 + 2 * u * t * cy + t * t * y2 + ny * wave, u * u * x1 + 2 * u * t * cx + t * t * x2 + nx * wave])
  }
  return pts
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

export default function NetworkMap({ me, people }: { me: User; people: MapPerson[] }) {
  const [zoom, setZoom] = useState(4)
  const [sel, setSel] = useState<{ city: string } | { id: string } | null>(null)
  const [grow, setGrow] = useState(0)

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
      center: CITIES[city] ?? list[0].user.coords,
    }))
  }, [people])

  const detailed = zoom >= 8
  const origin = me.coords
  const selCity = sel && 'city' in sel ? sel.city : null
  const selId = sel && 'id' in sel ? sel.id : null
  const selPeople = selCity ? cities.find((c) => c.city === selCity)?.list ?? [] : selId ? people.filter((p) => p.user.id === selId) : []
  const allPoints = useMemo<LatLng[]>(() => [origin, ...people.map((p) => p.user.coords)], [origin, people])

  const vines = detailed
    ? people.map((p, i) => ({ key: p.user.id, to: p.user.coords, level: p.level, seed: i, active: !sel || selId === p.user.id || selCity === p.user.city }))
    : cities
        .filter((c) => c.city !== me.city)
        .map((c, i) => ({ key: c.city, to: c.center, level: c.list[0].level, seed: i, active: !sel || selCity === c.city || c.list.some((p) => p.user.id === selId) }))

  return (
    <div className="relative z-0 h-full w-full overflow-hidden">
      <MapContainer center={origin} zoom={4} zoomControl={false} attributionControl className="h-full w-full" minZoom={3} maxZoom={14}>
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <ZoomWatcher onZoom={setZoom} onMapClick={() => setSel(null)} />
        <FitTo points={allPoints} token={`${me.schoolIds[0]}-${people.length}`} />

        {vines.map((v) => {
          const pts = vinePath(origin, v.to, v.seed)
          const shown = pts.slice(0, Math.max(2, Math.ceil(pts.length * grow)))
          const style = VINE[v.level]
          return (
            <Polyline
              key={`${v.key}-${v.level}-${v.active}`}
              positions={shown}
              interactive={false}
              pathOptions={{
                color: STRENGTH_META[v.level].color,
                weight: style.weight,
                opacity: v.active ? style.opacity : 0.12,
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
                <Marker key={c.city} position={c.center} icon={leafIcon(c.list[0].level, selId === c.list[0].user.id)} eventHandlers={{ click: () => setSel({ id: c.list[0].user.id }) }} />
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
                {selCity && !detailed && <FlyButton to={CITIES[selCity] ?? origin} label="Zoom in" />}
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
