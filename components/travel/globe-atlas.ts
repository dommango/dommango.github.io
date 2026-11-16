// Loads the local country atlas and prepares it for the canvas renderer.
// Served from /public so a CDN hiccup can't blank the globe — the site
// otherwise has no runtime third-party dependency.
import { geoBounds } from 'd3-geo'
import { feature } from 'topojson-client'
import type { FeatureCollection, Geometry } from 'geojson'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { CountryShape } from './globe-draw'
import { boundsCap } from './globe-cull'

export const ATLAS_URL = '/data/world-110m.json'
const COUNTRIES_OBJECT = 'countries'

/**
 * Country shapes with their geographic bounds precomputed, so hover testing can
 * reject most of the 177 features without a containment test.
 */
export async function loadCountryShapes(
  url: string = ATLAS_URL,
  signal?: AbortSignal
): Promise<CountryShape[]> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Country atlas ${url} failed with HTTP ${response.status}`)
  }
  const topology = (await response.json()) as Topology<{
    countries: GeometryCollection
  }>
  const countries = topology.objects[COUNTRIES_OBJECT]
  if (!countries) {
    throw new Error(`Country atlas ${url} has no "${COUNTRIES_OBJECT}" object`)
  }
  const collection = feature(topology, countries) as FeatureCollection<Geometry>
  return collection.features.map((shape) => {
    const bounds = geoBounds(shape)
    return { id: String(shape.id), feature: shape, bounds, ...boundsCap(bounds) }
  })
}
