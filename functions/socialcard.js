const chromium = require('chrome-aws-lambda');
const localChrome = process.env.PATH_CHROME;
var views = require("dot").process({ path: "../views"});
var xss = require("xss");

exports.handler = async (event, context) => {

    let {url} = event.queryStringParameters;

    if ( !prameters.url ) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Text not defined' })
    }

    try {
        
        const browser = await chromium.puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: localChrome || await chromium.executablePath,
            headless: chromium.headless,
        });
        
        // Open page base
        const page = await browser.newPage();
        await page.goto( host + `/txt2img.html?${qs}`,{ waitUntil: 'networkidle0' });

      
        const elCode = await page.$('#txt2img');
        const screenshot = await elCode.screenshot({ encoding: 'base64' });
        await browser.close();

        return {
            statusCode: 200,
            headers: { 
            	'Content-type': 'image/jpeg', 
            	'Cache-Control': 'public, immutable, no-transform, s-maxage=31536000, max-age=31536000' 
            },
            body: screenshot,   
            isBase64Encoded: true            
        }     

    } catch (e) {

        return {
            headers: { 'Content-Type':'application/json'},            
            statusCode: 500,
            body: JSON.stringify({error: e}),   
        }     

    }
    

}
