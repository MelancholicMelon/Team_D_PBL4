let restaurantMarkers = [];
let restaurantNamesList = [];

function findNearbyRestaurants(radius = 3000) {
    // Reset the restaurant names list
    restaurantNamesList = [];

    if (!userMarker) {
        showNotification('Please find your location first');
        return;
    }

    // Clear previous restaurant markers
    restaurantMarkers.forEach(marker => map.removeLayer(marker));
    restaurantMarkers = [];

    const userLocation = userMarker.getLatLng();
    
    // Construct Overpass API query
    const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:${radius},${userLocation.lat},${userLocation.lng});
      way["amenity"="restaurant"](around:${radius},${userLocation.lat},${userLocation.lng});
      relation["amenity"="restaurant"](around:${radius},${userLocation.lat},${userLocation.lng});
    );
    out center;
    `;

    // Encode the query for URL
    const encodedQuery = encodeURIComponent(overpassQuery);
    
    // Overpass API endpoint
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;

    // Fetch restaurants
    return fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
            // Process and add restaurant markers
            const restaurants = data.elements;
            
            restaurants.forEach(restaurant => {
                // Determine coordinates (different for nodes, ways, and relations)
                const lat = restaurant.lat || restaurant.center.lat;
                const lon = restaurant.lon || restaurant.center.lon;

                // Get restaurant name, default to 'Unnamed Restaurant'
                const name = restaurant.tags?.name || 'Unnamed Restaurant';
                
                // Add to internal list
                restaurantNamesList.push(name);

                // Create marker
                const marker = L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'restaurant-icon',
                        html: '<div style="background-color: red; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(map).bindPopup(name);
                
                restaurantMarkers.push(marker);
            });

            // Show notification with results
            showNotification(`Found ${restaurants.length} restaurants within ${radius}m`);

            // Return the list of restaurant names for potential further use
            return restaurantNamesList;
        })
        .catch(error => {
            console.error('Error fetching restaurants:', error);
            showNotification('Error finding restaurants. Please try again.');
            return [];
        });
}

// Function to get the list of restaurant names
function getRestaurantNames() {
    return restaurantNamesList;
}

// Optional: Function to filter or process restaurant names
function processRestaurantNames(filterFn = null) {
    if (filterFn) {
        return restaurantNamesList.filter(filterFn);
    }
    return restaurantNamesList;
}
