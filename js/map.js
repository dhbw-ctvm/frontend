var infocon = document.getElementById('infobox-content');
var loc = [10, 49];


//==========================//
// Karte in Seite einbinden //
//==========================//

var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat(loc),
        zoom: 6
    })
});

var styles = {
    'iconimpf': new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            zoom: 0.1,
            src: 'img/markerimpf.png',
            //blau
        }),
    }),
    'icontest': new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            zoom: 0.1,
            src: 'img/markertest.png',
            //rot
        }),
    }),
    'currpos': new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            zoom: 0.1,
            src: 'img/currpos.png',
        }),
    })
};


//====================================//
// Geo-Position des Nutzers ermitteln //
//    Inzidenz laden und anzeigen     //
//====================================//

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
        loc = [pos.coords.longitude, pos.coords.latitude];

        // Zur Position des Nutzers springen
        map.setView(new ol.View({
            center: ol.proj.fromLonLat(loc),
            zoom: 10
        }));
        
        // Position des Nutzers auf der Karte markieren
        var currpos = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [
                    new ol.Feature({
                        type: 'currpos',
                        geometry: new ol.geom.Point(ol.proj.fromLonLat([loc[0], loc[1]]))
                    })
                ],
            }),
            style: function(feature) {
                return styles[feature.get('type')];
            }
        });
        map.addLayer(currpos);

        // Inzidenz in der Umgebung des Nutzers laden und anzeigen
        xslt(
            'http://ctvm.nkilders.de:8081/incidence?long=' + loc[0] + '&lat=' + loc[1],
            'xsl/inzidenz.xsl',
            fragment => {
                document.getElementById('infobox').style.visibility = "visible";
                infocon.innerHTML = '';
                infocon.appendChild(fragment);
            }
        );
    });
}


//==============================================//
// Impfzentren laden und auf der Karte anzeigen //
//==============================================//

var impfzentren = [];

// Impfzentren laden
fetch('http://ctvm.nkilders.de:8081/xml/impfzentren.xml')
    .then(function(response) {
        // Antwort kommt als Text-String
        return response.text();
    })
    .then(function(data) {
        // String in ein XML-DOM-Objekt umwandeln
        let parser = new DOMParser();
        let impfDoc = parser.parseFromString(data, 'text/xml');

        impfzentren = [];

        // Über alle Impfzentren iterieren
        for (var i = 0; i < impfDoc.getElementsByTagName('impfzentrum').length; i++) {
            var coordinates = impfDoc.getElementsByTagName('impfzentrum')[i].getElementsByTagName("koordinaten")[0];
            var lon = coordinates.getElementsByTagName("laenge")[0].textContent;
            var lat = coordinates.getElementsByTagName("breite")[0].textContent;

            // Koordinaten des Impfzentrums im impfzentren-Array speichern
            impfzentren.push([lon, lat]);

            // Marker auf Karte erstellen
            var layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [
                        new ol.Feature({
                            type: 'iconimpf',
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
                        })
                    ],
                }),
                style: function(feature) {
                    return styles[feature.get('type')];
                }
            });
            map.addLayer(layer);
        }

    })
    .catch(function(error) {
        console.error("Fehler beim Laden der Impfzentren:\n" + error);
    }
);


//==============================================//
// Testzentren laden und auf der Karte anzeigen //
//==============================================//

var testzentren = [];

// Testzentren laden
fetch('http://ctvm.nkilders.de:8081/centers/test')
    .then(function(response) {
        // Antwort kommt als Text-String
        return response.text();
    })
    .then(function(data) {
        // String in ein XML-DOM-Objekt umwandeln
        let parser = new DOMParser();
        let testDoc = parser.parseFromString(data, 'text/xml');

        testzentren = [];

        // Über Testzentren iterieren
        for (var i = 0; i < testDoc.getElementsByTagName('testzentrum').length; i++) {
            var coordinates = testDoc.getElementsByTagName('testzentrum')[i].getElementsByTagName("koordinaten")[0];
            var lon = coordinates.getElementsByTagName("laenge")[0].textContent;
            var lat = coordinates.getElementsByTagName("breite")[0].textContent;

            // Koordinaten des Testzentrums im testzentren-Array speichern
            testzentren.push([lon, lat]);

            // Marker auf Karte erstellen
            var layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [
                        new ol.Feature({
                            type: 'icontest',
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
                        })
                    ],
                }),
                style: function(feature) {
                    return styles[feature.get('type')];
                }
            });
            map.addLayer(layer);
        }

    })
    .catch(function(error) {
        console.error("Fehler beim Laden der Testzentren:\n" + error);
    }
);