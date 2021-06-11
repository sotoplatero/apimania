const got = require('got')

exports.handler = async (event, context) => {

    let { url } = event.queryStringParameters;

    if ( !/[jpg|jpeg|png|gif]$/.test(url) ) {
        return {
            statusCode: 500,
            body: 'The requested resource is not an image',   
        }             
    }

    try {

        const referer = url.split('/').slice(0,3).join('/')
        const { body } = await got(url, {
            headers: { referer: referer },
            responseType: 'buffer'
        })

        return {
            statusCode: 200,
            body: body.toString('base64'),   
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
