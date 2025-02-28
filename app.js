// Global variables for order tracking
window.totalOrders = 0;
window.totalPrice = 0;

// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const nameInput = document.getElementById('nameInput');
    const orderInput = document.getElementById('orderInput');
    const priceInput = document.getElementById('priceInput');
    const addOrderButton = document.getElementById('addOrder');
    const orderList = document.getElementById('orderList');
    const restaurantSelect = document.getElementById('restaurantSelect');
    const selectedRestaurantDisplay = document.getElementById('selectedRestaurant');
    
    // Add event listener to the restaurant select dropdown
    restaurantSelect.addEventListener('change', function() {
        const selectedRestaurant = restaurantSelect.value;
        
        if (selectedRestaurant) {
            // Use the selectRestaurant function from placesAPI.js
            selectRestaurant(selectedRestaurant);
        } else {
            selectedRestaurantDisplay.textContent = 'No restaurant selected';
        }
    });
    
    // Add event listener to the add order button
    addOrderButton.addEventListener('click', addOrder);
    
    // Add event listener for the Enter key in the input fields
    const inputFields = [nameInput, orderInput, priceInput];
    inputFields.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addOrder();
            }
        });
    });
    
    // Function to add a new order
    function addOrder() {
        const name = nameInput.value.trim();
        const orderText = orderInput.value.trim();
        const priceText = priceInput.value.trim();
        
        // Get the selected restaurant (either from dropdown or search)
        const selectedRestaurantText = selectedRestaurantDisplay.textContent;
        const selectedRestaurant = selectedRestaurantText.startsWith('Selected:') 
            ? selectedRestaurantText.replace('Selected:', '').trim() 
            : '';
        
        if (name === '' || orderText === '' || selectedRestaurant === '') {
            alert('Please enter your name, order, and select a restaurant.');
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
        
        // Create a new order
        createOrderElement(name, orderText, price);
        
        // Clear the input fields
        nameInput.value = '';
        orderInput.value = '';
        priceInput.value = '';
        
        // Save orders to Google Sheets if authenticated
        if (gapi.client && gapi.client.getToken() !== null) {
            saveOrdersToSheet(selectedRestaurant);
        }
    }
    
    // Function to create a new order element
    window.createOrderElement = function(name, orderText, price) {
        // Create list item
        const orderItem = document.createElement('li');
        orderItem.className = 'order-item';
        
        // Create order details div
        const orderDetails = document.createElement('div');
        orderDetails.className = 'order-details';
        
        // Create name span
        const nameSpan = document.createElement('div');
        nameSpan.className = 'order-name';
        nameSpan.textContent = name;
        
        // Create order text span
        const orderTextSpan = document.createElement('div');
        orderTextSpan.className = 'order-text';
        orderTextSpan.textContent = orderText;
        
        // Create price span
        const priceSpan = document.createElement('div');
        priceSpan.className = 'order-price';
        priceSpan.textContent = price > 0 ? `$${price.toFixed(2)}` : '';
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function() {
            orderItem.remove();
            
            // Update totals
            window.totalOrders--;
            window.totalPrice -= price;
            updateTotals();
            
            // Save orders to Google Sheets if authenticated
            const selectedRestaurantText = selectedRestaurantDisplay.textContent;
            const selectedRestaurant = selectedRestaurantText.startsWith('Selected:') 
                ? selectedRestaurantText.replace('Selected:', '').trim() 
                : '';
                
            if (gapi.client && gapi.client.getToken() !== null && selectedRestaurant) {
                saveOrdersToSheet(selectedRestaurant);
            }
        });
        
        // Append elements to the order details
        orderDetails.appendChild(nameSpan);
        orderDetails.appendChild(orderTextSpan);
        orderDetails.appendChild(priceSpan);
        
        // Append elements to the order item
        orderItem.appendChild(orderDetails);
        orderItem.appendChild(deleteBtn);
        
        // Append the order item to the order list
        orderList.appendChild(orderItem);
        
        // Update totals
        window.totalOrders++;
        window.totalPrice += price;
        updateTotals();
    };
    
    // Function to update the totals display
    window.updateTotals = function() {
        document.getElementById('totalOrders').textContent = window.totalOrders;
        document.getElementById('totalPrice').textContent = window.totalPrice.toFixed(2);
    };
}); 