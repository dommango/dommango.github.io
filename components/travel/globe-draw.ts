// Canvas renderer for the flight globe. The old renderer handed 177 country
// paths to React and re-rendered all of them on every rotation tick, which cost
// ~50 ms frames on a throttled phone once scroll started driving the globe.
// Here the whole scene is one pass of d3-geo's geoPath into a 2D context, over
// only the shapes the near side can show (see globe-cull).
import { geoOrthographic, geoPath, type GeoProjection } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import {
  airportRadius,
  GLOBE_UNITS,
  type Airport,
  type LonLat,
  type Rotation,
  type RouteArc,
} from './globe-geometry'
import { anyVisible, capVisible, pointVisible, viewCenter } from './globe-cull'
import { airportPopScale, routeDrawProgress } from './globe-timing'

const TAU = Math.PI * 2
const STROKE_UNITS = 0.5
const ROUTE_ALPHA = 0.6
/**
 * Adaptive-resampling threshold. Coarser than d3's default (≈0.71): at this
 * size the extra points are invisible and they are most of the per-frame cost.
 */
const PROJECTION_PRECISION = 1.5

export interface GlobeColors {
  sphere: string
  stroke: string
  land: string
  landHover: string
  visited: string
  visitedHover: string
  accent: string
}

/** Used until the theme tokens can be read off the live element. */
export const DEFAULT_GLOBE_COLORS: GlobeColors = {
  sphere: '#0a0000',
  stroke: '#1a1a1a',
  land: '#2a2a2a',
  landHover: '#3a3a3a',
  visited: '#9c7a32',
  visitedHover: '#d4a847',
  accent: '#d4a847',
}

/** Resolves the globe's theme tokens off `el`, so all three themes just work. */
export function readGlobeColors(el: Element): GlobeColors {
  const style = getComputedStyle(el)
  const token = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback
  return {
    sphere: token('--map-sphere', DEFAULT_GLOBE_COLORS.sphere),
    stroke: token('--map-stroke', DEFAULT_GLOBE_COLORS.stroke),
    land: token('--map-land', DEFAULT_GLOBE_COLORS.land),
    landHover: token('--map-land-hover', DEFAULT_GLOBE_COLORS.landHover),
    visited: token('--map-visited', DEFAULT_GLOBE_COLORS.visited),
    visitedHover: token('--map-visited-hover', DEFAULT_GLOBE_COLORS.visitedHover),
    accent: token('--accent', DEFAULT_GLOBE_COLORS.accent),
  }
}

export interface CountryShape {
  id: string
  feature: Feature<Geometry>
  /** Fewer vertices, for the frames where the globe is moving. */
  simple: Feature<Geometry>
  /** [[west, south], [east, north]] — a cheap reject before a containment test. */
  bounds: [LonLat, LonLat]
  /** Centre and angular radius of the cap covering `bounds`, for culling. */
  center: LonLat
  radius: number
}

export interface GlobeScene {
  shapes: CountryShape[]
  visitedIso: Set<string>
  routes: RouteArc[]
  airports: Airport[]
}

export interface GlobeFrame {
  size: number
  rotation: Rotation
  /** ms since the globe entered view, or Infinity once the intro is over. */
  elapsed: number
  hoverIso: string | null
  /** True while the rotation is changing, which halves the land's vertex count. */
  moving: boolean
}

export const createProjection = (size: number, rotation: Rotation): GeoProjection =>
  geoOrthographic()
    .rotate(rotation)
    .translate([size / 2, size / 2])
    .scale(size / 2)
    .precision(PROJECTION_PRECISION)

type Path = ReturnType<typeof geoPath>

/** The orthographic sphere is exactly a circle, so it never needs a path walk. */
function drawSphere(ctx: CanvasRenderingContext2D, size: number, colors: GlobeColors) {
  const radius = size / 2
  ctx.beginPath()
  ctx.arc(radius, radius, radius, 0, TAU)
  ctx.fillStyle = colors.sphere
  ctx.fill()
  ctx.strokeStyle = colors.stroke
  ctx.stroke()
}

function landFill(
  shape: CountryShape,
  scene: GlobeScene,
  frame: GlobeFrame,
  colors: GlobeColors
): string {
  const visited = scene.visitedIso.has(shape.id)
  if (shape.id === frame.hoverIso) return visited ? colors.visitedHover : colors.landHover
  return visited ? colors.visited : colors.land
}

