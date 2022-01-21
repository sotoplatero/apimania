
const chromium = require('chrome-aws-lambda');

// the browser path
const localChrome = process.env.PATH_CHROME;
const minimal_args = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];
exports.handler = async (event, context) => {

    let  { url, size = 'window' } = event.queryStringParameters

    if ( !url ) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Page URL not defined' })
    }

    const browser = await chromium.puppeteer.launch({
        // ignoreDefaultArgs: ['--disable-extensions'],
        args: minimal_args,
        // defaultViewport: chromium.defaultViewport,
        executablePath: localChrome || await chromium.executablePath,
        // headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const title = await page.title();

    let screenshot;
    if ( /window|full/.test(size) ) {

        screenshot = await page.screenshot({ 
            encoding: 'base64',
            fullPage: (size === 'full')
        });

    } else {

        const el = await page.$(size);
        if ( !el ) return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Element by selector not exist' })
        }        
        screenshot = await el.screenshot({ type: 'jpeg', quality: 75, });

    }

    await browser.close();
    
    return {
        statusCode: 200,
        headers: { 
            'Content-type': 'image/jpeg',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000',
        },
        body: screenshot.toString("base64"),   
        isBase64Encoded: true,           
    }     



}
