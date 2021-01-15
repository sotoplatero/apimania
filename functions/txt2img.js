const chromium = require('chrome-aws-lambda');

const localChrome = process.env.PATH_CHROME;
var xss = require("xss");
var path = require("path")

exports.handler = async (event, context) => {

    let prameters = event.queryStringParameters;

    let qs = Object
        .keys( prameters )
        .map( k => k + '=' + xss(prameters[k]) )
        .join('&');

    if ( !prameters.text ) return {
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
        // const resolved = path.resolve(__dirname, `./${theme}.html`)      
        await page.goto( path.resolve( __dirname, "../public/txt2img.html?" + qs ), { waitUntil: 'networkidle0' });

      
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
