#!/usr/bin/env node

/**
 * Fetches performance data from PageSpeed Insights API
 * Run with: node scripts/fetch-performance.js
 *
 * No API key required for basic usage (rate limited)
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '../public/data/performance.json')

// Pages to test - update SITE_URL with your actual domain
const SITE_URL = process.env.SITE_URL || 'https://example.com'
const PAGES_TO_TEST = [
  '/',
  '/blog',
  '/career',
]

async function fetchPageSpeedInsights(url) {
  const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed')
  apiUrl.searchParams.set('url', url)
  apiUrl.searchParams.set('category', 'performance')
  apiUrl.searchParams.set('category', 'accessibility')
  apiUrl.searchParams.set('category', 'best-practices')
  apiUrl.searchParams.set('category', 'seo')
  apiUrl.searchParams.set('strategy', 'mobile')

  console.log(`  Analyzing ${url}...`)

  const res = await fetch(apiUrl.toString())

  if (!res.ok) {
    throw new Error(`PageSpeed API error: ${res.status}`)
  }

  return res.json()
}

function extractMetrics(result) {
  const lighthouse = result.lighthouseResult
  const categories = lighthouse.categories
  const audits = lighthouse.audits

  return {
    scores: {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
    },
    coreWebVitals: {
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      fid: audits['max-potential-fid']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      fcp: audits['first-contentful-paint']?.numericValue || 0,
      ttfb: audits['server-response-time']?.numericValue || 0,
    },
  }
}

async function main() {
  if (SITE_URL === 'https://example.com') {
    console.log('SITE_URL not set, creating placeholder data')
    const placeholder = {
      lastUpdated: new Date().toISOString(),
      pages: [],
      history: [],
    }

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(OUTPUT_PATH, JSON.stringify(placeholder, null, 2))
    console.log('Placeholder performance data written to', OUTPUT_PATH)
    return
  }

  console.log('Fetching performance metrics from PageSpeed Insights...')

  const pages = []

  for (const path of PAGES_TO_TEST) {
    try {
      const url = `${SITE_URL}${path}`
      const result = await fetchPageSpeedInsights(url)
      const metrics = extractMetrics(result)

      pages.push({
        url,
        path,
        ...metrics,
      })

      // Rate limiting - wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (err) {
      console.error(`  Failed to analyze ${path}:`, err.message)
    }
  }

  // Load existing history
  let history = []
  if (existsSync(OUTPUT_PATH)) {
    try {
      const existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'))
      history = existing.history || []
    } catch {
      // ignore
    }
  }

  // Add today's average to history
  if (pages.length > 0) {
    const avgScore = Math.round(
      pages.reduce((sum, p) => sum + p.scores.performance, 0) / pages.length
    )
    history.push({
      date: new Date().toISOString().split('T')[0],
      avgPerformanceScore: avgScore,
    })
    // Keep last 30 days
    history = history.slice(-30)
  }

  const data = {
    lastUpdated: new Date().toISOString(),
    pages,
    history,
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2))
  console.log('Performance data written to', OUTPUT_PATH)
}

main().catch(err => {
  console.error('Failed to fetch performance data:', err.message)
  process.exit(1)
})
