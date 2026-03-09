/**
 * Fetches flight data from Notion and generates flight routes JSON
 *
 * Usage: NOTION_API_KEY=xxx node scripts/fetch-flights.js
 */

const fs = require('fs')
const path = require('path')

const NOTION_API_KEY = process.env.NOTION_API_KEY
const DATABASE_ID = '28b0a8ea-3302-8037-ba49-e9b8ce73470b'

// Airport coordinates (IATA code -> [lat, lng])
// We'll build this dynamically and cache it
const AIRPORT_COORDS = {
  // Major US airports
  'JFK': [40.6413, -73.7781],
  'EWR': [40.6895, -74.1745],
  'LGA': [40.7769, -73.8740],
  'LAX': [33.9416, -118.4085],
  'SFO': [37.6213, -122.3790],
  'ORD': [41.9742, -87.9073],
  'ATL': [33.6407, -84.4277],
  'DFW': [32.8998, -97.0403],
  'DEN': [39.8561, -104.6737],
  'SEA': [47.4502, -122.3088],
  'MIA': [25.7959, -80.2870],
  'BOS': [42.3656, -71.0096],
  'MSP': [44.8848, -93.2223],
  'DTW': [42.2162, -83.3554],
  'PHL': [39.8729, -75.2437],
  'CLT': [35.2140, -80.9431],
  'PHX': [33.4373, -112.0078],
  'IAH': [29.9902, -95.3368],
  'MCO': [28.4312, -81.3081],
  'SAN': [32.7338, -117.1933],
  'TPA': [27.9756, -82.5333],
  'PDX': [45.5898, -122.5951],
  'SLC': [40.7899, -111.9791],
  'DCA': [38.8512, -77.0402],
  'IAD': [38.9531, -77.4565],
  'BWI': [39.1754, -76.6684],
  'AUS': [30.1975, -97.6664],
  'BNA': [36.1263, -86.6774],
  'RDU': [35.8801, -78.7880],
  'MKE': [42.9472, -87.8966],
  'STL': [38.7499, -90.3748],
  'OAK': [37.7213, -122.2208],
  'SJC': [37.3639, -121.9289],
  'SMF': [38.6954, -121.5908],
  'HNL': [21.3187, -157.9225],
  'OGG': [20.8986, -156.4305],
  'LIH': [21.9760, -159.3390],
  'KOA': [19.7388, -156.0456],
  'ANC': [61.1743, -149.9962],

  // International airports
  'LHR': [51.4700, -0.4543],
  'CDG': [49.0097, 2.5479],
  'FRA': [50.0379, 8.5622],
  'AMS': [52.3105, 4.7683],
  'FCO': [41.8003, 12.2389],
  'MAD': [40.4983, -3.5676],
  'BCN': [41.2974, 2.0833],
  'MUC': [48.3537, 11.7750],
  'ZRH': [47.4647, 8.5492],
  'VIE': [48.1103, 16.5697],
  'DUB': [53.4264, -6.2499],
  'LIS': [38.7756, -9.1354],
  'CPH': [55.6180, 12.6508],
  'OSL': [60.1976, 11.0004],
  'ARN': [59.6519, 17.9186],
  'HEL': [60.3172, 24.9633],
  'BRU': [50.9014, 4.4844],
  'PRG': [50.1008, 14.2600],
  'BUD': [47.4298, 19.2611],
  'WAW': [52.1657, 20.9671],
  'ATH': [37.9364, 23.9445],
  'IST': [41.2753, 28.7519],
  'TLV': [32.0055, 34.8854],
  'DXB': [25.2532, 55.3657],
  'DOH': [25.2609, 51.6138],
  'AUH': [24.4330, 54.6511],

  // Asia Pacific
  'NRT': [35.7720, 140.3929],
  'HND': [35.5494, 139.7798],
  'ICN': [37.4602, 126.4407],
  'PEK': [40.0799, 116.6031],
  'PVG': [31.1443, 121.8083],
  'HKG': [22.3080, 113.9185],
  'TPE': [25.0797, 121.2342],
  'SIN': [1.3644, 103.9915],
  'BKK': [13.6900, 100.7501],
  'KUL': [2.7456, 101.7099],
  'SYD': [-33.9399, 151.1753],
  'MEL': [-37.6690, 144.8410],
  'AKL': [-37.0082, 174.7850],
  'DEL': [28.5562, 77.1000],
  'BOM': [19.0896, 72.8656],
  'MNL': [14.5086, 121.0194],
  'SGN': [10.8188, 106.6520],
  'HAN': [21.2187, 105.8042],

  // Latin America
  'MEX': [19.4363, -99.0721],
  'CUN': [21.0365, -86.8771],
  'GDL': [20.5218, -103.3111],
  'SJO': [9.9939, -84.2088],
  'PTY': [9.0714, -79.3835],
  'BOG': [4.7016, -74.1469],
  'LIM': [-12.0219, -77.1143],
  'SCL': [-33.3930, -70.7858],
  'EZE': [-34.8222, -58.5358],
  'GIG': [-22.8099, -43.2505],
  'GRU': [-23.4356, -46.4731],

  // Caribbean
  'SJU': [18.4394, -66.0018],
  'NAS': [25.0390, -77.4662],
  'MBJ': [18.5037, -77.9134],
  'PUJ': [18.5674, -68.3634],
  'AUA': [12.5014, -70.0152],
  'CUR': [12.1889, -68.9598],
  'SXM': [18.0410, -63.1089],
  'STT': [18.3373, -64.9733],
  'BGI': [13.0746, -59.4925],

  // Canada
  'YYZ': [43.6777, -79.6248],
  'YVR': [49.1967, -123.1815],
  'YUL': [45.4706, -73.7408],
  'YYC': [51.1215, -114.0076],
  'YOW': [45.3225, -75.6692],
  'YWG': [49.9100, -97.2399],
  'YTZ': [43.6275, -79.3962],

  // Additional US
  'MDW': [41.7868, -87.7522],
  'PIT': [40.4915, -80.2329],
  'MSY': [29.9934, -90.2580],
  'LEX': [38.0365, -84.6059],
  'RNO': [39.4991, -119.7681],
  'LAS': [36.0840, -115.1537],
  'PVR': [20.6801, -105.2543],

  // Europe additional
  'KEF': [63.9850, -22.6056],
  'BIO': [43.3011, -2.9106],
  'KRK': [50.0777, 19.7848],
  'STN': [51.8850, 0.2350],

  // South America additional
  'AEP': [-34.5592, -58.4156],
  'FTE': [-50.2803, -72.0531],
  'LPB': [-16.5133, -68.1923],
  'MDE': [6.1645, -75.4231],
  'OAX': [16.9999, -96.7266],
  'PXM': [15.8769, -97.0891],
  'HAV': [22.9892, -82.4091],

  // Spain additional
  'EAS': [43.3565, -1.7906],  // San Sebastian

  // Philippines
  'ENI': [11.2296, 125.2593],  // El Nido (Lio)

  // Asia additional
  'KTM': [27.6966, 85.3591],
  'DMM': [26.4712, 49.7979],
  'PNH': [11.5466, 104.8441],
  'GOI': [15.3808, 73.8314],
  'USM': [9.5478, 100.0623],
  'HKT': [8.1132, 98.3169],
  'COK': [10.1520, 76.4019],
  'MCT': [23.5933, 58.2844],

  // Africa
  'JNB': [-26.1392, 28.2460],
  'CPT': [-33.9715, 18.6021],
  'CAI': [30.1219, 31.4056],
  'CMN': [33.3675, -7.5898],
  'ADD': [8.9779, 38.7993],
  'NBO': [-1.3192, 36.9278],
  'LOS': [6.5774, 3.3212],
}

