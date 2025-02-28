// Variables to store restaurants
let restaurantList = [];

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const restaurantSelect = document.getElementById('restaurantSelect');
    const selectedRestaurantDisplay = document.getElementById('selectedRestaurant');
    
    // Add event listener to the restaurant select dropdown
    restaurantSelect.addEventListener('change', function() {
        const selectedRestaurant = restaurantSelect.value;
        
        if (selectedRestaurant) {
            // Update the selected restaurant display
            selectedRestaurantDisplay.textContent = `Selected: ${selectedRestaurant}`;
            
            // Reset order totals
            window.totalOrders = 0;
            window.totalPrice = 0;
            
            // Update the displayed totals
            updateTotals();
            
            // Clear the order list
            document.getElementById('orderList').innerHTML = '';
            
            // Load orders for this restaurant
            loadOrdersForRestaurant(selectedRestaurant);
        } else {
            selectedRestaurantDisplay.textContent = 'No restaurant selected';
        }
    });
    
    /**
     * Load orders for a specific restaurant
     */
    function loadOrdersForRestaurant(restaurant) {
        // Clear existing orders
        document.getElementById('orderList').innerHTML = '';
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Load orders from local storage
        const storedOrders = localStorage.getItem(`orders_${restaurant}_${today}`);
        
        if (storedOrders) {
            const orders = JSON.parse(storedOrders);
            
            orders.forEach(order => {
                createOrderElement(order.name, order.orderText, order.price);
            });
        }
    }
    
    // Make functions available globally
    window.loadOrdersForRestaurant = loadOrdersForRestaurant;
    window.selectRestaurant = function(restaurantName) {
        restaurantSelect.value = restaurantName;
        const event = new Event('change');
        restaurantSelect.dispatchEvent(event);
    };
}); 