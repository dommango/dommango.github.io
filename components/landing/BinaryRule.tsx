// BinaryRule — the signature 1/0 motif used as a section divider.
// Generates a deterministic-looking row of binary triplets.

interface BinaryRuleProps {
  seed?: number
  accent?: boolean
  density?: number
}

export function BinaryRule({ seed = 1, accent = false, density = 14 }: BinaryRuleProps) {
  // Pseudo-random but stable per seed so server and client render identically.
  const rnd = (i: number) => {
    const x = Math.sin((seed + 1) * (i + 1) * 13.37) * 10000
    return x - Math.floor(x)
  }

  const groups: string[] = []
  for (let g = 0; g < density; g++) {
    let s = ''
    for (let b = 0; b < 7; b++) s += rnd(g * 7 + b) > 0.5 ? '1' : '0'
    groups.push(s.split('').join(' '))
  }

  return (
    <div className={`binary-rule${accent ? ' is-accent' : ''}`} aria-hidden="true">
      {groups.join('   ')}
    </div>
  )
}
