// Include this script in your HTML file

// Initialize the map and set its view to a default location
let map = L.map('map').setView([35.6895, 139.6917], 13);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Array to keep track of markers
let markers = [];
let userMarker = null;

// Function to fetch restaurants near the user's location
async function fetchNearbyRestaurants(lat, lon, radius) {
    const overpassUrl = `https://overpass-api.de/api/interpreter`;
    const query = `
        [out:json];
        node["amenity"="restaurant"](around:${radius},${lat},${lon});
        out body;
    `;

    try {
        const response = await fetch(overpassUrl, {
            method: "POST",
            body: query,
            headers: {
                "Content-Type": "text/plain"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch data from Overpass API");
        }

        const data = await response.json();
        return data.elements;
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        alert("An error occurred while fetching nearby restaurants.");
    }
}

// Function to display restaurants on the map
function displayRestaurantsOnMap(restaurants) {
    if (!restaurants || restaurants.length === 0) {
        alert("No restaurants found nearby.");
        return;
    }

    restaurants.forEach((restaurant) => {
        const { lat, lon } = restaurant;
        const name = restaurant.tags.name || "Unnamed Restaurant";

        const marker = L.marker([lat, lon])
            .addTo(map)
            .bindPopup(name)
            .openPopup();

        markers.push(marker); // Keep track of markers
    });
}

// Function to locate the user and fetch nearby restaurants
async function handleFindNearbyRestaurants() {
    const radiusInput = document.getElementById("search-radius").value || 1000;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            // Move the map to the user's location
            map.setView([latitude, longitude], 13);

            // Remove all markers except the user location marker
            clearMarkers(false);

            if (!userMarker) {
                userMarker = L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup("You are here!")
                    .openPopup();
            } else {
                userMarker.setLatLng([latitude, longitude]).openPopup();
            }

            // Fetch and display nearby restaurants
            const restaurants = await fetchNearbyRestaurants(latitude, longitude, radiusInput); // This has a list of all the restaurants near our location. Use this for processing
            if (restaurants) {
                displayRestaurantsOnMap(restaurants);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Failed to retrieve location. Please allow location access.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Function to locate the user and center the map
async function handleFindMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;

            // Move the map to the user's location
            map.setView([latitude, longitude], 13);

            if (!userMarker) {
                userMarker = L.marker([latitude, longitude])
                    .addTo(map)
                    .bindPopup("You are here!")
                    .openPopup();
            } else {
                userMarker.setLatLng([latitude, longitude]).openPopup();
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Failed to retrieve location. Please allow location access.");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Function to clear all markers from the map
function clearMarkers(clearUserMarker = true) {
    markers.forEach((marker) => {
        map.removeLayer(marker);
    });
    markers = []; // Reset the markers array

    if (clearUserMarker && userMarker) {
        map.removeLayer(userMarker);
        userMarker = null;
    }
}

// Attach event listener to the Find Nearby Restaurants button
document.getElementById("find-restaurant-btn").addEventListener("click", handleFindNearbyRestaurants);

// Attach event listener to the Find My Location button
document.getElementById("locate-btn").addEventListener("click", handleFindMyLocation);

// Attach event listener to a Reset Markers button
document.getElementById("reset-markers-btn").addEventListener("click", () => clearMarkers(true));