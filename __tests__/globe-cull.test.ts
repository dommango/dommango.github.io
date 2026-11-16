import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { geoBounds } from 'd3-geo'
import { feature } from 'topojson-client'
import type { FeatureCollection, Geometry, Position } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import {
  angularDistance,
  anyVisible,
  boundsCap,
  capVisible,
  pointVisible,
  viewCenter,
} from '../components/travel/globe-cull'
import type { LonLat } from '../components/travel/globe-geometry'

describe('angularDistance', () => {
  it('is zero for the same point', () => {
    expect(angularDistance([10, 20], [10, 20])).toBeCloseTo(0, 6)
  })

  it('measures a quarter turn along the equator', () => {
    expect(angularDistance([0, 0], [90, 0])).toBeCloseTo(90, 6)
  })

  it('measures pole to pole as a half turn', () => {
    expect(angularDistance([0, -90], [0, 90])).toBeCloseTo(180, 6)
  })

  it('is symmetric', () => {
    expect(angularDistance([12, -34], [56, 78])).toBeCloseTo(
      angularDistance([56, 78], [12, -34]),
      9
    )
  })

  it('takes the short way across the antimeridian', () => {
    expect(angularDistance([179, 0], [-179, 0])).toBeCloseTo(2, 6)
  })

  it('stays real for antipodal points, where the cosine can overshoot', () => {
    expect(Number.isNaN(angularDistance([0, 90], [180, -90]))).toBe(false)
  })
})

describe('viewCenter', () => {
  it('is the negated rotation, which is what faces the viewer', () => {
    expect(viewCenter([-139.7, 21, 0])).toEqual([139.7, -21])
  })
})

describe('boundsCap', () => {
  it('centres on a simple box and reaches its corners', () => {
    const cap = boundsCap([
      [-10, -5],
      [10, 5],
    ])
    expect(cap.center[0]).toBeCloseTo(0, 6)
    expect(cap.center[1]).toBeCloseTo(0, 6)
    expect(cap.radius).toBeCloseTo(angularDistance([0, 0], [10, 5]), 6)
  })

  it('handles a box that crosses the antimeridian, where west > east', () => {
    const cap = boundsCap([
      [170, -10],
      [-170, 10],
    ])
    expect(Math.abs(cap.center[0])).toBeCloseTo(180, 6)
    expect(cap.radius).toBeCloseTo(angularDistance([180, 0], [170, 10]), 6)
  })

  it('reaches past the longer half-span, which the diagonal exceeds', () => {
    // Brazil-sized: 40 degrees of longitude by 39 of latitude. Half the wider
    // span is 20, but the corner is 27.8 out — a cap of 20 would cull it while
    // a corner was still on the near side.
    const cap = boundsCap([
      [-74, -34],
      [-34, 5],
    ])
    expect(cap.radius).toBeGreaterThan(20)
    expect(cap.radius).toBeCloseTo(27.8, 1)
  })

  it('keeps the centre longitude inside -180..180', () => {
    const cap = boundsCap([
      [100, 0],
      [-150, 10],
    ])
    expect(cap.center[0]).toBeGreaterThanOrEqual(-180)
    expect(cap.center[0]).toBeLessThanOrEqual(180)
  })

  it('covers every corner of the box it was built from', () => {
    const boxes: Array<[LonLat, LonLat]> = [
      [
        [-30, -20],
        [30, 20],
      ],
      [
        [-5, 41],
        [10, 51],
      ],
      [
        [-171, 18],
        [-67, 71],
      ],
      [
        [170, -45],
        [-175, -34],
      ],
    ]
    for (const bounds of boxes) {
      const cap = boundsCap(bounds)
      const [[west, south], [east, north]] = bounds
      const spanLon = (((east - west) % 360) + 360) % 360
      const corners: LonLat[] = [
        [west, south],
        [west, north],
        [west + spanLon, south],
        [west + spanLon, north],
      ]
      for (const corner of corners) {
        expect(angularDistance(cap.center, corner)).toBeLessThanOrEqual(cap.radius + 1e-9)
      }
    }
  })

  it('keeps a box spanning every longitude visible from any equatorial view', () => {
    // geoBounds reports -180..180 for such a shape; read as a zero-width box it
    // would be culled from half the globe.
    const cap = boundsCap([
      [-180, -90],
      [180, -63],
    ])
    for (let lon = -180; lon < 180; lon += 30) {
      expect(capVisible(cap.center, cap.radius, [lon, 0])).toBe(true)
    }
  })

  it('still culls an Antarctic band from over the opposite pole', () => {
    const cap = boundsCap([
      [-180, -90],
      [180, -63],
    ])
    expect(capVisible(cap.center, cap.radius, [0, 90])).toBe(false)
  })
})

