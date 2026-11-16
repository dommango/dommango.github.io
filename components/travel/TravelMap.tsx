'use client'

// TravelMap — the flight globe. The scene is painted to one canvas by
// globe-controller (see globe-draw for why: the old SVG renderer handed 177
// country paths to React and re-rendered all of them per rotation tick, which
// the scroll-driven reel could not afford). React here only owns the frame, the
// hover tooltip and the text equivalent of the globe for screen readers.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Country, FlightRoute } from '@/lib/content/travel'
import { loadCountryShapes } from './globe-atlas'
import { readGlobeColors, type CountryShape } from './globe-draw'
import { createGlobeController } from './globe-controller'
import {
  buildAirports,
  buildRouteArcs,
  isoCountryMap,
  visitedIsoCodes,
  type LonLat,
} from './globe-geometry'
import { hitAirport, hitCountry, hitRoute } from './globe-hit'
import { prefersReducedMotion } from './globe-timing'

const DRAG_SENSITIVITY = 0.3
/** Pointer travel before a press counts as a drag rather than a tap or a scroll. */
const DRAG_THRESHOLD_PX = 10
const KEY_STEP_DEG = 10
const TIP_OFFSET_PX = 15

interface TravelMapProps {
  countries: Country[]
  flightRoutes?: FlightRoute[]
  selectedYear?: number
  showFlights?: boolean
  /** Flips true once the globe scrolls into view; starts the route draw-in. */
  drawIn?: boolean
  /** [lon, lat] the globe should swing to — the reel's current year. */
  focus?: LonLat
}

interface TooltipData {
  content: string
  subtext?: string
}

const sameTip = (a: TooltipData | null, b: TooltipData | null) =>
  a?.content === b?.content && a?.subtext === b?.subtext

