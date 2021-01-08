const chromium = require('chrome-aws-lambda');
const localChrome = process.env.PATH_CHROME;
const got = require("got");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require('path');
const URL = require('url');
var dot = require("dot");

const currentDir = process.env.LAMBDA_TASK_ROOT;

exports.handler = async (event, context) => {

    let {url} = event.queryStringParameters;
    
    if ( !url ) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'url parameter not defined' })
    }

    const response = await got( url );
    const $ = cheerio.load(response.body);
    const title = $('title').text();
    const description = $('meta[name="description"],meta[property="description"],meta[property="og:description"],meta[name="twitter:description"]').attr('content')
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
        await page.setViewport({ width: 1536, height: 768 });

        let tmpl = fs.readFileSync( path.join( currentDir, '../views/socialcard.html'),"utf8");
        const view = dot.template(tmpl);

        await page.setContent( view({ 
            title: title, 
            subtitle: description, 
            domain: URL.parse(url).hostname 
        })) ;

      
        const card = await page.$('body');
        const screenshot = await card.screenshot({ encoding: 'base64' });
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
