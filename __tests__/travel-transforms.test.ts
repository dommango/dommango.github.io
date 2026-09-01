import { describe, it, expect } from 'vitest'
import { buildContinentBars, countriesUpTo, nextPlayState, yearBounds, type Country } from '../lib/content/travel'

const country = (overrides: Partial<Country> = {}): Country => ({
  id: 'x',
  name: 'X',
  flag: '🏳️',
  firstVisited: 2000,
  order: 0,
  continent: 'Europe',
  coordinates: [0, 0],
  ...overrides,
})

const FIXTURE: Country[] = [
  country({ id: 'a', name: 'A', continent: 'Europe', firstVisited: 1986, order: 1 }),
  country({ id: 'b', name: 'B', continent: 'Europe', firstVisited: 1990, order: 2 }),
  country({ id: 'c', name: 'C', continent: 'Asia', firstVisited: 1995, order: 3 }),
  country({ id: 'd', name: 'D', continent: 'Asia', firstVisited: 2010, order: 4 }),
  country({ id: 'e', name: 'E', continent: 'Americas', firstVisited: 2020, order: 5 }),
]

describe('countriesUpTo', () => {
  it('returns all countries when year is omitted', () => {
    expect(countriesUpTo(FIXTURE)).toEqual(FIXTURE)
  })

  it('filters to countries first visited on or before year', () => {
    expect(countriesUpTo(FIXTURE, 1995).map((c) => c.id)).toEqual(['a', 'b', 'c'])
  })

  it('returns [] for a year before the first trip', () => {
    expect(countriesUpTo(FIXTURE, 1980)).toEqual([])
  })
})

describe('buildContinentBars', () => {
  it('sorts bars by count descending', () => {
    const bars = buildContinentBars(FIXTURE)
    expect(bars.map((b) => b.name)).toEqual(['Europe', 'Asia', 'Americas'])
  })

  it('scales pct relative to the largest continent', () => {
    const bars = buildContinentBars(FIXTURE)
    const europe = bars.find((b) => b.name === 'Europe')!
    const americas = bars.find((b) => b.name === 'Americas')!
    expect(europe.pct).toBe(100)
    expect(americas.pct).toBe(50)
  })

  it('excludes countries first visited after year', () => {
    const bars = buildContinentBars(FIXTURE, 1995)
    expect(bars).toEqual([
      { name: 'Europe', count: 2, pct: 100 },
      { name: 'Asia', count: 1, pct: 50 },
    ])
  })

  it('returns [] for a year before the first trip', () => {
    expect(buildContinentBars(FIXTURE, 1980)).toEqual([])
  })
})

describe('yearBounds', () => {
  it('returns the min and max firstVisited years', () => {
    expect(yearBounds(FIXTURE)).toEqual([1986, 2020])
  })
})

describe('nextPlayState', () => {
  const min = 1986
  const max = 2020

  it('stops without touching the year', () => {
    expect(nextPlayState({ year: 2000, playing: true }, min, max)).toEqual({
      year: 2000,
      playing: false,
    })
  })

  it('starts from the current year when not at the end', () => {
    expect(nextPlayState({ year: 2000, playing: false }, min, max)).toEqual({
      year: 2000,
      playing: true,
    })
  })

  it('restarts at min — not min - 1 — when starting from max', () => {
    // min - 1 sits outside a <input type=range min={min}> and gets clamped
    // by the browser, desyncing the rendered label from the slider thumb.
    expect(nextPlayState({ year: max, playing: false }, min, max)).toEqual({
      year: min,
      playing: true,
    })
  })
})
