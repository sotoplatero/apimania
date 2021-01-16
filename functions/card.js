const chromium = require('chrome-aws-lambda');
const { Octokit } = require("@octokit/rest");
var Twit = require('twit')

const localChrome = process.env.PATH_CHROME;

exports.handler = async (event, context) => {

    let {user, title, color, bg, image} = event.queryStringParameters;

    if ( !title ) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'title is not defined' })
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    var t = new Twit({
      consumer_key:         process.env.TWITTER_CONSUMER_KEY,
      consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
      access_token:         process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret:  process.env.TWITTER_TOKEN_SECRET,
    })

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
        const host = (process.env.ENV === 'local') ? 'http://localhost:8888' : 'https://apimania.netlify.app'
        await page.goto( host + `/card.html?user=${user}&title=${title}`,{ waitUntil: 'networkidle0' });
       
        const card = await page.$('#card');
        const screenshot = await card.screenshot({ encoding: 'base64' });
        await browser.close();

        return {
            statusCode: 200,
            headers: { 'Content-type': 'image/jpeg' },
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
