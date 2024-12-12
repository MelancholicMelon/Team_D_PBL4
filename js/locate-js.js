let userMarker = null;

function locateUser() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Remove existing user marker if exists
                if (userMarker) {
                    map.removeLayer(userMarker);
                }

                // Add new user marker
                userMarker = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'user-location-icon',
                        html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(map);

                // Center map on user location
                map.setView([lat, lon], 15);
                
                showNotification('Location found successfully!');
            },
            function(error) {
                showNotification('Error: Unable to retrieve location');
                console.error("Error getting location:", error);
            }
        );
    } else {
        showNotification('Geolocation is not supported by this browser.');
    }
}