describe('pointVisible', () => {
  it('keeps the point under the viewer', () => {
    expect(pointVisible([0, 0], [0, 0])).toBe(true)
  })

  it('rejects the far side of the globe', () => {
    expect(pointVisible([180, 0], [0, 0])).toBe(false)
    expect(pointVisible([120, 0], [0, 0])).toBe(false)
  })

  it('rejects the horizon itself, where nothing is drawable', () => {
    expect(pointVisible([90, 0], [0, 0])).toBe(false)
  })
})

describe('capVisible', () => {
  it('keeps a cap facing the viewer', () => {
    expect(capVisible([0, 0], 10, [0, 0])).toBe(true)
  })

  it('rejects a cap entirely on the far side', () => {
    expect(capVisible([180, 0], 10, [0, 0])).toBe(false)
  })

  it('keeps a cap whose near edge has come round the horizon', () => {
    // Centre is past the horizon, but a 30 degree cap still reaches onto it.
    expect(capVisible([110, 0], 30, [0, 0])).toBe(true)
  })

  it('is never stricter than pointVisible for a zero-radius cap', () => {
    for (let lon = 0; lon <= 180; lon += 10) {
      const point: LonLat = [lon, 0]
      expect(capVisible(point, 0, [0, 0])).toBe(pointVisible(point, [0, 0]))
    }
  })
})

describe('anyVisible', () => {
  const view: LonLat = [0, 0]

  it('keeps an arc with one end on the near side', () => {
    expect(
      anyVisible(
        [
          [170, 0],
          [10, 0],
        ],
        view
      )
    ).toBe(true)
  })

  it('rejects an arc entirely behind the globe', () => {
    expect(
      anyVisible(
        [
          [150, 0],
          [170, 10],
        ],
        view
      )
    ).toBe(false)
  })

  it('rejects an empty list rather than drawing it', () => {
    expect(anyVisible([], view)).toBe(false)
  })
})

/** Every coordinate of a GeoJSON polygon or multipolygon, however nested. */
const positions = (geometry: Geometry): Position[] => {
  const walk = (node: unknown, depth: number): Position[] =>
    depth === 0
      ? [node as Position]
      : (node as unknown[]).flatMap((child) => walk(child, depth - 1))
  if (geometry.type === 'Polygon') return walk(geometry.coordinates, 2)
  if (geometry.type === 'MultiPolygon') return walk(geometry.coordinates, 3)
  return []
}

describe('the cull against the atlas the globe actually draws', () => {
  // The cheap reject must never hide a country that is on screen. Before the
  // cap reached its box's corners this failed for eight country/view pairs,
  // Brazil, France and Antarctica among them, which popped off at the horizon.
  it('never culls a country with a point on the near side', () => {
    const topology = JSON.parse(
      readFileSync('public/data/world-110m.json', 'utf8')
    ) as Topology<{ countries: GeometryCollection }>
    const collection = feature(
      topology,
      topology.objects.countries
    ) as FeatureCollection<Geometry>

    const falseCulls: string[] = []
    for (const shape of collection.features) {
      const cap = boundsCap(geoBounds(shape) as [LonLat, LonLat])
      const points = positions(shape.geometry) as LonLat[]
      for (let lon = -180; lon < 180; lon += 20) {
        for (const lat of [-30, 0, 30]) {
          const view: LonLat = [lon, lat]
          const onScreen = points.some((point) => pointVisible(point, view))
          if (onScreen && !capVisible(cap.center, cap.radius, view)) {
            falseCulls.push(`${shape.id} from ${lon},${lat}`)
          }
        }
      }
    }
    expect(falseCulls).toEqual([])
  })
})
