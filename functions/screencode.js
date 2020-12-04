const chromium = require('chrome-aws-lambda');

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
        console.log(encodeURIComponent(code))
        await page.goto( host + `/test.html?code=${encodeURIComponent(code)}&lang=${lang}`,{ waitUntil: 'networkidle0' });

        // await page.evaluate( () => {

        //     const urlParams = new URLSearchParams(window.location.search);
        //     const code = urlParams.get('code');
        //     const lang = urlParams.get('lang');    

        //     var prettierCode = prettier.format( code, {
        //         parser: lang,
        //         plugins: prettierPlugins,
        //     });

        //     let codeEle = document.querySelector('pre code')
        //     codeEle.innerHTML =  prettierCode;
        //     hljs.highlightBlock(codeEle);   

        // })
        
        const elCode = await page.$('pre');
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
