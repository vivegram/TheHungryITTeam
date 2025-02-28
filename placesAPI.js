// Variables to store Places API objects
let placesService;
let autocomplete;
let searchResults = [];

/**
 * Initialize the Google Places API
 */
function initPlacesAPI() {
    // Create a dummy map (required for PlacesService)
    const mapDiv = document.createElement('div');
    mapDiv.style.display = 'none';
    document.body.appendChild(mapDiv);
    const map = new google.maps.Map(mapDiv, {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
    });
    
    // Initialize Places Service
    placesService = new google.maps.places.PlacesService(map);
    
    // Set up event listeners
    document.getElementById('searchButton').addEventListener('click', searchRestaurants);
    document.getElementById('restaurantSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchRestaurants();
        }
    });
    
    // Initialize autocomplete
    autocomplete = new google.maps.places.Autocomplete(
        document.getElementById('restaurantSearch'),
        { types: ['restaurant'] }
    );
    
    // Prevent form submission on Enter key in autocomplete
    document.getElementById('restaurantSearch').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement === this) {
            e.preventDefault();
        }
    });
    
    // Handle place selection from autocomplete
    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            // Clear previous results
            searchResults = [];
            
            // Add the selected place to results
            searchResults.push({
                id: place.place_id,
                name: place.name,
                address: place.formatted_address || place.vicinity || ''
            });
            
            // Display the result
            displaySearchResults();
        }
    });
}

/**
 * Search for restaurants based on user input
 */
function searchRestaurants() {
    const searchInput = document.getElementById('restaurantSearch').value.trim();
    
    if (searchInput === '') {
        alert('Please enter a restaurant name or location to search.');
        return;
    }
    
    // Clear previous results
    searchResults = [];
    
    // Create request for nearby search
    const request = {
        query: searchInput,
        type: ['restaurant', 'food']
    };
    
    // Perform text search
    placesService.textSearch(request, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            // Process results
            for (let i = 0; i < Math.min(results.length, 5); i++) {
                const place = results[i];
                searchResults.push({
                    id: place.place_id,
                    name: place.name,
                    address: place.formatted_address || place.vicinity || ''
                });
            }
            
            // Display results
            displaySearchResults();
        } else {
            alert('No restaurants found. Please try a different search term.');
        }
    });
}

/**
 * Display search results in the UI
 */
function displaySearchResults() {
    const resultsContainer = document.getElementById('restaurantResults');
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    if (searchResults.length === 0) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    // Create and append result items
    searchResults.forEach(function(restaurant) {
        const restaurantItem = document.createElement('div');
        restaurantItem.className = 'restaurant-item';
        restaurantItem.dataset.id = restaurant.id;
        restaurantItem.dataset.name = restaurant.name;
        
        const nameElement = document.createElement('div');
        nameElement.className = 'restaurant-name';
        nameElement.textContent = restaurant.name;
        
        const addressElement = document.createElement('div');
        addressElement.className = 'restaurant-address';
        addressElement.textContent = restaurant.address;
        
        restaurantItem.appendChild(nameElement);
        restaurantItem.appendChild(addressElement);
        
        // Add click event to select this restaurant
        restaurantItem.addEventListener('click', function() {
            selectRestaurant(restaurant.name);
            resultsContainer.style.display = 'none';
        });
        
        resultsContainer.appendChild(restaurantItem);
    });
    
    // Show results container
    resultsContainer.style.display = 'block';
}

/**
 * Select a restaurant from search results
 */
function selectRestaurant(restaurantName) {
    // Update the selected restaurant display
    document.getElementById('selectedRestaurant').textContent = `Selected: ${restaurantName}`;
    
    // Clear the order list
    document.getElementById('orderList').innerHTML = '';
    
    // Reset totals
    window.totalOrders = 0;
    window.totalPrice = 0;
    updateTotals();
    
    // Load orders for the selected restaurant if authenticated
    if (gapi.client && gapi.client.getToken() !== null) {
        loadOrdersFromSheet(restaurantName);
    }
    
    // Clear the search input
    document.getElementById('restaurantSearch').value = '';
    
    // Reset the dropdown to avoid confusion
    document.getElementById('restaurantSelect').value = '';
}

/**
 * Update totals (defined globally in app.js)
 */
function updateTotals() {
    document.getElementById('totalOrders').textContent = window.totalOrders;
    document.getElementById('totalPrice').textContent = window.totalPrice.toFixed(2);
} 