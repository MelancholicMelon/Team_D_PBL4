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


async function loadRestaurantData() {
    try {
        const response = await fetch('https://melancholicmelon.github.io/restaurant-locator/restaurants.json');
        if (!response.ok) {
            throw new Error("Failed to load restaurant data.");
        }
        const data = await response.json();
        return data.Restaurants;
    } catch (error) {
        console.error("Error loading restaurant data:", error);
    }
}


// Function to display restaurant information in the table

async function displayRestaurantInfoInTable(restaurants, nearbyRestaurants) {
    if (!userCoordinates) {
        alert("Please allow location access to display restaurant information.");
        return;
    }

    const tableBody = document.querySelector("tbody");
    tableBody.innerHTML = ''; // Clear existing rows

    for (const restaurant of nearbyRestaurants) {
        const { lat, lon, tags } = restaurant;
        const name = tags.name || "Unnamed Restaurant";

        // Find matching restaurant data from the JSON file
        const restaurantData = restaurants.find(r => r.name === name);

        // Default values if no match is found
        const cuisine = restaurantData ? restaurantData.cuisine : "Unknown";
        const priceRange = restaurantData ? restaurantData.price_range : "N/A";

        // Get menu images asynchronously
        const menuImages = await getMenuImages(name);

        // Calculate the distance to the restaurant from the user's location
        const distance = calculateDistance(userCoordinates.latitude, userCoordinates.longitude, lat, lon);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${cuisine}</td>
            <td>${distance} km</td>
            <td>${menuImages.map(img => `<a href="${img}" target="_blank"><img src="${img}" alt="Menu" style="width: 50px; height: 50px; margin: 5px;"></a>`).join('')}</td>
            <td><button type="submit" class="vote-btn">Vote</button></td>
        `;
        tableBody.appendChild(row);

        // Add event listener to the Vote button
        const voteButton = row.querySelector('.vote-btn');
        voteButton.addEventListener('click', () => {
            uploadVote(name); // Call uploadVote with the restaurant name
        });
    }
}
async function uploadVote(restaurantName) {
    if(sessionStorage.getItem("voteRecorded") === "true") {
        alert("You have already voted!");
        return;
    }
    console.log('Uploading vote for', restaurantName);
    const groupID = sessionStorage.getItem('groupID'); // Get groupID from sessionStorage
    if (!groupID) {
        console.error('groupID not found in sessionStorage.');
        return;
    }

    const binUrl = "https://api.jsonbin.io/v3/b/677e41bfe41b4d34e471c5be";
    const xApiKey = "$2a$10$eaLfBzS96u7D/mrTuyOiqOEkAFr6nLwT2OPGfu99Lj9uzvLGq0GKS";

    try {
        // Fetch the current data
        const response = await fetch(binUrl, {
            headers: {
                'X-Master-Key': xApiKey
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data); // Debugging log

        // Access the group dynamically using the groupID
        const group = data.record[groupID];
        console.log(group);
        if (!group) {
            console.error(`Group with ID ${groupID} not found in JSON data.`);
            return;
        }

        // Append the restaurant name to the preferred_restaurant array
        group.group_info.preferred_restaurant.push(restaurantName);

        // Save the updated data back to the JSON bin
        const saveResponse = await fetch(binUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': xApiKey
            },
            body: JSON.stringify(data.record)
        });

        if (!saveResponse.ok) {
            throw new Error(`Error saving data: ${saveResponse.status}`);
        }

        console.log(`Successfully updated preferred restaurant: ${restaurantName}`);
        console.log(`Vote recorded for: ${restaurantName}`); // Log the restaurant vote
        sessionStorage.setItem('voteRecorded', 'true');
        alert("Vote Successful for " + restaurantName);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function votingTable() {
    const binUrl = "https://api.jsonbin.io/v3/b/677e41bfe41b4d34e471c5be";
    const xApiKey = "$2a$10$eaLfBzS96u7D/mrTuyOiqOEkAFr6nLwT2OPGfu99Lj9uzvLGq0GKS";

    try {
        // Fetch the current preferred restaurant data
        const response = await fetch(binUrl, {
            headers: {
                'X-Master-Key': xApiKey
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.status}`);
        }

        const data = await response.json();
        const groupID = sessionStorage.getItem('groupID');
        if (!groupID || !data.record[groupID]) {
            console.error('Group ID not found or invalid in JSON data.');
            return;
        }

        const preferredRestaurants = data.record[groupID].group_info.preferred_restaurant;

        // Count the occurrences of each restaurant
        const voteCounts = preferredRestaurants.reduce((counts, restaurant) => {
            counts[restaurant] = (counts[restaurant] || 0) + 1;
            return counts;
        }, {});

        // Sort the restaurants by the number of votes in descending order
        const sortedVotes = Object.entries(voteCounts).sort((a, b) => b[1] - a[1]);

        // Calculate total votes
        const totalVotes = preferredRestaurants.length;

        // Update the voting results table
        const resultsTableBody = document.querySelector("#results-table tbody");
        resultsTableBody.innerHTML = ""; // Clear existing rows

        // Identify the highest vote count
        const highestVotes = sortedVotes[0][1];

        // Add sorted rows to the table
        sortedVotes.forEach(([restaurant, votes]) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${restaurant}</td><td>${votes}</td>`;

            // Highlight the row with the highest votes
            if (votes === highestVotes) {
                row.classList.add("highlight");
            }

            resultsTableBody.appendChild(row);
        });

        // Update the total votes count
        document.getElementById("total-votes").textContent = `Total Votes: ${totalVotes}`;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Add event listener to the refresh votes button
document.addEventListener("DOMContentLoaded", () => {
    const refreshButton = document.getElementById("refresh-votes-btn");
    refreshButton.addEventListener("click", votingTable);

    // Initial call to populate the table
    votingTable();
});


// Function to get the menu images for a restaurant
function getMenuImages(restaurantName) {
    return new Promise((resolve, reject) => {
        const menuFolder = `https://melancholicmelon.github.io/restaurant-locator/menu_image/${encodeURIComponent(restaurantName)}/`;
        const menuImages = [];
        let loadedImages = 0;
        let failedImages = 0;

        // Loop through a set of images (menu(1).png, menu(2).png, ...)
        for (let i = 1; i <= 3; i++) {  // Assuming there are up to 3 menu images
            const imgPath = `${menuFolder}menu(${i}).png`;
            
            const img = new Image();
            img.src = imgPath;

            // Check if image is loaded successfully
            img.onload = () => {
                menuImages.push(imgPath);  // If image loaded successfully, add it to the array
                loadedImages++;
                if (loadedImages + failedImages === 3) resolve(menuImages);  // Resolve once all attempts are complete
            };

            img.onerror = () => {
                failedImages++;
                if (loadedImages + failedImages === 3) resolve(menuImages);  // Resolve once all attempts are complete
            };
        }
    });
}



