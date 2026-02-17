const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const logoDir = path.join(__dirname, '../public/logos')

const logos = [
  { src: 'Citi-logo.png', dest: 'citi.png', company: 'Citi' },
  { src: 'MorganStanley-logo.png', dest: 'morgan-stanley.png', company: 'Morgan Stanley' },
  { src: 'HuronTreliant-logo.jpg', dest: 'treliant.png', company: 'Treliant' },
  { src: 'PwCStrategy&-logo.jpg', dest: 'pwc.png', company: 'PwC' },
  { src: 'BNPP_LOGO_FR_H_DIGI_RVB.png', dest: 'bnp-paribas.png', company: 'BNP Paribas' },
  { src: 'the_daily_targum_official_logo.jpg', dest: 'targum.png', company: 'Targum' },
  { src: 'Viacom.png', dest: 'viacom.png', company: 'Viacom' },
  { src: 'BearStearns-logo.png', dest: 'bear-stearns.png', company: 'Bear Stearns' }
]

async function processLogos() {
  for (const logo of logos) {
    const srcPath = path.join(logoDir, logo.src)
    const destPath = path.join(logoDir, logo.dest)

    if (!fs.existsSync(srcPath)) {
      console.error(`✗ ${logo.company}: Source file not found (${logo.src})`)
      continue
    }

    try {
      await sharp(srcPath)
        .resize(64, 64, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .png({ quality: 90 })
        .toFile(destPath)

      console.log(`✓ ${logo.company}: Processed ${logo.src} → ${logo.dest}`)
    } catch (error) {
      console.error(`✗ ${logo.company}: Failed to process - ${error.message}`)
    }
  }

  // Remove original source files and SVG placeholders
  console.log('\nCleaning up original files...')
  const filesToRemove = [
    'Citi-logo.png',
    'MorganStanley-logo.png',
    'HuronTreliant-logo.jpg',
    'PwCStrategy&-logo.jpg',
    'BNPP_LOGO_FR_H_DIGI_RVB.png',
    'the_daily_targum_official_logo.jpg',
    'Viacom.png',
    'BearStearns-logo.png',
    'citi.svg',
    'morgan-stanley.svg',
    'treliant.svg',
    'strategy-and.svg',
    'pwc.svg',
    'bnp-paribas.svg',
    'targum.svg',
    'viacom.svg',
    'bear-stearns.svg'
  ]

  for (const file of filesToRemove) {
    const filePath = path.join(logoDir, file)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`  Removed: ${file}`)
    }
  }

  console.log('\n✓ Logo processing complete!')
}

processLogos().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
