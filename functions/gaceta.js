const got = require('got');
const cheerio = require('cheerio');

exports.handler = async (event, context) => {

    // let { url, sel } = event.queryStringParameters;
    try {
        const html = await got('https://www.gacetaoficial.gob.cu/es').then( res => res.body)
        const $ = cheerio.load(html);
        console.log($('.views-field-field-numero-de-gaceta ').text())
        const data = {
            type: $('.views-field-field-tipo-edicion-gaceta .field-content').text(),
            date: $('.views-field-field-fecha-gaceta .field-content span').attr('content'),
            number: $('.views-field-field-numero-de-gaceta > .field-content').first().text(),
            url: $('.views-field-field-fichero-gaceta .field-content a').attr('href'),
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type':'application/json'},            
            body: JSON.stringify(data),   
        }     

    } catch (e) {
        return {
            headers: { 'Content-Type':'application/json'},            
            statusCode: 500,
            body: JSON.stringify(e),   
        }     
    
    }
    

    

}
