const chromium = require('chrome-aws-lambda');

const localChrome = process.env.PATH_CHROME;
var xss = require("xss");
var path = require("path")
const fs = require("fs");
var dot = require("dot");

exports.handler = async (event, context) => {

    let parameters = event.queryStringParameters;

    let qs = Object
        .keys( parameters )
        .map( k => k + '=' + xss(parameters[k]) )
        .join('&');

    if ( !parameters.text ) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Text not defined' })
    }

    // try {
        
        const browser = await chromium.puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: localChrome || await chromium.executablePath,
            headless: chromium.headless,
        });
        
        // Open page base
        const page = await browser.newPage();
        let tmpl = fs.readFileSync( path.resolve(__dirname, "./layout.html"), "utf8" );
        const view = dot.template(tmpl);
        await page.setContent( view(parameters) ) ;
      
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

    // } catch (e) {

    //     return {
    //         headers: { 'Content-Type':'application/json'},            
    //         statusCode: 500,
    //         body: JSON.stringify({error: e}),   
    //     }     

    // }
    

}
