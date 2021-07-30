var content = document.getElementById('popup-content');

var popup = new ol.Overlay({
    element: document.getElementById('popup')
});
map.addOverlay(popup);

function nextCenterHelper(clickPos, arr) {
    let next = undefined;
    let minDist = 999999999;

    for(let i = 0; i < arr.length; i++) {
        let dx = clickPos[0] - arr[i][0];
        let dy = clickPos[1] - arr[i][1];
        let dist = Math.sqrt(dx * dx + dy * dy);

        if(dist < minDist) {
            next = arr[i];
            minDist = dist;
        }
    }

    return { minDist: minDist, next: next };
}

function nextCenter(clickPos) {
    let impf = nextCenterHelper(clickPos, impfzentren);
    let test = nextCenterHelper(clickPos, testzentren);

    if(impf.minDist < test.minDist) {
        return impf.next;
    } else {
        return test.next;
    }
}

map.on('click', function(e) {
    // Abbrechen, wenn an der geklickten Stelle kein Marker ist
    if (!map.hasFeatureAtPixel(e.pixel)) return;
  
    let p = nextCenter(ol.proj.toLonLat(e.coordinate));
    popup.setPosition(ol.proj.fromLonLat(p));

    content.innerHTML = 'Lädt...';
    xslt(
        'http://ctvm.nkilders.de:8081/incidence?long=' + p[0] + '&lat=' + p[1],
        'http://ctvm.nkilders.de:8081/xml/inzidenz.xsl',
        fragment => {
            content.innerHTML = '';
            content.appendChild(fragment)
        }
    );

    // Versuch, die richtigen Daten in das Pop-Up zu schreiben :D
   /* console.log("jetz sollte es kommen:");
    load('http://ctvm.nkilders.de:8081/xml/impfzentren.xml', function(xml) {
        let clickPos = ol.proj.toLonLat(e.coordinate);

        console.log('Test Koordinaten: '+clickPos);
        console.log('1: '+clickPos[0]);
        
        let arrTestzentrum = xml.getElementsByTagName('testzentrum');
        console.log(arrTestzentrum);
        for (var i = 0; i < arrTestzentrum.length; i++) {
            console.log(i);
            let testzentrum = arrTestzentrum[i];
            let coords = testzentrum.getElementsByTagName('koordinaten')[0];

            if(coords.getElementsByTagName("laenge")[0] == clickPos[0] &&
                coords.getElementsByTagName("breite")[0] == clickPos[1]) {
                    console,log('Ich bin in der if abfrage drin!');
            }
            var lon = coordinates.getElementsByTagName("laenge")[0].textContent;
            var lat = coordinates.getElementsByTagName("breite")[0].textContent;
        }
    }); */


});

// Close-Listener für PopUp
var closer = document.getElementById('popup-closer');
closer.onclick = () => {
    popup.setPosition(undefined);
    closer.blur();
    return false;
};