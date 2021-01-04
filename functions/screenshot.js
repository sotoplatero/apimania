
const chromium = require('chrome-aws-lambda');

// the browser path
const localChrome = process.env.PATH_CHROME;

exports.handler = async (event, context) => {

    let  { url, size = 'window' } = event.queryStringParameters

    if ( !url ) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Page URL not defined' })
    }

    const browser = await chromium.puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: localChrome || await chromium.executablePath,
        headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    const title = await page.title();

    let screenshot;
    console.log(size)
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
        screenshot = await el.screenshot({ encoding: 'base64' });

    }

    await browser.close();
    
    return {
        statusCode: 200,
        headers: { 'Content-type': 'image/jpeg' },
        body: screenshot,   
        isBase64Encoded: true            
    }     



}
