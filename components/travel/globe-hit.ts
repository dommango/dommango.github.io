// Hover hit-testing for the canvas globe. The SVG renderer got this from the
// browser; with one canvas the pointer has to be projected back onto the sphere
// by hand. Only runs on pointer moves, never per frame.
import { geoContains, geoPath, type GeoProjection } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import type { FlightRoute } from '@/lib/content/travel'
import type { Airport, LonLat, RouteArc } from './globe-geometry'
import type { CountryShape } from './globe-draw'
import { pointVisible, viewCenter } from './globe-cull'

/** Pixels of slack around a marker or route before it counts as hovered. */
const AIRPORT_GRAB_PX = 6
const ROUTE_GRAB_PX = 5
/** How far a great-circle arc can bow out of its endpoints' box, as a fraction
 *  of their screen distance. */
const ARC_BOW_RATIO = 0.3
/** A round-trip further off than this means the pixel is not on the globe. */
const ON_SPHERE_EPSILON = 0.5

const arcFeature = (from: LonLat, to: LonLat): Feature<Geometry> => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: [from, to] },
})

/** Longitude inside a geoBounds range, which wraps when it crosses the antimeridian. */
export function inLonRange(lon: number, west: number, east: number): boolean {
  return west <= east ? lon >= west && lon <= east : lon >= west || lon <= east
}

/**
 * [lon, lat] under a canvas pixel, or null when that pixel is off the globe.
 * An orthographic `invert` answers for pixels outside the disc too, so the
 * result is projected back and checked.
 */
export function sphereCoords(
  projection: GeoProjection,
  point: [number, number]
): LonLat | null {
  const coords = projection.invert?.(point)
  if (!coords) return null
  const roundTrip = projection(coords)
  if (!roundTrip) return null
  const drift = Math.hypot(roundTrip[0] - point[0], roundTrip[1] - point[1])
  return drift > ON_SPHERE_EPSILON ? null : (coords as LonLat)
}

/** ISO code of the country under `point`, or null. */
export function hitCountry(
  projection: GeoProjection,
  shapes: CountryShape[],
  point: [number, number]
): string | null {
  const coords = sphereCoords(projection, point)
  if (!coords) return null
  const [lon, lat] = coords
  for (const shape of shapes) {
    const [[west, south], [east, north]] = shape.bounds
    if (lat < south || lat > north || !inLonRange(lon, west, east)) continue
    if (geoContains(shape.feature, coords)) return shape.id
  }
  return null
}

/** Nearest near-side airport marker within grabbing distance of `point`, or null. */
export function hitAirport(
  projection: GeoProjection,
  airports: Airport[],
  point: [number, number],
  grabPx = AIRPORT_GRAB_PX
): Airport | null {
  let best: Airport | null = null
  let bestDistance = grabPx
  const view = viewCenter(projection.rotate())
  for (const airport of airports) {
    if (!pointVisible(airport.coords, view)) continue
    const projected = projection(airport.coords)
    if (!projected) continue
    const distance = Math.hypot(projected[0] - point[0], projected[1] - point[1])
    if (distance <= bestDistance) {
      best = airport
      bestDistance = distance
    }
  }
  return best
}

/**
 * Route arc under `point`, found by re-walking each arc into the context and
 * asking the canvas. Widening the stroke first is what gives the arcs a
 * grabbable hit area instead of their 1px paint width.
 */
export function hitRoute(
  ctx: CanvasRenderingContext2D,
  projection: GeoProjection,
  routes: RouteArc[],
  point: [number, number],
  grabPx = ROUTE_GRAB_PX
): FlightRoute | null {
  const path = geoPath(projection, ctx)
  ctx.save()
  ctx.lineWidth = grabPx * 2
  try {
    for (const arc of routes) {
      if (!nearArc(projection, arc.from, arc.to, point, grabPx)) continue
      ctx.beginPath()
      path(arcFeature(arc.from, arc.to))
      if (ctx.isPointInStroke(point[0], point[1])) return arc.route
    }
    return null
  } finally {
    ctx.restore()
  }
}

/**
 * Cheap reject before the expensive path walk: when both ends of an arc are on
 * the near side, the drawn arc stays within their box plus a bow allowance.
 * Arcs with a hidden end are clipped by the projection, so those always fall
 * through to the real test.
 */
function nearArc(
  projection: GeoProjection,
  from: LonLat,
  to: LonLat,
  point: [number, number],
  grabPx: number
): boolean {
  const a = projection(from)
  const b = projection(to)
  if (!a || !b) return true
  const pad = grabPx + Math.hypot(b[0] - a[0], b[1] - a[1]) * ARC_BOW_RATIO
  return (
    point[0] >= Math.min(a[0], b[0]) - pad &&
    point[0] <= Math.max(a[0], b[0]) + pad &&
    point[1] >= Math.min(a[1], b[1]) - pad &&
    point[1] <= Math.max(a[1], b[1]) + pad
  )
}
