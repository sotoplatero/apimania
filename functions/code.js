const chromium = require('chrome-aws-lambda');
const hljs = require('highlight.js');

// the browser path
const localChrome = process.env.PATH_CHROME;

exports.handler = async (event, context) => {

    const url = event.queryStringParameters.url 

    const browser = await chromium.puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: localChrome || await chromium.executablePath,
        headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:8888/blank.html', { waitUntil: 'networkidle2' });

    const highlightedCode = hljs.highlightAuto('<span>Hello World!</span>').value
    await page.setContent(highlightedCode);
  

    const screenshot = await page.screenshot({ encoding: 'base64' });
    await browser.close();
    
    return {
        statusCode: 200,
        headers: { 'Content-type': 'image/jpeg' },
        body: screenshot,   
        isBase64Encoded: true            
    }     



}
