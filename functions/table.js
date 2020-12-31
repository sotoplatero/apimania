const tabletojson = require('tabletojson').Tabletojson;
const got = require('got');
const cheerio = require("cheerio");

exports.handler = async (event, context) => {

    let { url, sel } = event.queryStringParameters;
    try {

        const table = await tabletojson.convertUrl(url, (table) => table );
        
        return {
            statusCode: 200,
            headers: { 'Content-Type':'application/json'},            
            body: JSON.stringify(table),   
        }     

    } catch (e) {
        return {
            headers: { 'Content-Type':'application/json'},            
            statusCode: 500,
            body: JSON.stringify(e),   
        }     
    
    }
    

    

}
