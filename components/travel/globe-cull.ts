// Hemisphere culling. An orthographic globe hides half the world at any moment,
// but d3-geo only discovers that by walking every point of every shape through
// its clip circle. A bounding cap per shape rejects the far side first, which is
// what keeps the scroll-driven reel inside its frame budget on a phone.
import type { LonLat, Rotation } from './globe-geometry'

const DEG = Math.PI / 180
/** Nothing further than a quarter turn from the centre is on the near side. */
const HORIZON_DEG = 90

/** Great-circle distance in degrees between two [lon, lat] points. */
export function angularDistance(a: LonLat, b: LonLat): number {
  const [lonA, latA] = a
  const [lonB, latB] = b
  const cos =
    Math.sin(latA * DEG) * Math.sin(latB * DEG) +
    Math.cos(latA * DEG) * Math.cos(latB * DEG) * Math.cos((lonB - lonA) * DEG)
  return Math.acos(Math.min(1, Math.max(-1, cos))) / DEG
}

/**
 * Centre and angular radius (degrees) of the cap covering a bounding box.
 *
 * The radius reaches the box's corners, which for a box narrower than a half
 * turn are its farthest points. Half the wider span is not enough: the corner
 * of a box broad in both directions lies further out than either span (a
 * Brazil-sized box's is 7.8 degrees beyond), and an under-covering cap culls a
 * shape whose corner is still on the near side, popping it off at the horizon.
 */
export function boundsCap(bounds: [LonLat, LonLat]): { center: LonLat; radius: number } {
  const [[west, south], [east, north]] = bounds
  // geoBounds reports west > east for a box that crosses the antimeridian, and
  // -180..180 for one spanning every longitude — which the modulo alone would
  // read as a box of no width, leaving Antarctica culled while it is on screen.
  const rawSpan = east - west
  const spanLon = rawSpan >= 360 ? 360 : ((rawSpan % 360) + 360) % 360
  const centerLon = (((west + spanLon / 2 + 180) % 360) + 360) % 360 - 180
  const center: LonLat = [centerLon, (south + north) / 2]
  const corners: LonLat[] = [
    [west, south],
    [west, north],
    [west + spanLon, south],
    [west + spanLon, north],
  ]
  const radius = corners.reduce(
    (widest, corner) => Math.max(widest, angularDistance(center, corner)),
    0
  )
  return { center, radius }
}

/** The [lon, lat] facing the viewer for a d3 rotation. */
export const viewCenter = (rotation: Rotation): LonLat => [-rotation[0], -rotation[1]]

/** True when any part of a cap of `radius` around `center` can be on screen. */
export const capVisible = (center: LonLat, radius: number, view: LonLat): boolean =>
  angularDistance(view, center) - radius < HORIZON_DEG

/**
 * True when `point` is on the near side. d3's projection function has no
 * opinion about this — it happily returns the mirrored position of a point on
 * the back of the globe — so everything drawn point-by-point must ask here.
 */
export const pointVisible = (point: LonLat, view: LonLat): boolean =>
  angularDistance(view, point) < HORIZON_DEG

/** True when any of `points` is on the near side. */
export const anyVisible = (points: LonLat[], view: LonLat): boolean =>
  points.some((point) => pointVisible(point, view))
