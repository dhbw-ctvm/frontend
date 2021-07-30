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
        return { type: 'impf', pos: impf.next };
    } else {
        return { type: 'test', pos: test.next };
    }
}

map.on('click', function(e) {
    // Abbrechen, wenn an der geklickten Stelle kein Marker ist
    if (!map.hasFeatureAtPixel(e.pixel)) return;
  
    let next = nextCenter(ol.proj.toLonLat(e.coordinate));
    if(next == undefined) return;

    popup.setPosition(ol.proj.fromLonLat(next.pos));

    content.innerHTML = 'Lädt...';

    let xmlUrlBase, xslUrlBase;
    xmlUrlBase = xslUrlBase = 'http://ctvm.nkilders.de:8081';

    if(next.type == 'impf') {
        xmlUrlBase += '/center/vaccination';
        xslUrlBase += '/xml/impfzentrum.xsl';
    } else if(next.type == 'test') {
        xmlUrlBase += '/center/test';
        xslUrlBase += '/xml/testzentrum.xsl';
    }

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