function calculateDistance(userLat, userLon, restaurantLat, restaurantLon) {
    const R = 6371; // Radius of Earth in km
    const dLat = (restaurantLat - userLat) * (Math.PI / 180);
    const dLon = (restaurantLon - userLon) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userLat * (Math.PI / 180)) * Math.cos(restaurantLat * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance.toFixed(2); // Return distance rounded to 2 decimal places
}







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
// async function handleFindNearbyRestaurants() {
//     const radiusInput = document.getElementById("search-radius").value || 1000;

//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(async (position) => {
//             const { latitude, longitude } = position.coords;

//             // Move the map to the user's location
//             map.setView([latitude, longitude], 13);

//             // Remove all markers except the user location marker
//             clearMarkers(false);

//             if (!userMarker) {
//                 userMarker = L.marker([latitude, longitude])
//                     .addTo(map)
//                     .bindPopup("You are here!")
//                     .openPopup();
//             } else {
//                 userMarker.setLatLng([latitude, longitude]).openPopup();
//             }

//             // Fetch and display nearby restaurants
//             const restaurants = await fetchNearbyRestaurants(latitude, longitude, radiusInput); // This has a list of all the restaurants near our location. Use this for processing
//             if (restaurants) {
//                 displayRestaurantsOnMap(restaurants);
//                 console.log(restaurants);
//             }
//         }, (error) => {
//             console.error("Geolocation error:", error);
//             alert("Failed to retrieve location. Please allow location access.");
//         });
//     } else {
//         alert("Geolocation is not supported by your browser.");
//     }
// }

async function handleFindNearbyRestaurants() {
    const radiusInput = document.getElementById("search-radius").value || 1000;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            userCoordinates = { latitude, longitude };
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
            const restaurants = await fetchNearbyRestaurants(latitude, longitude, radiusInput);
            if (restaurants) {
                displayRestaurantsOnMap(restaurants);

                // Load the restaurant data from JSON
                const restaurantData = await loadRestaurantData();
                console.log("User coordinates:",userCoordinates);
                // Display restaurant info in table
                displayRestaurantInfoInTable(restaurantData, restaurants);
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
let userCoordinates = null;
async function handleFindMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            userCoordinates = { latitude, longitude };

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