/**
 * One pass: each country is walked once and both filled and stroked from it.
 * Walking the land is the globe's frame cost — d3-geo clips every ring against
 * the horizon vertex by vertex — so a moving globe draws the simplified
 * outlines and a settled one draws the full atlas.
 */
function drawLand(
  ctx: CanvasRenderingContext2D,
  path: Path,
  scene: GlobeScene,
  frame: GlobeFrame,
  colors: GlobeColors,
  view: LonLat
) {
  ctx.strokeStyle = colors.stroke
  for (const shape of scene.shapes) {
    if (!capVisible(shape.center, shape.radius, view)) continue
    ctx.beginPath()
    path(frame.moving ? shape.simple : shape.feature)
    ctx.fillStyle = landFill(shape, scene, frame, colors)
    ctx.fill()
    ctx.stroke()
  }
}

/**
 * Walks one pre-sampled arc into the current path, up to `progress` of its
 * length, breaking the line wherever it passes behind the globe.
 */
function traceArc(
  ctx: CanvasRenderingContext2D,
  projection: GeoProjection,
  arc: RouteArc,
  progress: number,
  view: LonLat
) {
  const last = Math.max(1, Math.ceil(progress * (arc.points.length - 1)))
  let drawing = false
  for (let i = 0; i <= last; i++) {
    const point = arc.points[i]
    if (!pointVisible(point, view)) {
      drawing = false
      continue
    }
    const projected = projection(point)
    if (!projected) {
      drawing = false
      continue
    }
    if (drawing) ctx.lineTo(projected[0], projected[1])
    else ctx.moveTo(projected[0], projected[1])
    drawing = true
  }
}

/** Route arcs, truncated to their draw-in progress and batched by stroke width. */
function drawRoutes(
  ctx: CanvasRenderingContext2D,
  projection: GeoProjection,
  scene: GlobeScene,
  frame: GlobeFrame,
  colors: GlobeColors,
  unit: number,
  view: LonLat
) {
  if (scene.routes.length === 0) return
  const buckets = new Map<number, Array<{ arc: RouteArc; progress: number }>>()
  scene.routes.forEach((arc, index) => {
    const progress = routeDrawProgress(index, frame.elapsed)
    if (progress <= 0 || !anyVisible([arc.from, arc.mid, arc.to], view)) return
    const bucket = buckets.get(arc.width) ?? []
    bucket.push({ arc, progress })
    buckets.set(arc.width, bucket)
  })
  if (buckets.size === 0) return

  ctx.save()
  ctx.globalAlpha = ROUTE_ALPHA
  ctx.lineCap = 'round'
  ctx.strokeStyle = colors.accent
  for (const [width, arcs] of buckets) {
    ctx.beginPath()
    for (const { arc, progress } of arcs) traceArc(ctx, projection, arc, progress, view)
    ctx.lineWidth = width * unit
    ctx.stroke()
  }
  ctx.restore()
}

function drawAirports(
  ctx: CanvasRenderingContext2D,
  projection: GeoProjection,
  scene: GlobeScene,
  frame: GlobeFrame,
  colors: GlobeColors,
  unit: number,
  view: LonLat
) {
  const scale = airportPopScale(frame.elapsed)
  if (scene.airports.length === 0 || scale <= 0) return
  ctx.beginPath()
  for (const airport of scene.airports) {
    if (!pointVisible(airport.coords, view)) continue
    const point = projection(airport.coords)
    if (!point) continue
    const radius = airportRadius(airport.count) * unit * scale
    ctx.moveTo(point[0] + radius, point[1])
    ctx.arc(point[0], point[1], radius, 0, TAU)
  }
  ctx.fillStyle = colors.accent
  ctx.fill()
  ctx.strokeStyle = colors.stroke
  ctx.stroke()
}

/** Paints one frame of the globe. `size` is in CSS pixels; the caller scales for DPR. */
export function drawGlobe(
  ctx: CanvasRenderingContext2D,
  scene: GlobeScene,
  frame: GlobeFrame,
  colors: GlobeColors
): void {
  const { size } = frame
  const unit = size / GLOBE_UNITS
  const projection = createProjection(size, frame.rotation)
  const path = geoPath(projection, ctx)
  const view = viewCenter(frame.rotation)

  ctx.clearRect(0, 0, size, size)
  ctx.lineWidth = STROKE_UNITS * unit
  drawSphere(ctx, size, colors)
  drawLand(ctx, path, scene, frame, colors, view)
  drawRoutes(ctx, projection, scene, frame, colors, unit, view)
  drawAirports(ctx, projection, scene, frame, colors, unit, view)
}
