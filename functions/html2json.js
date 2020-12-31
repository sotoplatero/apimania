var {parse} = require('himalaya')
var convert = require('xml-js');
const got = require('got');

exports.handler = async (event, context) => {

    let { url, sel } = event.queryStringParameters;
    try {
        const html = await got(url).then( res => res.body)
        const json = parse(html)

        return {
            statusCode: 200,
            headers: { 'Content-Type':'application/json'},            
            body: JSON.stringify(json),   
        }     

    } catch (e) {
        return {
            headers: { 'Content-Type':'application/json'},            
            statusCode: 500,
            body: JSON.stringify(e),   
        }     
    
    }
    

    

}
