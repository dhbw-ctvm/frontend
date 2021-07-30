// Falls XSLT nicht vom Browser unterstützt wird, gibt es eine Fehlermeldung in der Konsole
if (typeof XSLTProcessor == 'undefined') {
    console.error('XSLTProcessor not found!\nCannot perform any XSL-Transformations');
}

/**
 * Lädt eine XML-basierte Datei von einer URL
 * 
 * @param {String} url URL zur Datei
 * @param {Function} callback Wird aufgerufen sobald die Datei erfolgreich geladen wurde. Der Inhalt der Datei wird als Funktionsparameter übergeben.
 */
function load(url, callback) {
    let req = new XMLHttpRequest();
    req.open('GET', url);

    try {
        req.responseType = 'document';
    } catch (ex) {}

    req.onload = function() {
        callback(req.responseXML);
    };

    req.send();
}

/**
 * Führt eine XSL-Transformation durch
 * 
 * @param {String} xmlUrl URL zur XML-Datei
 * @param {String} xslUrl URL zur XSL-Datei
 * @param {Function} callback Wird aufgerufen sobald die XSLT erfolgreich durchgeführt wurde. Das neue Dokument wird als Funktionsparameter übergeben.
 */
function xslt(xmlUrl, xslUrl, callback) {
    load(xmlUrl, function(xml) {
        load(xslUrl, function(xsl) {
            let processor = new XSLTProcessor();
            processor.importStylesheet(xsl);

            let fragment = processor.transformToFragment(xml, document);

            callback(fragment);
        });
    });
}