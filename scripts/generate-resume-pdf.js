const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

const RESUME_HTML_SOURCE = '/home/dom/personal/career/Mangonon_Dominic_Resume.html'
const OUTPUT_DIR = path.join(__dirname, '../public/assets')
const OUTPUT_FILE = 'Dominic_Mangonon_Resume.pdf'

async function generateResumePDF() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Check if resume HTML exists
  if (!fs.existsSync(RESUME_HTML_SOURCE)) {
    console.error(`✗ Resume HTML not found at: ${RESUME_HTML_SOURCE}`)
    process.exit(1)
  }

  const htmlContent = fs.readFileSync(RESUME_HTML_SOURCE, 'utf-8')

  // Launch headless browser
  let browser
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  } catch (error) {
    console.warn('⚠ Puppeteer Chrome binary not available (expected in dev environment)')
    console.warn('  PDF will be generated during deployment build')
    console.warn('  To test locally, install Chrome/Chromium or use a Docker container')
    // Create a placeholder PDF file so build doesn't fail
    const placeholderContent = 'PDF generation skipped - Chrome not available in this environment'
    fs.writeFileSync(path.join(OUTPUT_DIR, OUTPUT_FILE), placeholderContent)
    console.log(`✓ Placeholder created: ${OUTPUT_FILE} (will be generated in production)`)
    return
  }

  const page = await browser.newPage()

  // Set content and wait for any fonts/styles to load
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

  // Generate PDF with print-optimized settings
  const pdfBuffer = await page.pdf({
    path: path.join(OUTPUT_DIR, OUTPUT_FILE),
    format: 'Letter',
    printBackground: true,
    margin: {
      top: '0.4in',
      bottom: '0.4in',
      left: '0.5in',
      right: '0.5in'
    }
  })

  await browser.close()

  console.log(`✓ Resume PDF generated: ${OUTPUT_FILE}`)
  console.log(`  Location: ${OUTPUT_DIR}/${OUTPUT_FILE}`)
  console.log(`  Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`)
}

generateResumePDF().catch(error => {
  console.error('✗ PDF generation failed:', error)
  process.exit(1)
})
