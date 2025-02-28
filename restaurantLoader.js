// Google Sheets API configuration
const SPREADSHEET_ID = '1jyH_xabjV4b_5Kvuh-LYaRSXFkPBsPo3L15cy1WjjOI';
const API_KEY = 'AIzaSyBvurpo433IqQFAasjdf1PLHEvEVoddWK4';
const SHEET_NAME = 'Restaurants'; // The name of the sheet containing restaurant names

/**
 * Load restaurants from Google Sheets
 */
function loadRestaurantsFromSheet() {
    console.log("Initializing Google API client...");
    // Initialize the Google API client
    gapi.load('client', initClient);
}

/**
 * Initialize the Google API client
 */
function initClient() {
    console.log("Setting up Google API client...");
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    }).then(function() {
        // API is initialized, fetch restaurants
        console.log("Google API client initialized successfully, fetching restaurants...");
        fetchRestaurants();
    }).catch(function(error) {
        console.error('Error initializing Google Sheets API:', error);
        
        let errorMsg = 'Could not connect to Google Sheets. Using default restaurants instead.';
        
        // Provide more specific error messages based on the error
        if (error.status === 403) {
            errorMsg = 'Access denied to Google Sheets API. Please check your API key and ensure the API is enabled in Google Cloud Console.';
            console.error('API Key issue detected. Please check that:');
            console.error('1. The Google Sheets API is enabled in your Google Cloud Console');
            console.error('2. Your API key has access to the Google Sheets API');
            console.error('3. Your spreadsheet is publicly accessible (at least for reading)');
        } else if (error.status === 404) {
            errorMsg = 'Spreadsheet not found. Please check your spreadsheet ID.';
        } else if (error.status >= 500) {
            errorMsg = 'Google Sheets service is currently unavailable. Using default restaurants instead.';
        }
        
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = errorMsg;
        document.querySelector('.restaurant-selection').appendChild(errorMessage);
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
            }
        }, 8000);
        
        // Load default restaurants as fallback
        loadDefaultRestaurants();
    });
}

/**
 * Fetch restaurants from Google Sheets
 */
function fetchRestaurants() {
    console.log("Fetching restaurants from Google Sheets...");
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:A`, // Assuming restaurant names are in column A, starting from row 2
    }).then(function(response) {
        console.log("Received response from Google Sheets:", response);
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
            
            console.log(`Successfully loaded ${range.values.length} restaurants from Google Sheets`);
        } else {
            console.log('No restaurants found in Google Sheets.');
            loadDefaultRestaurants();
        }
    }).catch(function(error) {
        console.error('Error fetching restaurants from Google Sheets:', error);
        
        let errorMsg = 'Could not fetch restaurants from Google Sheets. Using default restaurants instead.';
        
        // Provide more specific error messages based on the error
        if (error.result && error.result.error) {
            const apiError = error.result.error;
            console.error('API Error:', apiError);
            
            if (apiError.status === 'PERMISSION_DENIED') {
                errorMsg = 'Permission denied to access the spreadsheet. Please check your API key and spreadsheet permissions.';
            } else if (apiError.status === 'NOT_FOUND') {
                errorMsg = 'Spreadsheet or sheet not found. Please check your spreadsheet ID and sheet name.';
            }
        }
        
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = errorMsg;
        document.querySelector('.restaurant-selection').appendChild(errorMessage);
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
            }
        }, 8000);
        
        // Load default restaurants as fallback
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
    console.log("Loading default restaurants as fallback...");
    const defaultRestaurants = [
        'Burger Place',
        'Pizza Corner',
        'Sushi Bar',
        'Taco Shop',
        'Salad Bowl',
        'Sandwich Shop',
        'Pasta Palace',
        'Noodle House',
        'BBQ Joint',
        'Vegetarian Cafe'
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
    
    console.log(`Loaded ${defaultRestaurants.length} default restaurants`);
} 