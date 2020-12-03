const hljs = require("highlight.js/lib/core");
const prettier = require("prettier/standalone");
const parserBabel = require("prettier/parser-babel");
const parserHtml = require("prettier/parser-html");
const parserPostcss = require("prettier/parser-postcss");

exports.handler = async (event, context) => {

    let {lang, code, theme} = event.queryStringParameters;

    theme = theme || 'androidstudio'
    lang = lang || 'babel'
    lang = (lang==='javascript') ? 'babel' : lang;
    // try {
    
        let prettierCode = prettier.format(code, { 
            parser: lang, 
            plugins: [parserBabel, parserHtml, parserPostcss], 
        });

        hljs.registerLanguage(lang, require('highlight.js/lib/languages/xml'));        
        const highlightedCode = hljs.highlight(lang, prettierCode).value
        return {
            statusCode: 200,
            // headers: { 'Content-Type':'application/json'},            
            body: highlightedCode,   
        }     
   
    // } catch (e) {

    //     return {
    //         headers: { 'Content-Type':'application/json'},            
    //         statusCode: 500,
    //         body: JSON.stringify({error: e}),   
    //     }     
    
    // }
    

    

}
