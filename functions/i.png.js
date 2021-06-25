var Konva = require('konva-node')

exports.handler = async (event) => {

    let {
        t,
        w = 300,
        h = 300, 
        bg = '#000',
        color = '#fff',
    } = event.queryStringParameters

    const padding = 30
    w = parseInt(w)
    h = parseInt(h)

    var stage = new Konva.Stage({ width: w, height: h });
    var layer = new Konva.Layer({listening: false});
    var bgRect = new Konva.Rect({ fill: bg, width: w, height: h });

    let fontSize = 12
    var textbox = new Konva.Text({
        x: padding,
        y: padding,
        text: t,
        fontSize: --fontSize,
        fill: color,
        width: w - ( padding * 2 ),
        padding: padding/2,
        align: 'center',
    });  

    do {
        textbox.fontSize( ++fontSize )
    } while ( textbox.height() < ( h - (padding * 2)) )

    textbox.fontSize( --fontSize )
    const newY = ( h - textbox.height() ) / 2
    textbox.y( newY )

    layer.add(bgRect);
    layer.add(textbox);
    stage.add(layer);

    const canvas = stage.toCanvas()
    // const image = stage.toDataURL({mimeType: 'image/png'})
    const image = canvas.toBuffer('image/png')
    // console.log(image)
    return {
        headers: { 
            'Content-Type':'image/png',
            "Cache-Control": "public, immutable, no-transform, s-maxage=31536000, max-age=31536000", 
        },    
        statusCode: 200,        
        body: image.toString('base64'),  
        isBase64Encoded: true, 
    }       

}
