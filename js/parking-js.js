let parkingMarkers = [];

function findNearbyParkingLots(radius = 3000) {
    if (!userMarker) {
        showNotification('Please find your location first');
        return;
    }

    // Clear previous parking markers
    parkingMarkers.forEach(marker => map.removeLayer(marker));
    parkingMarkers = [];

    const userLocation = userMarker.getLatLng();
    const parkingLots = [
        { lat: userLocation.lat + 0.005, lon: userLocation.lng + 0.005, name: 'Parking Lot A' },
        { lat: userLocation.lat - 0.005, lon: userLocation.lng - 0.005, name: 'Parking Lot B' }
    ];

    parkingLots.forEach(lot => {
        const marker = L.marker([lot.lat, lot.lon], {
            icon: L.divIcon({
                className: 'parking-icon',
                html: '<div style="background-color: green; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
                iconSize: [20, 20]
            })
        }).addTo(map).bindPopup(lot.name);
        parkingMarkers.push(marker);
    });

    showNotification(`Found ${parkingLots.length} parking lots within ${radius}m`);
}
