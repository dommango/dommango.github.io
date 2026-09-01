"use client";

import { useState, useCallback, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  Sphere,
} from "react-simple-maps";
import { geoOrthographic } from "d3-geo";
import { Country, FlightRoute } from "@/lib/content/travel";

// Served locally so a CDN hiccup can't blank the globe — the site otherwise
// has no runtime third-party dependency.
const geoUrl = "/data/world-110m.json";

// world-atlas@2 countries-110m.json uses zero-padded numeric ISO 3166-1 codes as geo.id
const COUNTRY_ISO_MAP: Record<string, string> = {
  usa: "840",
  philippines: "608",
  canada: "124",
  grenada: "308",
  sweden: "752",
  estonia: "233",
  russia: "643",
  finland: "246",
  "dominican-republic": "214",
  uk: "826",
  france: "250",
  monaco: "492",
  italy: "380",
  "vatican-city": "336",
  greece: "300",
  austria: "040",
  switzerland: "756",
  "czech-republic": "203",
  germany: "276",
  liechtenstein: "438",
  netherlands: "528",
  "costa-rica": "188",
  jamaica: "388",
  colombia: "170",
  panama: "591",
  "hong-kong": "344",
  cambodia: "116",
  bolivia: "068",
  chile: "152",
  peru: "604",
  morocco: "504",
  cuba: "192",
  japan: "392",
  china: "156",
  vietnam: "704",
  thailand: "764",
  malaysia: "458",
  singapore: "702",
  turkey: "792",
  hungary: "348",
  denmark: "208",
  poland: "616",
  mexico: "484",
  nepal: "524",
  india: "356",
  "south-korea": "410",
  spain: "724",
  portugal: "620",
  taiwan: "158",
  qatar: "634",
  argentina: "032",
  brazil: "076",
  iceland: "352",
  "saudi-arabia": "682",
  oman: "512",
  "united-arab-emirates": "784",
};

interface TravelMapProps {
  countries: Country[];
  flightRoutes?: FlightRoute[];
  selectedYear?: number;
  showFlights?: boolean;
}

interface TooltipData {
  content: string;
  subtext?: string;
}

function isVisible(
  coords: [number, number],
  rotation: [number, number, number],
): boolean {
  const projection = geoOrthographic()
    .rotate(rotation)
    .translate([0, 0])
    .scale(1);
  return projection(coords) !== null;
}