export function TravelMap({
  countries,
  flightRoutes = [],
  selectedYear,
  showFlights = false,
  drawIn = false,
  focus,
}: TravelMapProps) {
  const [controller] = useState(() => createGlobeController({ reduced: prefersReducedMotion() }))
  const frameRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    x: number
    y: number
    /** Rotation when the drag took over; null while the press is still a tap. */
    rotation: [number, number, number] | null
  } | null>(null)
  const tipStateRef = useRef<TooltipData | null>(null)
  const [shapes, setShapes] = useState<CountryShape[]>([])
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [dragging, setDragging] = useState(false)

  const displayed = useMemo(
    () => (selectedYear ? countries.filter((c) => c.firstVisited <= selectedYear) : countries),
    [countries, selectedYear]
  )
  const isoToCountry = useMemo(() => isoCountryMap(displayed), [displayed])
  const airports = useMemo(() => buildAirports(flightRoutes), [flightRoutes])
  const routeArcs = useMemo(() => buildRouteArcs(flightRoutes), [flightRoutes])
  const [focusLon, focusLat] = focus ?? [null, null]

  useEffect(() => {
    controller.setCanvas(canvasRef.current)
    return () => controller.stop()
  }, [controller])

  useEffect(() => {
    const request = new AbortController()
    loadCountryShapes(undefined, request.signal)
      .then(setShapes)
      .catch((error: unknown) => {
        if (request.signal.aborted) return
        console.error('Travel globe: country atlas unavailable', error)
      })
    return () => request.abort()
  }, [])

  useEffect(() => {
    controller.setScene({
      shapes,
      visitedIso: visitedIsoCodes(displayed),
      routes: showFlights ? routeArcs : [],
      airports: showFlights ? airports : [],
    })
  }, [controller, shapes, displayed, showFlights, routeArcs, airports])

  // The globe's colours are theme tokens, so re-read them when the theme flips.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const apply = () => controller.setColors(readGlobeColors(frame))
    apply()
    const root = frame.closest('.brutalist-root')
    if (!root) return
    const observer = new MutationObserver(apply)
    observer.observe(root, { attributes: true, attributeFilter: ['data-accent', 'data-contrast'] })
    return () => observer.disconnect()
  }, [controller])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const measure = () => {
      const { width, height } = frame.getBoundingClientRect()
      controller.setSize(Math.floor(Math.max(0, Math.min(width, height || width))))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [controller])

  useEffect(() => {
    if (drawIn) controller.startIntro()
  }, [controller, drawIn])

  useEffect(() => {
    if (focusLon === null || focusLat === null) return
    controller.focusOn([focusLon, focusLat])
  }, [controller, focusLon, focusLat])

  const showTip = (next: TooltipData | null) => {
    if (sameTip(tipStateRef.current, next)) return
    tipStateRef.current = next
    setTooltip(next)
  }

  const moveTip = (clientX: number, clientY: number) => {
    const tip = tipRef.current
    if (!tip) return
    tip.style.left = `${clientX + TIP_OFFSET_PX}px`
    tip.style.top = `${clientY + TIP_OFFSET_PX}px`
  }

  const canvasPoint = (clientX: number, clientY: number): [number, number] | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return [clientX - rect.left, clientY - rect.top]
  }

  const updateHover = (clientX: number, clientY: number) => {
    const point = canvasPoint(clientX, clientY)
    if (!point) return
    const projection = controller.projection()
    const iso = hitCountry(projection, shapes, point)
    controller.setHover(iso)
    if (iso) {
      const country = isoToCountry.get(iso)
      showTip(
        country ? { content: country.name, subtext: `First visited: ${country.firstVisited}` } : null
      )
      return
    }
    if (!showFlights) {
      showTip(null)
      return
    }
    const airport = hitAirport(projection, airports, point)
    if (airport) {
      showTip({ content: airport.code })
      return
    }
    const ctx = canvasRef.current?.getContext('2d')
    const route = ctx ? hitRoute(ctx, projection, routeArcs, point) : null
    showTip(
      route
        ? {
            content: `${route.from} → ${route.to}`,
            subtext: `${route.count} flight${route.count > 1 ? 's' : ''}`,
          }
        : null
    )
  }

  const endDrag = () => {
    dragRef.current = null
    setDragging(false)
  }

  return (
    <div
      ref={frameRef}
      className="map-frame"
      style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'pan-y' }}
      tabIndex={0}
      role="group"
      aria-label={`Globe showing ${displayed.length} visited countries. Drag or use the arrow keys to rotate.`}
      onPointerDown={(e) => {
        // A tap has no preceding move, so seed the tooltip's position and
        // hit-test here too — touch has no hover to do it later.
        moveTip(e.clientX, e.clientY)
        updateHover(e.clientX, e.clientY)
        e.currentTarget.setPointerCapture(e.pointerId)
        dragRef.current = { x: e.clientX, y: e.clientY, rotation: null }
        setDragging(true)
      }}
      onPointerMove={(e) => {
        moveTip(e.clientX, e.clientY)
        const drag = dragRef.current
        if (drag) {
          const dx = e.clientX - drag.x
          const dy = e.clientY - drag.y
          if (!drag.rotation) {
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
            controller.markUserRotated()
            dragRef.current = { x: e.clientX, y: e.clientY, rotation: controller.rotation() }
            return
          }
          controller.setRotation([
            drag.rotation[0] + dx * DRAG_SENSITIVITY,
            drag.rotation[1] - dy * DRAG_SENSITIVITY,
            0,
          ])
          return
        }
        if (e.pointerType === 'mouse') updateHover(e.clientX, e.clientY)
      }}
      onPointerUp={(e) => {
        // Touch and pen have no hover to dismiss the tooltip on.
        if (e.pointerType !== 'mouse') {
          showTip(null)
          controller.setHover(null)
        }
        endDrag()
      }}
      onPointerCancel={endDrag}
      onPointerLeave={() => {
        showTip(null)
        controller.setHover(null)
        endDrag()
      }}
      onKeyDown={(e) => {
        // Match drag: dragging up tilts the globe's north toward the viewer.
        if (e.key === 'ArrowLeft') controller.rotateBy(-KEY_STEP_DEG, 0)
        else if (e.key === 'ArrowRight') controller.rotateBy(KEY_STEP_DEG, 0)
        else if (e.key === 'ArrowUp') controller.rotateBy(0, KEY_STEP_DEG)
        else if (e.key === 'ArrowDown') controller.rotateBy(0, -KEY_STEP_DEG)
        else return
        e.preventDefault()
      }}
    >
      <canvas ref={canvasRef} className="globe-canvas" aria-hidden="true" />
      {/* The canvas carries no accessible content: this is the globe in text. */}
      <ul className="sr-only globe-countries">
        {displayed.map((country) => (
          <li key={country.id}>
            {country.name} — first visited {country.firstVisited}
          </li>
        ))}
      </ul>
      <div ref={tipRef} className="map-tip" hidden={!tooltip} aria-hidden="true">
        {tooltip?.content}
        {tooltip?.subtext && <small>{tooltip.subtext}</small>}
      </div>
    </div>
  )
}
