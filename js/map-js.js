let map;

function initMap() {
    map = L.map('map').setView([34.6937, 135.5023], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    map.on('dblclick', function(e) {
        const destLat = e.latlng.lat;
        const destLon = e.latlng.lng;
        setDestination(destLat, destLon);
    });

    map.doubleClickZoom.disable();

    return map;
}

function setDestination(lat, lon) {
    if (window.routeLayer) {
        map.removeLayer(window.routeLayer);
    }

    const destinationMarker = L.marker([lat, lon], {
        icon: L.divIcon({
            className: 'destination-icon',
            html: '<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [20, 20]
        })
    }).addTo(map).bindPopup('Destination');

    map.setView([lat, lon], 15);
    showNotification(`Destination set to: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
}
