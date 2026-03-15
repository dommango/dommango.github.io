#!/usr/bin/env node

/**
 * Fetches analytics data from GoatCounter API
 * Run with: GOATCOUNTER_API_KEY=xxx GOATCOUNTER_SITE=xxx node scripts/fetch-analytics.js
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '../public/data/analytics.json')

const API_KEY = process.env.GOATCOUNTER_API_KEY
const SITE = process.env.GOATCOUNTER_SITE

async function fetchGoatCounter(endpoint) {
  const url = `https://${SITE}.goatcounter.com/api/v0${endpoint}`
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  })

  if (!res.ok) {
    throw new Error(`GoatCounter API error: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

async function main() {
  if (!API_KEY || !SITE) {
    console.log('GOATCOUNTER_API_KEY and GOATCOUNTER_SITE not set, creating placeholder data')
    const placeholder = {
      lastUpdated: new Date().toISOString(),
      period: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
      summary: {
        pageViews: 0,
        uniqueVisitors: 0,
        bounceRate: 0,
      },
      topPages: [],
      trafficSources: [],
      dailyStats: [],
    }

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(OUTPUT_PATH, JSON.stringify(placeholder, null, 2))
    console.log('Placeholder analytics data written to', OUTPUT_PATH)
    return
  }

  console.log('Fetching analytics from GoatCounter...')

  const endDate = new Date()
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const dateRange = `start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`

  // Fetch stats
  const [stats, pages] = await Promise.all([
    fetchGoatCounter(`/stats/total?${dateRange}`),
    fetchGoatCounter(`/stats/hits?${dateRange}&limit=10`),
  ])

  // Transform to our format
  const data = {
    lastUpdated: new Date().toISOString(),
    period: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    },
    summary: {
      pageViews: stats.total || 0,
      uniqueVisitors: stats.total_unique || 0,
      bounceRate: 0,
    },
    topPages: (pages.hits || []).map(hit => ({
      path: hit.path,
      views: hit.count,
      visitors: hit.count_unique || hit.count,
    })),
    trafficSources: [],
    dailyStats: [],
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2))
  console.log('Analytics data written to', OUTPUT_PATH)
}

main().catch(err => {
  console.error('Failed to fetch analytics:', err.message)
  process.exit(1)
})
