// Simplified country outlines, for the frames where the globe is moving.
//
// Drawing the land is the globe's whole frame cost: d3-geo clips every ring
// against the horizon vertex by vertex, which no amount of coarser resampling
// avoids — only fewer vertices do. These outlines carry about a third of the
// atlas's points, which is invisible while the globe is in motion and lets a
// throttled phone keep up; the controller repaints at full detail as soon as
// it settles.
import type { Feature, Geometry, Position } from 'geojson'

/**
 * Maximum deviation, in degrees, a dropped vertex may have from the line its
 * neighbours make. The reel's globe is about 390px across for 180 degrees, so
 * half a degree is near enough a single pixel.
 */
export const SIMPLIFY_EPS_DEG = 0.5

/** Rings shorter than this are already minimal; simplifying them risks a sliver. */
const MIN_RING_POINTS = 5

/** Perpendicular distance from `point` to the line through `from` and `to`. */
function lineDistance(point: Position, from: Position, to: Position): number {
  const runX = to[0] - from[0]
  const runY = to[1] - from[1]
  const length = Math.hypot(runX, runY)
  if (length === 0) return Math.hypot(point[0] - from[0], point[1] - from[1])
  return Math.abs(runY * (point[0] - from[0]) - runX * (point[1] - from[1])) / length
}

/**
 * Douglas-Peucker: keeps the vertex furthest from the line between the ends of
 * a span whenever it is more than `eps` off it, then recurses into the two
 * halves. Nothing in the result is further than `eps` from the original
 * outline, and asking for a smaller `eps` never gives back fewer vertices — a
 * single pass that drops vertices against their immediate neighbours has
 * neither property, because each drop lengthens the line the next vertex is
 * measured against.
 */
function keptIndices(ring: Position[], eps: number): number[] {
  const last = ring.length - 1
  const keep = new Set<number>([0, last])
  const spans: Array<[number, number]> = [[0, last]]
  while (spans.length > 0) {
    const [from, to] = spans.pop() as [number, number]
    let furthest = -1
    let distance = eps
    for (let i = from + 1; i < to; i++) {
      const offset = lineDistance(ring[i], ring[from], ring[to])
      if (offset >= distance) {
        distance = offset
        furthest = i
      }
    }
    if (furthest < 0) continue
    keep.add(furthest)
    spans.push([from, furthest], [furthest, to])
  }
  return [...keep].sort((a, b) => a - b)
}

/**
 * The ring with its least significant vertices dropped. First and last are
 * always kept, so a closed ring stays closed.
 */
export function simplifyRing(ring: Position[], eps = SIMPLIFY_EPS_DEG): Position[] {
  if (ring.length < MIN_RING_POINTS) return ring
  const kept = keptIndices(ring, eps).map((index) => ring[index])
  // Anything thinner than a triangle would vanish or fill wrongly.
  return kept.length < 4 ? ring : kept
}

/** The same geometry with every ring simplified. Other types pass through. */
export function simplifyGeometry(geometry: Geometry, eps = SIMPLIFY_EPS_DEG): Geometry {
  if (geometry.type === 'Polygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((ring) => simplifyRing(ring, eps)),
    }
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) =>
        polygon.map((ring) => simplifyRing(ring, eps))
      ),
    }
  }
  return geometry
}

/** The same feature with its geometry simplified. */
export const simplifyFeature = (
  shape: Feature<Geometry>,
  eps = SIMPLIFY_EPS_DEG
): Feature<Geometry> => ({ ...shape, geometry: simplifyGeometry(shape.geometry, eps) })
