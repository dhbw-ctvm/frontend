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
        map.setView(new ol.View({
            center: ol.proj.fromLonLat(loc),
            zoom: 10
        }));
    });
}

var layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [
                new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat([8.4036527, 49.0068901]))
                })
            ]
        })
});

map.addLayer(layer);


