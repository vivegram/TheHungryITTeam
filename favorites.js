// Variables to store favorites
let userFavorites = [];

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const saveAsFavoriteButton = document.getElementById('saveAsFavorite');
    const favoritesList = document.getElementById('favoritesList');
    
    // Load favorites from local storage
    loadFavorites();
    
    // Add event listener to the save as favorite button
    saveAsFavoriteButton.addEventListener('click', saveAsFavorite);
    
    /**
     * Save the current order as a favorite
     */
    function saveAsFavorite() {
        const nameInput = document.getElementById('nameInput');
        const orderInput = document.getElementById('orderInput');
        const priceInput = document.getElementById('priceInput');
        const selectedRestaurantDisplay = document.getElementById('selectedRestaurant');
        
        const name = nameInput.value.trim();
        const orderText = orderInput.value.trim();
        const priceText = priceInput.value.trim();
        
        // Get the selected restaurant
        const selectedRestaurantText = selectedRestaurantDisplay.textContent;
        const restaurant = selectedRestaurantText.startsWith('Selected:') 
            ? selectedRestaurantText.replace('Selected:', '').trim() 
            : '';
        
        if (name === '' || orderText === '' || restaurant === '') {
            alert('Please enter your name, order, and select a restaurant before saving as a favorite.');
            return;
        }
        
        // Parse price (default to 0 if not provided or invalid)
        let price = 0;
        if (priceText !== '') {
            price = parseFloat(priceText);
            if (isNaN(price)) {
                price = 0;
            }
        }
        
        // Check if this favorite already exists
        const existingIndex = userFavorites.findIndex(fav => 
            fav.name === name && 
            fav.restaurant === restaurant
        );
        
        if (existingIndex !== -1) {
            // Update existing favorite
            userFavorites[existingIndex] = {
                name,
                restaurant,
                order: orderText,
                price
            };
            
            alert(`Updated your favorite order for ${restaurant}!`);
        } else {
            // Add new favorite
            userFavorites.push({
                name,
                restaurant,
                order: orderText,
                price
            });
            
            alert(`Saved as your favorite order for ${restaurant}!`);
        }
        
        // Save to local storage
        saveFavoritesToStorage();
        
        // Update the favorites display
        displayFavorites();
    }
    
    /**
     * Display all favorites in the UI
     */
    function displayFavorites() {
        // Clear the favorites list
        favoritesList.innerHTML = '';
        
        if (userFavorites.length === 0) {
            const noFavorites = document.createElement('div');
            noFavorites.className = 'no-favorites';
            noFavorites.textContent = 'No favorites saved yet';
            favoritesList.appendChild(noFavorites);
            return;
        }
        
        // Sort favorites by restaurant name
        userFavorites.sort((a, b) => a.restaurant.localeCompare(b.restaurant));
        
        // Create and append favorite items
        userFavorites.forEach(function(favorite, index) {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            favoriteItem.dataset.index = index;
            
            const restaurantElement = document.createElement('div');
            restaurantElement.className = 'favorite-restaurant';
            restaurantElement.textContent = favorite.restaurant;
            
            const nameElement = document.createElement('div');
            nameElement.className = 'favorite-name';
            nameElement.textContent = favorite.name;
            
            const orderElement = document.createElement('div');
            orderElement.className = 'favorite-order';
            orderElement.textContent = favorite.order;
            
            const priceElement = document.createElement('div');
            priceElement.className = 'favorite-price';
            priceElement.textContent = favorite.price > 0 ? `$${favorite.price.toFixed(2)}` : '';
            
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-favorite';
            removeButton.innerHTML = '&times;';
            removeButton.title = 'Remove favorite';
            removeButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent the click from triggering the parent element
                removeFavorite(index);
            });
            
            favoriteItem.appendChild(restaurantElement);
            favoriteItem.appendChild(nameElement);
            favoriteItem.appendChild(orderElement);
            favoriteItem.appendChild(priceElement);
            favoriteItem.appendChild(removeButton);
            
            // Add click event to use this favorite
            favoriteItem.addEventListener('click', function() {
                useFavorite(index);
            });
            
            favoritesList.appendChild(favoriteItem);
        });
    }
    
    /**
     * Remove a favorite from the list
     */
    function removeFavorite(index) {
        if (confirm('Are you sure you want to remove this favorite?')) {
            userFavorites.splice(index, 1);
            saveFavoritesToStorage();
            displayFavorites();
        }
    }
    
    /**
     * Use a favorite to fill in the order form
     */
    function useFavorite(index) {
        const favorite = userFavorites[index];
        
        // Check if the restaurant matches the currently selected one
        const selectedRestaurantDisplay = document.getElementById('selectedRestaurant');
        const selectedRestaurantText = selectedRestaurantDisplay.textContent;
        const currentRestaurant = selectedRestaurantText.startsWith('Selected:') 
            ? selectedRestaurantText.replace('Selected:', '').trim() 
            : '';
        
        // If restaurant doesn't match, ask if they want to switch
        if (currentRestaurant !== favorite.restaurant && currentRestaurant !== '') {
            if (!confirm(`This favorite is for ${favorite.restaurant}, but you currently have ${currentRestaurant} selected. Do you want to switch to ${favorite.restaurant}?`)) {
                return;
            }
            
            // Switch to the favorite's restaurant
            selectRestaurant(favorite.restaurant);
        } else if (currentRestaurant === '') {
            // No restaurant selected, so select the favorite's restaurant
            selectRestaurant(favorite.restaurant);
        }
        
        // Fill in the form fields
        document.getElementById('nameInput').value = favorite.name;
        document.getElementById('orderInput').value = favorite.order;
        document.getElementById('priceInput').value = favorite.price > 0 ? favorite.price.toString() : '';
    }
    
    /**
     * Save favorites to local storage
     */
    function saveFavoritesToStorage() {
        localStorage.setItem('userFavorites', JSON.stringify(userFavorites));
    }
    
    /**
     * Load favorites from local storage
     */
    function loadFavorites() {
        const storedFavorites = localStorage.getItem('userFavorites');
        if (storedFavorites) {
            userFavorites = JSON.parse(storedFavorites);
            displayFavorites();
        }
    }
    
    // Make functions available globally
    window.displayFavorites = displayFavorites;
    window.loadFavorites = loadFavorites;
}); 