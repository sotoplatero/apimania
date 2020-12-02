const chromium = require('chrome-aws-lambda');
// const hljs = require('highlight.js');
const hljs = require("highlight.js/lib/core");  
const prettier = require("prettier");
// the browser path
const localChrome = process.env.PATH_CHROME;

exports.handler = async (event, context) => {

    let {lang, code, theme} = event.queryStringParameters;

    theme = theme || 'androidstudio'
    lang = lang || 'babel'
    lang = (lang==='javascript') ? 'babel' : lang;

    hljs.registerLanguage(lang, require('highlight.js/lib/languages/xml'));

    try {

        const browser = await chromium.puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: localChrome || await chromium.executablePath,
            headless: chromium.headless,
        });
        
        const page = await browser.newPage();
        const host = (process.env.ENV === 'local') ? 'http://localhost:8888' : 'https://apimania.netlify.com'
        await page.goto( host + '/blank.html', { waitUntil: 'networkidle2' });
    
        let prettierCode = prettier.format(code, { parser: lang});
    
        const highlightedCode = hljs.highlight(lang,prettierCode).value
        // const highlightedCode = Prism.highlight(prettierCode, Prism.languages.javascript, 'javascript');
    
        let content = `
            <!doctype html>
            <head>
                <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.18.5/styles/${theme}.min.css">
                <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.4.0/highlight.min.js"></script>
                <script>hljs.initHighlightingOnLoad();</script>
                <style>pre{display: inline-block;font-size:1.3rem;}</style>
            </head><body>
                <pre><code>${highlightedCode}</code></pre>
            </body></html>`;
    
        await page.setContent(content);
    
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
