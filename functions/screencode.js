const chromium = require('chrome-aws-lambda');
// const hljs = require('highlight.js');
const got = require('got');
// const hljs = require("highlight.js/lib/core");  
// const prettier = require("prettier");
// the browser path
const localChrome = process.env.PATH_CHROME;

exports.handler = async (event, context) => {

    let {lang, code, theme} = event.queryStringParameters;

    if ( !code || !lang ) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Code or Language not defined' })
    }

    theme = theme || 'androidstudio'
    lang = lang || 'babel'
    lang = (lang==='javascript') ? 'babel-flow' : lang;

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
        const host = (process.env.ENV === 'local') ? 'http://localhost:8888' : 'https://apimania.netlify.com'
        await page.goto( host + `/blank.html`,{ waitUntil: 'networkidle0' });

        await page.evaluate( ( code, lang ) => {
            code = code.replace(/\n/g,'')
            var prettierCode = prettier.format( code, {
                parser: lang,
                plugins: prettierPlugins,
            });
            let codeEle = document.querySelector('pre code')
            codeEle.innerText =  prettierCode;
            hljs.highlightBlock(codeEle);   

        }, code, lang)

        const elCode = await page.$('pre');
        const screenshot = await elCode.screenshot({ encoding: 'base64' });
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