async function fetchAllFlights() {
  let allResults = []
  let hasMore = true
  let nextCursor = undefined

  while (hasMore) {
    const body = { page_size: 100 }
    if (nextCursor) body.start_cursor = nextCursor

    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    allResults = allResults.concat(data.results)
    hasMore = data.has_more
    nextCursor = data.next_cursor

    console.log(`Fetched ${allResults.length} flights...`)
  }

  return allResults
}

function extractAirportCode(richText) {
  if (!richText || richText.length === 0) return null
  return richText[0].plain_text?.trim().toUpperCase()
}

function parseFlights(notionResults) {
  const flights = []
  const missingAirports = new Set()

  for (const page of notionResults) {
    const props = page.properties

    const from = extractAirportCode(props.From?.rich_text)
    const to = extractAirportCode(props.To?.rich_text)
    const date = props.Date?.date?.start
    const canceled = props.Canceled?.checkbox
    const name = props.Name?.title?.[0]?.plain_text

    if (!from || !to || canceled) continue

    const fromCoords = AIRPORT_COORDS[from]
    const toCoords = AIRPORT_COORDS[to]

    if (!fromCoords) missingAirports.add(from)
    if (!toCoords) missingAirports.add(to)

    if (fromCoords && toCoords) {
      flights.push({
        from,
        to,
        fromCoords,
        toCoords,
        date,
        name
      })
    }
  }

  if (missingAirports.size > 0) {
    console.log('\nMissing airport coordinates for:', Array.from(missingAirports).join(', '))
    console.log('Add these to AIRPORT_COORDS in the script\n')
  }

  return flights
}

function generateRoutes(flights) {
  // Aggregate routes (unique from-to pairs with count)
  const routeMap = new Map()

  for (const flight of flights) {
    const key = `${flight.from}-${flight.to}`
    const reverseKey = `${flight.to}-${flight.from}`

    // Normalize to always have the same direction
    const normalizedKey = key < reverseKey ? key : reverseKey

    if (routeMap.has(normalizedKey)) {
      routeMap.get(normalizedKey).count++
    } else {
      routeMap.set(normalizedKey, {
        from: flight.from,
        to: flight.to,
        fromCoords: flight.fromCoords,
        toCoords: flight.toCoords,
        count: 1
      })
    }
  }

  return Array.from(routeMap.values())
}

async function main() {
  if (!NOTION_API_KEY) {
    console.error('NOTION_API_KEY environment variable required')
    process.exit(1)
  }

  console.log('Fetching flights from Notion...')
  const notionResults = await fetchAllFlights()
  console.log(`Total flights in database: ${notionResults.length}`)

  const flights = parseFlights(notionResults)
  console.log(`Valid flights with coordinates: ${flights.length}`)

  const routes = generateRoutes(flights)
  console.log(`Unique routes: ${routes.length}`)

  const output = {
    totalFlights: flights.length,
    routes,
    generatedAt: new Date().toISOString()
  }

  const outputPath = path.join(__dirname, '../content/travel/flights.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`\nSaved to ${outputPath}`)

  // Show some stats
  const topRoutes = routes.sort((a, b) => b.count - a.count).slice(0, 5)
  console.log('\nTop routes:')
  topRoutes.forEach(r => console.log(`  ${r.from} - ${r.to}: ${r.count} flights`))
}

main().catch(console.error)
