var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');


var popup = new ol.Overlay({
    element: container
});
map.addOverlay(popup);

map.on('click', function(e) {
    let p = startMarker.getGeometry().flatCoordinates;

    if(map.hasFeatureAtPixel(e.pixel)) {
        popup.setPosition(p);
       
        // TODO: geklickten Marker bestimmen
        // TODO: Daten im Popup ändern
    }
});

closer.onclick = function() {
    popup.setPosition(undefined);
    closer.blur();
    return false;
};

/*
var overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});

map.addOverlay(overlay);

closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};

map.on('singleclick', function(event) {
    if (map.hasFeatureAtPixel(event.pixel) == true) {
        var coordinate = event.coordinate;

        console.log(coordinate);

        content.innerHTML = '<b> Hello World!</b><br />I am a popup.';
        overlay.setPosition(coordinate);
    } else {
        overlay.setPosition(undefined);
        close.blur();
    }
}); */