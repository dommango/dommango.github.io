#!/usr/bin/env node

/**
 * Process travel CSV data into structured JSON with coordinates and continent info
 */

const fs = require('fs')
const path = require('path')

// Country metadata: coordinates and continent
const COUNTRY_DATA = {
  'USA': { continent: 'North America', coords: [37.0902, -95.7129] },
  'Philippines': { continent: 'Asia', coords: [12.8797, 121.774] },
  'Canada': { continent: 'North America', coords: [56.1304, -106.3468] },
  'Grenada': { continent: 'North America', coords: [12.1165, -61.6790] },
  'Sweden': { continent: 'Europe', coords: [60.1282, 18.6435] },
  'Estonia': { continent: 'Europe', coords: [58.5953, 25.0136] },
  'Russia': { continent: 'Europe', coords: [61.5240, 105.3188] },
  'Finland': { continent: 'Europe', coords: [61.9241, 25.7482] },
  'Dominican Republic': { continent: 'North America', coords: [18.7357, -70.1627] },
  'UK': { continent: 'Europe', coords: [55.3781, -3.4360] },
  'France': { continent: 'Europe', coords: [46.2276, 2.2137] },
  'Monaco': { continent: 'Europe', coords: [43.7384, 7.4246] },
  'Italy': { continent: 'Europe', coords: [41.8719, 12.5674] },
  'Vatican City': { continent: 'Europe', coords: [41.9029, 12.4534] },
  'Greece': { continent: 'Europe', coords: [39.0742, 21.8243] },
  'Austria': { continent: 'Europe', coords: [47.5162, 14.5501] },
  'Switzerland': { continent: 'Europe', coords: [46.8182, 8.2275] },
  'Czech Republic': { continent: 'Europe', coords: [49.8175, 15.4730] },
  'Germany': { continent: 'Europe', coords: [51.1657, 10.4515] },
  'Liechtenstein': { continent: 'Europe', coords: [47.1660, 9.5554] },
  'Netherlands': { continent: 'Europe', coords: [52.1326, 5.2913] },
  'Costa Rica': { continent: 'North America', coords: [9.7489, -83.7534] },
  'Jamaica': { continent: 'North America', coords: [18.1096, -77.2975] },
  'Colombia': { continent: 'South America', coords: [4.5709, -74.2973] },
  'Panama': { continent: 'North America', coords: [8.5380, -80.7821] },
  'Hong Kong': { continent: 'Asia', coords: [22.3193, 114.1694] },
  'Cambodia': { continent: 'Asia', coords: [12.5657, 104.9910] },
  'Bolivia': { continent: 'South America', coords: [-16.2902, -63.5887] },
  'Chile': { continent: 'South America', coords: [-35.6751, -71.5430] },
  'Peru': { continent: 'South America', coords: [-9.1900, -75.0152] },
  'Morocco': { continent: 'Africa', coords: [31.7917, -7.0926] },
  'Cuba': { continent: 'North America', coords: [21.5218, -77.7812] },
  'Japan': { continent: 'Asia', coords: [36.2048, 138.2529] },
  'China': { continent: 'Asia', coords: [35.8617, 104.1954] },
  'Vietnam': { continent: 'Asia', coords: [14.0583, 108.2772] },
  'Thailand': { continent: 'Asia', coords: [15.8700, 100.9925] },
  'Malaysia': { continent: 'Asia', coords: [4.2105, 101.9758] },
  'Singapore': { continent: 'Asia', coords: [1.3521, 103.8198] },
  'Turkey': { continent: 'Asia', coords: [38.9637, 35.2433] },
  'Hungary': { continent: 'Europe', coords: [47.1625, 19.5033] },
  'Denmark': { continent: 'Europe', coords: [56.2639, 9.5018] },
  'Poland': { continent: 'Europe', coords: [51.9194, 19.1451] },
  'Mexico': { continent: 'North America', coords: [23.6345, -102.5528] },
  'Nepal': { continent: 'Asia', coords: [28.3949, 84.1240] },
  'India': { continent: 'Asia', coords: [20.5937, 78.9629] },
  'South Korea': { continent: 'Asia', coords: [35.9078, 127.7669] },
  'Spain': { continent: 'Europe', coords: [40.4637, -3.7492] },
  'Portugal': { continent: 'Europe', coords: [39.3999, -8.2245] },
  'Taiwan': { continent: 'Asia', coords: [23.6978, 120.9605] },
  'Qatar': { continent: 'Asia', coords: [25.3548, 51.1839] },
  'Argentina': { continent: 'South America', coords: [38.4161, -63.6167] },
  'Brazil': { continent: 'South America', coords: [-14.2350, -51.9253] }
}

function parseYear(yearStr) {
  // Handle ranges like "1994-1996" - use first year
  if (yearStr.includes('-')) {
    return parseInt(yearStr.split('-')[0])
  }
  return parseInt(yearStr)
}

function stripEmoji(text) {
  // Remove emoji flags from country names
  return text.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '').trim()
}

function processCSV() {
  const csvPath = '/home/dom/personal/travel/Visited Countries 28b0a8ea33028073b310fa9efc870712.csv'
  let csvContent = fs.readFileSync(csvPath, 'utf-8')

  // Remove BOM if present
  csvContent = csvContent.replace(/^\uFEFF/, '')

  const lines = csvContent.split('\n').filter(line => line.trim())
  const countries = []

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Split by comma, expecting: order,country,year
    const parts = line.split(',')

    if (parts.length < 3) continue

    const order = parseInt(parts[0])
    // Country is the second part (may contain spaces and emojis)
    const countryWithEmoji = parts[1].trim()
    // Year is the third part (join rest in case there are commas in year)
    const yearStr = parts.slice(2).join(',').trim()

    // Extract country name without emoji
    const country = stripEmoji(countryWithEmoji)
    const year = parseYear(yearStr)

    // Get metadata
    const metadata = COUNTRY_DATA[country]
    if (!metadata) {
      console.warn(`Missing metadata for: ${country}`)
      continue
    }

    countries.push({
      id: country.toLowerCase().replace(/\s+/g, '-'),
      name: country,
      flag: countryWithEmoji.match(/[\u{1F1E6}-\u{1F1FF}]/gu)?.join('') || '',
      firstVisited: year,
      order,
      continent: metadata.continent,
      coordinates: metadata.coords
    })
  }

  // Calculate stats
  const continents = [...new Set(countries.map(c => c.continent))]
  const years = countries.map(c => c.firstVisited)
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)

  const stats = {
    totalCountries: countries.length,
    continents: continents.length,
    continentNames: continents.sort(),
    yearRange: `${minYear}-${maxYear}`,
    firstYear: minYear,
    lastYear: maxYear,
    countriesByContinent: continents.reduce((acc, continent) => {
      acc[continent] = countries.filter(c => c.continent === continent).length
      return acc
    }, {})
  }

  const output = {
    countries,
    stats
  }

  // Write to JSON file
  const outputPath = path.join(__dirname, '../content/travel/countries.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))

  console.log(`✅ Processed ${countries.length} countries`)
  console.log(`📊 Stats:`)
  console.log(`   - Continents: ${stats.continents} (${continents.join(', ')})`)
  console.log(`   - Years: ${stats.yearRange}`)
  console.log(`   - Countries by continent:`)
  Object.entries(stats.countriesByContinent).forEach(([continent, count]) => {
    console.log(`     ${continent}: ${count}`)
  })
  console.log(`📁 Output: ${outputPath}`)
}

processCSV()
