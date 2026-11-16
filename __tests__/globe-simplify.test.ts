import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { geoBounds } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import {
  SIMPLIFY_EPS_DEG,
  simplifyFeature,
  simplifyGeometry,
  simplifyRing,
} from '../components/travel/globe-simplify'

const ring = (points: Position[]): Position[] => points

describe('simplifyRing', () => {
  it('keeps a ring that is already minimal', () => {
    const square: Position[] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ]
    expect(simplifyRing(square)).toEqual(square)
  })

  it('drops vertices that sit on the line between their neighbours', () => {
    const straight = ring([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [4, 4],
      [0, 4],
      [0, 0],
    ])
    const simple = simplifyRing(straight)
    expect(simple.length).toBeLessThan(straight.length)
    expect(simple).not.toContainEqual([2, 0])
  })

  it('keeps vertices that deviate by more than eps', () => {
    const jagged = ring([
      [0, 0],
      [1, 5],
      [2, 0],
      [3, 5],
      [4, 0],
      [4, 9],
      [0, 9],
      [0, 0],
    ])
    expect(simplifyRing(jagged)).toEqual(jagged)
  })

  it('keeps the first and last vertex, so a closed ring stays closed', () => {
    const closed = ring([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [3, 3],
      [0, 3],
      [0, 0],
    ])
    const simple = simplifyRing(closed)
    expect(simple[0]).toEqual([0, 0])
    expect(simple[simple.length - 1]).toEqual([0, 0])
  })

  it('never returns fewer than four vertices, which would not fill', () => {
    const sliver = ring([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [4, 0],
      [0, 0],
    ])
    expect(simplifyRing(sliver).length).toBeGreaterThanOrEqual(4)
  })

  it('keeps more vertices for a smaller eps', () => {
    // A wavy closed ring, so neither tolerance trips the minimum-vertex guard.
    const coast = ring([
      ...Array.from({ length: 60 }, (_, i) => [i, Math.sin(i / 4) * 3] as Position),
      [59, 40],
      [0, 40],
      [0, 0],
    ])
    const fine = simplifyRing(coast, 0.05)
    const coarse = simplifyRing(coast, 0.4)
    expect(coarse.length).toBeGreaterThan(4)
    expect(fine.length).toBeGreaterThan(coarse.length)
  })

  it('stays within eps of the outline it simplified', () => {
    const coast = ring([
      ...Array.from({ length: 60 }, (_, i) => [i, Math.sin(i / 4) * 3] as Position),
      [59, 40],
      [0, 40],
      [0, 0],
    ])
    const simple = simplifyRing(coast, 0.4)
    // Every dropped vertex is within eps of the segment that replaced it.
    for (const point of coast) {
      let nearest = Infinity
      for (let i = 0; i < simple.length - 1; i++) {
        const from = simple[i]
        const to = simple[i + 1]
        const runX = to[0] - from[0]
        const runY = to[1] - from[1]
        const length = Math.hypot(runX, runY)
        const offset =
          length === 0
            ? Math.hypot(point[0] - from[0], point[1] - from[1])
            : Math.abs(runY * (point[0] - from[0]) - runX * (point[1] - from[1])) / length
        nearest = Math.min(nearest, offset)
      }
      expect(nearest).toBeLessThanOrEqual(0.4 + 1e-9)
    }
  })

  it('does not mutate the ring it was given', () => {
    const original: Position[] = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [3, 3],
      [0, 0],
    ]
    const copy = structuredClone(original)
    simplifyRing(original)
    expect(original).toEqual(copy)
  })
})

describe('simplifyGeometry', () => {
  const polygon: Geometry = {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [3, 3],
        [0, 3],
        [0, 0],
      ],
    ],
  }

  it('simplifies every ring of a polygon', () => {
    const simple = simplifyGeometry(polygon)
    expect(simple.type).toBe('Polygon')
    const rings = (simple as typeof polygon & { coordinates: Position[][] }).coordinates
    expect(rings[0].length).toBeLessThan(7)
  })

  it('simplifies every ring of every polygon of a multipolygon', () => {
    const multi: Geometry = { type: 'MultiPolygon', coordinates: [polygon.coordinates as Position[][]] }
    const simple = simplifyGeometry(multi) as typeof multi & { coordinates: Position[][][] }
    expect(simple.coordinates[0][0].length).toBeLessThan(7)
  })

  it('passes other geometry types through untouched', () => {
    const point: Geometry = { type: 'Point', coordinates: [1, 2] }
    expect(simplifyGeometry(point)).toEqual(point)
  })

  it('does not mutate the geometry it was given', () => {
    const copy = structuredClone(polygon)
    simplifyGeometry(polygon)
    expect(polygon).toEqual(copy)
  })
})

describe('simplifyFeature', () => {
  it('keeps the feature id and properties', () => {
    const shape: Feature<Geometry> = {
      type: 'Feature',
      id: '840',
      properties: { name: 'USA' },
      geometry: { type: 'Point', coordinates: [0, 0] },
    }
    const simple = simplifyFeature(shape)
    expect(simple.id).toBe('840')
    expect(simple.properties).toEqual({ name: 'USA' })
  })
})

describe('the simplified atlas the moving globe draws', () => {
  const topology = JSON.parse(
    readFileSync('public/data/world-110m.json', 'utf8')
  ) as Topology<{ countries: GeometryCollection }>
  const collection = feature(topology, topology.objects.countries) as FeatureCollection<Geometry>

  const countPoints = (geometry: Geometry): number => {
    if (geometry.type === 'Polygon') {
      return geometry.coordinates.reduce((n, ring) => n + ring.length, 0)
    }
    if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.reduce(
        (n, polygon) => n + polygon.reduce((m, ring) => m + ring.length, 0),
        0
      )
    }
    return 0
  }

  it('carries far fewer vertices, which is the whole point', () => {
    const full = collection.features.reduce((n, shape) => n + countPoints(shape.geometry), 0)
    const simple = collection.features.reduce(
      (n, shape) => n + countPoints(simplifyFeature(shape).geometry),
      0
    )
    expect(full).toBeGreaterThan(10000)
    expect(simple).toBeLessThan(full * 0.5)
  })

  it('leaves every country roughly where it was', () => {
    for (const shape of collection.features) {
      const [[west, south], [east, north]] = geoBounds(shape)
      const [[sWest, sSouth], [sEast, sNorth]] = geoBounds(simplifyFeature(shape))
      // Each edge may pull in by at most the simplification tolerance.
      const slack = SIMPLIFY_EPS_DEG * 2
      expect(Math.abs(sWest - west)).toBeLessThanOrEqual(slack)
      expect(Math.abs(sEast - east)).toBeLessThanOrEqual(slack)
      expect(Math.abs(sSouth - south)).toBeLessThanOrEqual(slack)
      expect(Math.abs(sNorth - north)).toBeLessThanOrEqual(slack)
    }
  })

  it('keeps every country drawable', () => {
    for (const shape of collection.features) {
      expect(countPoints(simplifyFeature(shape).geometry)).toBeGreaterThanOrEqual(4)
    }
  })
})
