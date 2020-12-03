const hljs = require('highlight.js');
const prettier = require("prettier");

exports.handler = async (event, context) => {

    let {lang, code, theme} = event.queryStringParameters;

    theme = theme || 'androidstudio'
    lang = lang || 'babel'
    lang = (lang==='javascript') ? 'babel' : lang;
    try {
    
        let prettierCode = prettier.format(code, { parser: lang });
        const highlightedCode = hljs.highlightAuto(prettierCode).value
        return {
            statusCode: 200,
            // headers: { 'Content-Type':'application/json'},            
            body: highlightedCode,   
        }     
   
    } catch (e) {

        return {
            headers: { 'Content-Type':'application/json'},            
            statusCode: 500,
            body: JSON.stringify({error: e}),   
        }     
    
    }
    

    

}
