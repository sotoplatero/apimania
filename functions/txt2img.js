const chromium = require('chrome-aws-lambda');

const localChrome = process.env.PATH_CHROME;

exports.handler = async (event, context) => {

    let prameters = event.queryStringParameters;

    let qs = Object
        .keys( prameters )
        .map( k => k + '=' + prameters[k] )
        .join('&');

    console.log(qs)
    if ( !prameters.text ) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Code or Language not defined' })
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
        const host = (process.env.ENV === 'local') ? 'http://localhost:8888' : 'https://apimania.netlify.app'
        await page.goto( host + `/txt2img.html?${qs}`,{ waitUntil: 'networkidle0' });

      
        const elCode = await page.$('#txt2img');
        const screenshot = await elCode.screenshot({ encoding: 'base64' });
        await browser.close();

        return {
            statusCode: 200,
            headers: { 'Content-type': 'image/jpeg' },
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
