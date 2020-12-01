const chromium = require('chrome-aws-lambda');
const hljs = require('highlight.js');
const prettier = require("prettier");
const Prism = require('prismjs');

// the browser path
const localChrome = process.env.PATH_CHROME;

exports.handler = async (event, context) => {

    const {language,code} = event.queryStringParameters;
    
    let htmlStart = `
        <!doctype html>
        <head>

        <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/themes/prism.min.css" rel="stylesheet" />
        </head>
        <body>`

    let htmlEnd = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.22.0/plugins/autoloader/prism-autoloader.min.js"></script>        

    </body></html>`

    const browser = await chromium.puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: localChrome || await chromium.executablePath,
        headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:8888/blank.html', { waitUntil: 'networkidle2' });

    let prettierCode = prettier.format(code, { parser: "babel" });

    // const highlightedCode = hljs.highlight('js', prettierCode).value
    const highlightedCode = Prism.highlight(prettierCode, Prism.languages.javascript, 'javascript');
    await page.setContent(htmlStart +'<pre style="padding: 1rem; display: inline-block;"><code>' +  highlightedCode + '</code></pre>' + htmlEnd);
    const elCode = await page.$('pre');
    const screenshot = await elCode.screenshot({ encoding: 'base64' });
    await browser.close();
    
    return {
        statusCode: 200,
        headers: { 'Content-type': 'image/jpeg' },
        body: screenshot,   
        isBase64Encoded: true            
    }     



}
