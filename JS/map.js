var infocon = document.getElementById('infobox-content');
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
        
        /* Show infobox*/
        document.getElementById('infobox').style.visibility = "visible";

        /*fill infobox with incidence of current region*/
        load('http://localhost/CTVM/Backend/xml/inzidenz.xml?long=' + loc[0] + '&lat=' + loc[1], function(xml) {
            load('http://localhost/CTVM/Backend/xml/inzidenz.xsl', function(xsl) {
                let processor = new XSLTProcessor();
                processor.importStylesheet(xsl);
    
                let fragment = processor.transformToFragment(xml, document);
    
                infocon.innerHTML = '';
                infocon.appendChild(fragment);
            });
        });
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

var impfzentren = [];

fetch('http://localhost/CTVM/Backend/xml/impfzentren.xml')
    .then(function(response) {
        // Antwort kommt als Text-String
        return response.text();
    })
    .then(function(data) {
        // String in ein XML-DOM-Objekt umwandeln
        let parser = new DOMParser();
        xmlDoc = parser.parseFromString(data, 'text/xml');

        impfzentren = [];

        for (var i = 0; i < xmlDoc.getElementsByTagName('impfzentrum').length; i++) {
            var coordinates = xmlDoc.getElementsByTagName('impfzentrum')[i].getElementsByTagName("koordinaten")[0];
            var lon = coordinates.getElementsByTagName("laenge")[0].textContent;
            var lat = coordinates.getElementsByTagName("breite")[0].textContent;

            impfzentren.push([lon, lat]);

            var layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [
                        new ol.Feature({
                            type: 'icon',
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

    }).catch(function(error) {
        console.log("Fehler: bei Auslesen der XML-Datei " + error);
    });