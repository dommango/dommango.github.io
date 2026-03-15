#!/usr/bin/env node

/**
 * Fetches uptime data from UptimeRobot API
 * Run with: UPTIMEROBOT_API_KEY=xxx node scripts/fetch-uptime.js
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '../public/data/uptime.json')

const API_KEY = process.env.UPTIMEROBOT_API_KEY

async function fetchUptimeRobot() {
  const res = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: API_KEY,
      format: 'json',
      logs: 1,
      log_types: '1-2',
      logs_limit: 10,
      response_times: 1,
      response_times_limit: 1,
      custom_uptime_ratios: '30',
    }),
  })

  if (!res.ok) {
    throw new Error(`UptimeRobot API error: ${res.status}`)
  }

  return res.json()
}

function mapStatus(status) {
  switch (status) {
    case 0: return 'paused'
    case 1: return 'unknown'
    case 2: return 'up'
    case 8: return 'degraded'
    case 9: return 'down'
    default: return 'unknown'
  }
}

async function main() {
  if (!API_KEY) {
    console.log('UPTIMEROBOT_API_KEY not set, creating placeholder data')
    const placeholder = {
      lastUpdated: new Date().toISOString(),
      monitors: [],
      incidents: [],
    }

    mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
    writeFileSync(OUTPUT_PATH, JSON.stringify(placeholder, null, 2))
    console.log('Placeholder uptime data written to', OUTPUT_PATH)
    return
  }

  console.log('Fetching uptime data from UptimeRobot...')

  const result = await fetchUptimeRobot()

  if (result.stat !== 'ok') {
    throw new Error(`UptimeRobot error: ${result.error?.message || 'Unknown error'}`)
  }

  const monitors = (result.monitors || []).map(monitor => ({
    name: monitor.friendly_name,
    url: monitor.url,
    status: mapStatus(monitor.status),
    uptimePercentage: parseFloat(monitor.custom_uptime_ratio) || 100,
    avgResponseTime: monitor.response_times?.[0]?.value || 0,
    lastCheckTime: new Date(monitor.response_times?.[0]?.datetime * 1000 || Date.now()).toISOString(),
  }))

  // Extract incidents from logs
  const incidents = []
  for (const monitor of result.monitors || []) {
    for (const log of monitor.logs || []) {
      if (log.type === 1) { // down
        incidents.push({
          startTime: new Date(log.datetime * 1000).toISOString(),
          duration: Math.round(log.duration / 60),
          type: 'down',
        })
      }
    }
  }

  const data = {
    lastUpdated: new Date().toISOString(),
    monitors,
    incidents: incidents.slice(0, 10),
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2))
  console.log('Uptime data written to', OUTPUT_PATH)
}

main().catch(err => {
  console.error('Failed to fetch uptime data:', err.message)
  process.exit(1)
})
