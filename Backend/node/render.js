const puppeteer = require('puppeteer');

async function readStdin() {
  const chunks = [];
  return await new Promise((resolve, reject) => {
    process.stdin.on('data', (c) => chunks.push(c));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', reject);
  });
}

async function main() {
  const html = await readStdin();

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.emulateMediaType('screen');

    await page.setContent(html, { waitUntil: 'load' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
    });

    process.stdout.write(pdf);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {

  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});