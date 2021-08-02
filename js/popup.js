var content = document.getElementById('popup-content');

var popup = new ol.Overlay({
    element: document.getElementById('popup')
});
map.addOverlay(popup);

/**
 * Ermittelt die Koordinaten aus arr, welche den geringsten
 * Abstand zu clickPos haben.
 * 
 * @param {Array<Number>} clickPos [Längengrad, Breitengrad]
 * @param {Array<Array<Number>>} arr [[Längengrad, Breitengrad], ...]
 * @returns JS-Objekt mit nächsten Koordinaten sowie der Entfernung zu diesen
 */
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

/**
 * Gibt abhängig von den in clickPos übergebenen Koordinaten
 * den Typ (impf, test) sowie die Koordinaten des nächsten
 * Impf-/Testzentrums zurück.
 * 
 * @param {Array<Number>} clickPos [Längengrad, Breitengrad]
 * @returns JS-Objekt mit dem Typ und den Koordinaten des nächsten Impf-/Testzentrums
 */
function nextCenter(clickPos) {
    let impf = nextCenterHelper(clickPos, impfzentren);
    let test = nextCenterHelper(clickPos, testzentren);

    if(impf.minDist < test.minDist) {
        return { type: 'impf', pos: impf.next };
    } else {
        return { type: 'test', pos: test.next };
    }
}

map.on('click', e => {
    // Abbrechen, wenn an der geklickten Stelle kein Marker ist
    if (!map.hasFeatureAtPixel(e.pixel)) return;
  
    // Nächstes Impf-/Testzentrum ermitteln
    let next = nextCenter(ol.proj.toLonLat(e.coordinate));
    // Abbrechen, wenn kein Zentrum gefunden wurde
    if(next == undefined) return;

    // Popup an die Stelle des Zentrums setzen
    popup.setPosition(ol.proj.fromLonLat(next.pos));

    content.innerHTML = 'Lädt...';

    let xmlUrlBase, xslUrlBase;

    if(next.type == 'impf') {
        xmlUrlBase = BACKEND_HOST + '/center/vaccination';
        xslUrlBase = 'xsl/impfzentrum.xsl';
    } else if(next.type == 'test') {
        xmlUrlBase = BACKEND_HOST + '/center/test';
        xslUrlBase = 'xsl/testzentrum.xsl';
    } else {
        return;
    }

    // Details zu angeklicktem Zentrum laden und in Popup einfügen
    xslt(
        xmlUrlBase + '?long=' + next.pos[0] + '&lat=' + next.pos[1],
        xslUrlBase,
        fragment => {
            content.innerHTML = '';
            content.appendChild(fragment)
        }
    );
});

// Close-Listener für PopUp
var closer = document.getElementById('popup-closer');
closer.onclick = () => {
    popup.setPosition(undefined);
    closer.blur();
    return false;
};