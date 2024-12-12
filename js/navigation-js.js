function navigateUser(mode, nearest = true) {
    if (!userMarker) {
        showNotification('Please find your location first');
        return;
    }

    // Simulated navigation logic
    const userLocation = userMarker.getLatLng();
    const destination = nearest 
        ? { lat: userLocation.lat + 0.01, lon: userLocation.lng + 0.01 }
        : { lat: 34.7, lon: 135.5 }; // Example destination

    showNotification(`Navigating via ${mode} to ${nearest ? 'nearest point' : 'preset destination'}`);
}
