const chromium = require('chrome-aws-lambda');
const path = require('path');
// the browser path
const localChrome = process.env.PATH_CHROME;

exports.handler = async (event, context) => {

    // const pageToScreenshot = JSON.parse(event.body).pageToScreenshot;
    const pageToScreenshot = event.queryStringParameters.url 
    console.log(pageToScreenshot)
    if (!pageToScreenshot) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Page URL not defined' })
    }

    let path = await chromium.executablePath;
    const browser = await chromium.puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: localChrome || await chromium.executablePath,
        headless: chromium.headless,
    });
    
    const page = await browser.newPage();

    await page.goto(pageToScreenshot, { waitUntil: 'networkidle2' });

    const screenshot = await page.screenshot({ encoding: 'base64' });

    await browser.close();
  
    return {
        statusCode: 200,
        // body: JSON.stringify({ 
        //     message: `Complete screenshot of ${pageToScreenshot}`, 
        //     buffer: screenshot 
        // })
        headers: {
            'Content-type': 'image/jpeg'
          },
        body: screenshot,
        isBase64Encoded: true        
    }

}
