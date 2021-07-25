var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
/* var infobox = document.getElementById('infobox'); */

var popup = new ol.Overlay({
    element: container
});
map.addOverlay(popup);

/* var info = new ol.Overlay({
    element: infobox
});
map.addOverlay(info); */

/**
 * Lädt eine XML-basierte Datei von einer URL
 * 
 * @param {String} url URL zur Datei
 * @param {Function} callback Wird aufgerufen sobald die Datei erfolgreich geladen wurde. Der Inhalt der Datei wird als Funktionsparameter übergeben.
 */
function load(url, callback) {
    let req = new XMLHttpRequest();
    req.open('GET', url);

    try {
        req.responseType = 'document';
    } catch (ex) {}

    req.onload = function() {
        callback(req.responseXML);
    };

    req.send();
}

function nextCenter(clickPos) {
    let next = undefined;
    let minDist = 999999999;

    console.log("nextCenter()");
    console.log(clickPos);
    
    for (let i = 0; i < impfzentren.length; i++) {
        let dx = clickPos[0] - impfzentren[i][0];
        let dy = clickPos[1] - impfzentren[i][1];
        let distI = Math.sqrt(dx * dx + dy * dy);

        for (let j = 0; j < testzentren.length; j++) {
            let dx = clickPos[0] - testzentren[j][0];
            let dy = clickPos[1] - testzentren[j][1];
            let distT = Math.sqrt(dx * dx + dy * dy);

            if (distI < minDist || distT < minDist) {
                if(distI < distT){
                    next = impfzentren[i]
                    minDist = distI;
                }
                else if(distT < distI){
                    next = testzentren[j];
                    minDist = distT;
                }
                else{
                    console.log("fehler");
                }
            }    
        }
    }

    console.log(next);

    return next;
}

map.on('click', function(e) {
    // Abbrechen, wenn an der geklickten Stelle kein Marker ist
    if (!map.hasFeatureAtPixel(e.pixel)) return;

  
    let p = nextCenter(ol.proj.toLonLat(e.coordinate));
    popup.setPosition(ol.proj.fromLonLat(p));

    if (typeof XSLTProcessor == 'undefined') {
        console.error('XSLTProcessor not found!\nCannot perform XSL-Transformation')
        return;
    }

    load('http://localhost:8081/incidence?long=' + p[0] + '&lat=' + p[1], function(xml) {
        load('http://localhost:8081/xml/inzidenz.xsl', function(xsl) {
            let processor = new XSLTProcessor();
            processor.importStylesheet(xsl);

            let fragment = processor.transformToFragment(xml, document);

            content.innerHTML = '';
            content.appendChild(fragment);
        });
    });
});

closer.onclick = function() {
    popup.setPosition(undefined);
    closer.blur();
    return false;
};