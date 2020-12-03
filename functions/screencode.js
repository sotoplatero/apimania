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
    lang = (lang==='javascript') ? 'babel' : lang;
    console.log(code)
    // hljs.registerLanguage(lang, require('highlight.js/lib/languages/xml'));

    // try {

        const host = (process.env.ENV === 'local') ? 'http://localhost:8888' : 'https://apimania.netlify.com'
        // const response = await got( host + `/.netlify/functions/highlight?code=${code}&lang=${lang}`)
        // const highlightedCode = response.body
        // console.log(response.body)

        const browser = await chromium.puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: localChrome || await chromium.executablePath,
            headless: chromium.headless,
        });
        
        const page = await browser.newPage();
        await page.goto( host + `/blank.html?code=${code}$lang=${lang}`, { waitUntil: 'networkidle0' });
        
        let content = `
            <!doctype html>
            <head>
            <meta http-equiv="content-type" content="text/html; charset=UTF-8">
            <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.5/styles/${theme}.min.css">
            <script src="https://unpkg.com/prettier@2.2.1/standalone.js"></script>
            <script src="https://unpkg.com/prettier@2.2.1/parser-babel.js"></script>
            <script src="https://unpkg.com/prettier@2.2.1/parser-html.js"></script>
            <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.4.0/highlight.min.js"></script>
            <style>pre{display: inline-block;font-size:1.3rem;}</style>
            </head><body>
            <pre><code></code></pre>
            <script>
                var prettierCode = prettier.format( "${code}", {
                    parser: "${lang}",
                    plugins: prettierPlugins,
                });
                document.querySelector('code').innerHTML = prettierCode;
                hljs.initHighlightingOnLoad();
            </script>
            </body></html>
        `;
        
        // page.goto(`data:text/html,${content}`);
        // await page.setContent(content);
        // page.waitForNavigation()
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
