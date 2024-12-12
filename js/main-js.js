document.addEventListener('DOMContentLoaded', () => {
    // Initialize global map
    window.map = initMap();

    // Event Listeners
    document.getElementById('locate-btn').addEventListener('click', locateUser);

    document.getElementById('navigate-btn').addEventListener('click', function() {
        const selectedMode = document.getElementById('travel-mode-select').value;
        navigateUser(selectedMode);
    });

    document.getElementById('find-parking-btn').addEventListener('click', function() {
        const radiusInput = document.getElementById('search-radius').value;
        const radius = radiusInput ? parseFloat(radiusInput, 10) : 3000;
        findNearbyParkingLots(radius);
    });
});
