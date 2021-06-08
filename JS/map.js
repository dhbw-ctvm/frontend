var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([10, 49]),
        zoom: 6
    })
});
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
        console.log();
        map.setView(new ol.View({
            center: ol.proj.fromLonLat([pos.coords.longitude, pos.coords.latitude]),
            zoom: 10
        }));
    });
}