export function TravelMap({
  countries,
  flightRoutes = [],
  selectedYear,
  showFlights = false,
}: TravelMapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<[number, number, number]>([
    0, -20, 0,
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    rotation: [number, number, number];
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayedCountries = selectedYear
    ? countries.filter((c) => c.firstVisited <= selectedYear)
    : countries;

  const visitedIsoCodesSet = new Set(
    displayedCountries.map((c) => COUNTRY_ISO_MAP[c.id]).filter(Boolean),
  );

  const isoToCountryMap = new Map<string, Country>();
  displayedCountries.forEach((c) => {
    const iso = COUNTRY_ISO_MAP[c.id];
    if (iso) isoToCountryMap.set(iso, c);
  });

  const airportsMap = new Map<
    string,
    { code: string; coords: [number, number]; count: number }
  >();
  if (showFlights) {
    flightRoutes.forEach((route) => {
      if (!airportsMap.has(route.from)) {
        airportsMap.set(route.from, {
          code: route.from,
          coords: route.fromCoords,
          count: route.count,
        });
      } else {
        airportsMap.get(route.from)!.count += route.count;
      }
      if (!airportsMap.has(route.to)) {
        airportsMap.set(route.to, {
          code: route.to,
          coords: route.toCoords,
          count: route.count,
        });
      } else {
        airportsMap.get(route.to)!.count += route.count;
      }
    });
  }
  const airports = Array.from(airportsMap.values());

  const handleMouseMove = useCallback(
    (e: React.PointerEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (isDragging && dragStart.current) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        const sensitivity = 0.3;
        setRotation([
          dragStart.current.rotation[0] + dx * sensitivity,
          Math.max(
            -90,
            Math.min(90, dragStart.current.rotation[1] - dy * sensitivity),
          ),
          0,
        ]);
      }
    },
    [isDragging],
  );

  const handleMouseDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        rotation: [...rotation] as [number, number, number],
      };
    },
    [rotation],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Not wrapped in useCallback: isoToCountryMap is a new Map every render
  // (built from displayedCountries above), so memoizing this against it would
  // never actually skip a re-creation.
  const showCountryTooltip = (isoCode: string) => {
    const country = isoToCountryMap.get(isoCode);
    if (country) {
      setTooltip({
        content: country.name,
        subtext: `First visited: ${country.firstVisited}`,
      });
    }
  };

  const showFlightTooltip = useCallback(
    (from: string, to: string, count: number) => {
      setTooltip({
        content: `${from} → ${to}`,
        subtext: `${count} flight${count > 1 ? "s" : ""}`,
      });
    },
    [],
  );

  const showAirportTooltip = useCallback((code: string) => {
    setTooltip({ content: code });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div
      ref={containerRef}
      className="map-frame"
      onPointerDown={(e) => {
        // Seed the tooltip position on press — a tap has no preceding
        // pointermove, so without this the tooltip renders at its stale
        // (0,0) default the first time a touch lands on a country.
        setMousePos({ x: e.clientX, y: e.clientY });
        e.currentTarget.setPointerCapture(e.pointerId);
        handleMouseDown(e);
      }}
      onPointerMove={handleMouseMove}
      onPointerUp={(e) => {
        // Touch/pen have no hover to dismiss the tooltip on — a mouse gets
        // one via onMouseLeave/onPointerLeave on the Geography itself.
        if (e.pointerType !== "mouse") hideTooltip();
        handleMouseUp();
      }}
      onPointerCancel={handleMouseUp}
      onPointerLeave={() => {
        hideTooltip();
        handleMouseUp();
      }}
      style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "pan-y" }}
      tabIndex={0}
      role="group"
      aria-label={`Globe showing ${displayedCountries.length} visited countries. Drag or use the arrow keys to rotate.`}
      onKeyDown={(e) => {
        const step = 10;
        const [lon, lat] = rotation;
        // Match drag: dragging up increases rotation[1] (dy < 0, so
        // rotation[1] - dy*sensitivity grows), so ArrowUp must also increase it.
        if (e.key === "ArrowLeft") setRotation([lon - step, lat, 0]);
        else if (e.key === "ArrowRight") setRotation([lon + step, lat, 0]);
        else if (e.key === "ArrowUp") setRotation([lon, Math.min(90, lat + step), 0]);
        else if (e.key === "ArrowDown") setRotation([lon, Math.max(-90, lat - step), 0]);
        else return;
        e.preventDefault();
      }}
    >
      {tooltip && (
        <div
          className="map-tip"
          style={{
            left: mousePos.x + 15,
            top: mousePos.y + 15,
          }}
        >
          {tooltip.content}
          {tooltip.subtext && <small>{tooltip.subtext}</small>}
        </div>
      )}

      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ scale: 250, rotate: rotation }}
        style={{ width: "100%", height: "auto" }}
        width={500}
        height={500}
      >
        <Sphere
          id="globe-sphere"
          fill="var(--map-sphere)"
          stroke="var(--map-stroke)"
          strokeWidth={0.5}
        />
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isoCode = geo.id as string;
              const isVisited = visitedIsoCodesSet.has(isoCode);
              const baseFill = isVisited ? "var(--map-visited)" : "var(--map-land)";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  data-visited={isVisited}
                  // react-simple-maps hardcodes tabIndex=0 on every path; with
                  // 177+ geographies that turns Tab into a scroll-by-country
                  // trap after focusing the globe. The group itself is the
                  // one keyboard target.
                  tabIndex={-1}
                  stroke="var(--map-stroke)"
                  strokeWidth={0.5}
                  style={{
                    default: { fill: baseFill, outline: "none" },
                    hover: {
                      fill: isVisited ? "var(--map-visited-hover)" : "var(--map-land-hover)",
                      outline: "none",
                      cursor: isVisited ? "pointer" : "default",
                    },
                    pressed: { fill: baseFill, outline: "none" },
                  }}
                  onMouseEnter={() => {
                    if (isVisited) showCountryTooltip(isoCode);
                  }}
                  onMouseLeave={hideTooltip}
                />
              );
            })
          }
        </Geographies>

        {showFlights &&
          flightRoutes.map((route, idx) => {
            const from: [number, number] = [
              route.fromCoords[1],
              route.fromCoords[0],
            ];
            const to: [number, number] = [route.toCoords[1], route.toCoords[0]];
            const fromVisible = isVisible(from, rotation);
            const toVisible = isVisible(to, rotation);
            if (!fromVisible && !toVisible) return null;

            return (
              <Line
                key={`flight-${route.from}-${route.to}-${idx}`}
                from={from}
                to={to}
                stroke="var(--accent)"
                strokeOpacity={0.6}
                strokeWidth={Math.min(0.8 + route.count * 0.15, 3)}
                strokeLinecap="round"
                style={{ cursor: "pointer" }}
                onMouseEnter={() =>
                  showFlightTooltip(route.from, route.to, route.count)
                }
                onMouseLeave={hideTooltip}
              />
            );
          })}

        {showFlights &&
          airports.map((airport) => {
            const coords: [number, number] = [
              airport.coords[1],
              airport.coords[0],
            ];
            if (!isVisible(coords, rotation)) return null;

            return (
              <Marker
                key={`airport-${airport.code}`}
                coordinates={coords}
                onMouseEnter={() => showAirportTooltip(airport.code)}
                onMouseLeave={hideTooltip}
              >
                <circle
                  r={Math.min(2.5 + airport.count * 0.05, 5)}
                  stroke="var(--map-stroke)"
                  strokeWidth={0.5}
                  style={{ fill: "var(--accent)", cursor: "pointer" }}
                />
              </Marker>
            );
          })}
      </ComposableMap>
    </div>
  );
}
