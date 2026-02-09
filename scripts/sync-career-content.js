const fs = require('fs')
const path = require('path')

const SOURCE = process.env.CAREER_DIR || '/home/dom/career'
const DEST = path.join(__dirname, '../content/career')

// Copy career directory to content/career for builds
if (fs.existsSync(SOURCE)) {
  try {
    fs.cpSync(SOURCE, DEST, { recursive: true })
    console.log('✓ Career content synced from', SOURCE)
  } catch (error) {
    console.error('✗ Failed to sync career content:', error.message)
    process.exit(1)
  }
} else {
  console.error('✗ Career directory not found at', SOURCE)
  process.exit(1)
}
