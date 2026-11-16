import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { geoOrthographic } from 'd3-geo'
import type { Rotation } from '../components/travel/globe-geometry'

// A controller whose rotation the test moves by hand, standing in for a focus
// tween or the intro spin advancing between pointer events.
let rotation: Rotation = [0, 0, 0]
const controller = {
  setCanvas: vi.fn(),
  setSize: vi.fn(),
  setScene: vi.fn(),
  setColors: vi.fn(),
  setHover: vi.fn(),
  startIntro: vi.fn(),
  focusOn: vi.fn(),
  rotateBy: vi.fn(),
  setRotation: vi.fn(),
  rotation: () => rotation,
  projection: () => geoOrthographic().rotate(rotation),
  markUserRotated: vi.fn(),
  requestFrame: vi.fn(),
  stop: vi.fn(),
}

vi.mock('../components/travel/globe-controller', () => ({
  createGlobeController: () => controller,
}))
vi.mock('../components/travel/globe-atlas', () => ({
  loadCountryShapes: () => Promise.resolve([]),
}))

const { TravelMap } = await import('../components/travel/TravelMap')

const frame = () => document.querySelector('.map-frame') as HTMLElement
const pointer = (type: 'pointerDown' | 'pointerMove' | 'pointerCancel', x: number, y: number) =>
  fireEvent[type](frame(), { clientX: x, clientY: y, pointerId: 1, pointerType: 'touch' })

describe('TravelMap drag', () => {
  beforeEach(() => {
    rotation = [0, 0, 0]
    vi.clearAllMocks()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      }
    )
    HTMLElement.prototype.setPointerCapture = () => {}
    render(<TravelMap countries={[]} />)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('leaves the choreography alone for a gesture the browser takes over', () => {
    pointer('pointerDown', 100, 100)
    pointer('pointerMove', 100, 105)
    pointer('pointerCancel', 100, 105)
    expect(controller.markUserRotated).not.toHaveBeenCalled()
    expect(controller.setRotation).not.toHaveBeenCalled()
  })

  it('takes over from the current rotation, not the one under the press', () => {
    pointer('pointerDown', 100, 100)
    rotation = [40, 0, 0] // a tween moved the globe while the press was a tap
    pointer('pointerMove', 112, 100)
    expect(controller.markUserRotated).toHaveBeenCalledTimes(1)
    expect(controller.setRotation).not.toHaveBeenCalled()
    pointer('pointerMove', 122, 100)
    expect(controller.setRotation).toHaveBeenLastCalledWith([43, 0, 0])
  })
})
