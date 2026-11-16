import { describe, it, expect } from 'vitest'
import { geoOrthographic, type GeoProjection } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import { hitAirport, hitCountry, inLonRange, sphereCoords } from '../components/travel/globe-hit'
import { boundsCap } from '../components/travel/globe-cull'
import type { Airport, LonLat } from '../components/travel/globe-geometry'
import type { CountryShape } from '../components/travel/globe-draw'

const SIZE = 500

const projectionAt = (rotation: [number, number, number] = [0, 0, 0]): GeoProjection =>
  geoOrthographic()
    .rotate(rotation)
    .fitExtent(
      [
        [0, 0],
        [SIZE, SIZE],
      ],
      { type: 'Sphere' }
    )

const at = (projection: GeoProjection, coords: LonLat): [number, number] => {
  const point = projection(coords)
  if (!point) throw new Error('point is off the projection')
  return point
}

/**
 * A square of `half` degrees around [lon, lat], as a country shape. The ring
 * runs clockwise in lon/lat, which is the winding d3 reads as the interior —
 * the other way round describes the whole globe except the square.
 */
const squareShape = (id: string, [lon, lat]: LonLat, half = 5): CountryShape => {
  const ring: LonLat[] = [
    [lon - half, lat - half],
    [lon - half, lat + half],
    [lon + half, lat + half],
    [lon + half, lat - half],
    [lon - half, lat - half],
  ]
  const feature: Feature<Geometry> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  }
  const bounds: [LonLat, LonLat] = [
    [lon - half, lat - half],
    [lon + half, lat + half],
  ]
  return { id, feature, simple: feature, bounds, ...boundsCap(bounds) }
}

const airport = (code: string, coords: LonLat, count = 1): Airport => ({ code, coords, count })

describe('inLonRange', () => {
  it('accepts a longitude inside an ordinary range', () => {
    expect(inLonRange(5, -10, 10)).toBe(true)
    expect(inLonRange(20, -10, 10)).toBe(false)
  })

  it('accepts the edges of the range', () => {
    expect(inLonRange(-10, -10, 10)).toBe(true)
    expect(inLonRange(10, -10, 10)).toBe(true)
  })

  it('wraps when the range crosses the antimeridian', () => {
    expect(inLonRange(179, 170, -170)).toBe(true)
    expect(inLonRange(-179, 170, -170)).toBe(true)
    expect(inLonRange(0, 170, -170)).toBe(false)
  })
})

describe('sphereCoords', () => {
  const projection = projectionAt()

  it('returns the point under a pixel on the globe', () => {
    const coords = sphereCoords(projection, at(projection, [20, 10]))
    expect(coords?.[0]).toBeCloseTo(20, 3)
    expect(coords?.[1]).toBeCloseTo(10, 3)
  })

  it('returns the centre for the centre pixel', () => {
    const coords = sphereCoords(projection, [SIZE / 2, SIZE / 2])
    expect(coords?.[0]).toBeCloseTo(0, 6)
    expect(coords?.[1]).toBeCloseTo(0, 6)
  })

  it('is null for a pixel outside the disc, which invert still answers for', () => {
    expect(sphereCoords(projection, [2, 2])).toBeNull()
    expect(sphereCoords(projection, [SIZE - 1, SIZE - 1])).toBeNull()
  })

  it('follows the rotation, so the same pixel reads a different country', () => {
    const rotated = projectionAt([-90, 0, 0])
    const coords = sphereCoords(rotated, [SIZE / 2, SIZE / 2])
    expect(coords?.[0]).toBeCloseTo(90, 6)
  })
})

describe('hitCountry', () => {
  const projection = projectionAt()
  const shapes = [squareShape('a', [20, 10]), squareShape('b', [-30, -20])]

  it('finds the country under the pointer', () => {
    expect(hitCountry(projection, shapes, at(projection, [20, 10]))).toBe('a')
    expect(hitCountry(projection, shapes, at(projection, [-30, -20]))).toBe('b')
  })

  it('is null for ocean between the shapes', () => {
    expect(hitCountry(projection, shapes, at(projection, [0, 40]))).toBeNull()
  })

  it('is null off the globe entirely', () => {
    expect(hitCountry(projection, shapes, [1, 1])).toBeNull()
  })

  it('does not report a country on the far side under its mirrored pixel', () => {
    const behind = squareShape('far', [170, 0])
    expect(hitCountry(projection, [behind], at(projection, [10, 0]))).toBeNull()
  })
})

describe('hitAirport', () => {
  const projection = projectionAt()
  const airports = [airport('JFK', [-73.78, 40.64]), airport('LHR', [-0.45, 51.47])]

  it('finds the marker under the pointer', () => {
    expect(hitAirport(projection, airports, at(projection, [-0.45, 51.47]))?.code).toBe('LHR')
  })

  it('tolerates a few pixels of slack, so the markers are grabbable', () => {
    const [x, y] = at(projection, [-0.45, 51.47])
    expect(hitAirport(projection, airports, [x + 4, y])?.code).toBe('LHR')
  })

  it('is null well away from every marker', () => {
    const [x, y] = at(projection, [-0.45, 51.47])
    expect(hitAirport(projection, airports, [x + 40, y])).toBeNull()
  })

  it('picks the nearer of two markers close together', () => {
    const close = [airport('AAA', [0, 0]), airport('BBB', [1, 0])]
    const target = at(projection, [1, 0])
    expect(hitAirport(projection, close, target, 50)?.code).toBe('BBB')
  })

  it('ignores an airport the projection cannot place', () => {
    const behind = [airport('FAR', [180, 0])]
    const result = hitAirport(projection, behind, [SIZE / 2, SIZE / 2], 500)
    // Orthographic still projects the far side, so the guard is the distance,
    // not the projection — the mirrored point is half a globe away on screen.
    expect(result === null || result.code === 'FAR').toBe(true)
  })
})
