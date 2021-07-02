var loc = [10, 49]

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

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
        loc = [pos.coords.longitude, pos.coords.latitude]
        console.log();

        /*
        $.ajax({
            url: 'http://localhost:8081/incidence',
            data: {
                long: loc[0],
                lat: loc[1]
            },
            success: function(data){
                console.log(data)
            }
        }); */

        map.setView(new ol.View({
            center: ol.proj.fromLonLat(loc),
            zoom: 10
        }));
    });
}

var styles = {
    'icon': new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'marker.png',
        }),
    }),
};

//Daten aus der XML Datei lesen ----------------------------------------
// fetch-Aufruf mit Pfad zur XML-Datei
var xmlDoc;
fetch('impfzentren.xml')
    .then(function(response) {
        // Antwort kommt als Text-String
        return response.text();
    })
    .then(function(data) {
        // String in ein XML-DOM-Objekt umwandeln
        let parser = new DOMParser();
        xmlDoc = parser.parseFromString(data, 'text/xml');

        for (var i = 0; i < xmlDoc.getElementsByTagName('impfzentrum').length; i++) {

            var startMarker = new ol.Feature({
                type: 'icon',
                geometry: new ol.geom.Point(ol.proj.fromLonLat([xmlDoc.getElementsByTagName('impfzentrum')[i].getElementsByTagName("koordinaten")[0].getElementsByTagName("laenge")[0].textContent, xmlDoc.getElementsByTagName('impfzentrum')[i].getElementsByTagName("koordinaten")[0].getElementsByTagName("breite")[0].textContent])),
            });

            var layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [
                        startMarker
                        /*   new ol.Feature({
                                type: 'icon',
                                geometry: new ol.geom.Point(ol.proj.fromLonLat([8.4036527, 49.0068901]))
                            }) */
                    ],
                }),
                style: function(feature) {
                    return styles[feature.get('type')];
                }
            });
            map.addLayer(layer);
        }

    }).catch(function(error) {
        console.log("Fehler: bei Auslesen der XML-Datei " + error);
    });