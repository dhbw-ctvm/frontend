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

        map.setView(new ol.View({
            center: ol.proj.fromLonLat(loc),
            zoom: 10
        }));
        
        /* Show infobox*/
        document.getElementById('infobox').style.visibility = "visible";
        console.log("lon" + loc[0] + "lat" + loc[1]);
        
        /*fill infobox with incidence of current region*/
        //49.00063203049832, 8.407617521523703 Karlsruhe
        //48.94141437268078, 8.400601955059383 Ettlingen (Karlsruhe)
        //49.15083761071298, 9.184958996799912 Heilbronn
        //49.12925822517504, 8.9163116833507 Eppingen (Heilbronn)
        load('http://127.0.0.1:8081/incidence?long=' + loc[0] + '&lat=' + loc[1], function(xml) { 
            load('http://localhost/CTVM/Backend/xml/inzidenz.xsl', function(xsl) {
                try{
                    let processor = new XSLTProcessor();
                    processor.importStylesheet(xsl);
        
                    let fragment = processor.transformToFragment(xml, document);
                           
                    infocon.innerHTML = '';
                    infocon.appendChild(fragment);
                    if(infocon.innerHTML == '<html><body></body></html>'){
                        throw true;
                    }
                }
                catch(e){
                    load('http://127.0.0.1:8081/incidence?long=8.407&lat=49.000', function(xml) {
                        load('http://localhost/CTVM/Backend/xml/inzidenz.xsl', function(xsl) {
                        let processor = new XSLTProcessor();
                        processor.importStylesheet(xsl);
            
                        let fragment = processor.transformToFragment(xml, document);
                        
                        infocon.innerHTML = '';
                        infocon.appendChild(fragment);
                        }); 
                    });
                    }
            })
        })
    });
}

var styles = {
    'iconimpf': new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            zoom: 0.1,
            src: 'markerimpf.png',
            //blau
        }),
    }),
    'icontest': new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            zoom: 0.1,
            src: 'markertest.png',
            //rot
        }),
    }),
};

//Impfzentren aus der XML Datei lesen ----------------------------------------
// fetch-Aufruf mit Pfad zur XML-Datei
var impfDoc;

var impfzentren = [];

fetch('http://localhost/CTVM/Backend/xml/impfzentren.xml')
    .then(function(response) {
        // Antwort kommt als Text-String
        return response.text();
    })
    .then(function(data) {
        // String in ein XML-DOM-Objekt umwandeln
        let parser = new DOMParser();
        impfDoc = parser.parseFromString(data, 'text/xml');

        impfzentren = [];

        for (var i = 0; i < impfDoc.getElementsByTagName('impfzentrum').length; i++) {
            var coordinates = impfDoc.getElementsByTagName('impfzentrum')[i].getElementsByTagName("koordinaten")[0];
            var lon = coordinates.getElementsByTagName("laenge")[0].textContent;
            var lat = coordinates.getElementsByTagName("breite")[0].textContent;

            impfzentren.push([lon, lat]);

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

    }).catch(function(error) {
        console.log("Fehler: bei Auslesen der XML-Datei " + error);
    });


//Testzentren aus der XML Datei lesen ----------------------------------------
// fetch-Aufruf mit Pfad zur XML-Datei
var testDoc;

var testzentren = [];

fetch('http://127.0.0.1:8081/centers/test')
    .then(function(response) {
        // Antwort kommt als Text-String
        return response.text();
    })
    .then(function(data) {
        // String in ein XML-DOM-Objekt umwandeln
        let parser = new DOMParser();
        testDoc = parser.parseFromString(data, 'text/xml');

        testzentren = [];

        for (var i = 0; i < testDoc.getElementsByTagName('testzentrum').length; i++) {
            var coordinates = testDoc.getElementsByTagName('testzentrum')[i].getElementsByTagName("koordinaten")[0];
            var lon = coordinates.getElementsByTagName("laenge")[0].textContent;
            var lat = coordinates.getElementsByTagName("breite")[0].textContent;

            testzentren.push([lon, lat]);

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

    }).catch(function(error) {
        console.log("Fehler: bei Auslesen der XML-Datei " + error);
    });