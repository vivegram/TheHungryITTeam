// Google Sheets API configuration
const SPREADSHEET_ID = '1jyH_xabjV4b_5Kvuh-LYaRSXFkPBsPo3L15cy1WjjOI';
const API_KEY = 'AIzaSyBvurpo433IqQFAasjdf1PLHEvEVoddWK4';
const SHEET_NAME = 'Restaurants'; // The name of the sheet containing restaurant names

/**
 * Load restaurants from Google Sheets
 */
function loadRestaurantsFromSheet() {
    // Initialize the Google API client
    gapi.load('client', initClient);
}

/**
 * Initialize the Google API client
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    }).then(function() {
        // API is initialized, fetch restaurants
        fetchRestaurants();
    }).catch(function(error) {
        console.error('Error initializing Google Sheets API:', error);
        // Load default restaurants as fallback
        loadDefaultRestaurants();
    });
}

/**
 * Fetch restaurants from Google Sheets
 */
function fetchRestaurants() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:A`, // Assuming restaurant names are in column A, starting from row 2
    }).then(function(response) {
        const range = response.result;
        if (range.values && range.values.length > 0) {
            // Clear existing options except the default one
            const restaurantSelect = document.getElementById('restaurantSelect');
            restaurantSelect.innerHTML = '';
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Select a restaurant --';
            restaurantSelect.appendChild(defaultOption);
            
            // Add restaurants from Google Sheets
            range.values.forEach(function(row) {
                const restaurantName = row[0];
                if (restaurantName) {
                    addRestaurantToDropdown(restaurantName);
                }
            });
        } else {
            console.log('No restaurants found in Google Sheets.');
            loadDefaultRestaurants();
        }
    }).catch(function(error) {
        console.error('Error fetching restaurants from Google Sheets:', error);
        loadDefaultRestaurants();
    });
}

/**
 * Add a restaurant to the dropdown menu
 * @param {string} restaurantName - The name of the restaurant to add
 */
function addRestaurantToDropdown(restaurantName) {
    const restaurantSelect = document.getElementById('restaurantSelect');
    const option = document.createElement('option');
    option.value = restaurantName;
    option.textContent = restaurantName;
    restaurantSelect.appendChild(option);
}

/**
 * Load default restaurants as fallback
 */
function loadDefaultRestaurants() {
    const defaultRestaurants = [
        'Burger Place',
        'Pizza Corner',
        'Sushi Bar',
        'Taco Shop',
        'Salad Bowl'
    ];
    
    // Clear existing options except the default one
    const restaurantSelect = document.getElementById('restaurantSelect');
    restaurantSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select a restaurant --';
    restaurantSelect.appendChild(defaultOption);
    
    // Add default restaurants
    defaultRestaurants.forEach(function(restaurantName) {
        addRestaurantToDropdown(restaurantName);
    });
} 