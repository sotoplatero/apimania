const createBrowserless = require('browserless')
const chromium = require('chrome-aws-lambda')
const localChrome = process.env.PATH_CHROME;

exports.handler = async (event, context) => {

    let  { url, size = 'full' } = event.queryStringParameters

	const browserlessFactory = createBrowserless({
		executablePath: localChrome || await chromium.executablePath,
	})
	const browserless = await browserlessFactory.createContext()
	let buffer
	// Perform the action you want, e.g., getting the HTML markup
    if ( /window|full/.test(size) ) {

		buffer = await browserless.screenshot(url,{ 
			type: 'jpeg',
			quality: 75,
			// waitUntil: 'networkidle0',
		})	
   	
    } else {

		const page = await browserless.page()
		await browserless.goto(page, { 
			url, 
			waitUntil: 'networkidle0',
		})
		const el = await page.$(size);
	    if ( !el ) return {
	        statusCode: 400,
	        body: JSON.stringify({ message: 'Element by selector not exist' })
	    }        
	    buffer = await el.screenshot({ type: 'jpeg', quality: 75, });

    }

	await browserlessFactory.close()

    return {
        statusCode: 200,
        headers: { 'Content-type': 'image/jpeg' },
	    body: buffer.toString("base64"),
	    isBase64Encoded: true,        
    }   
	
}