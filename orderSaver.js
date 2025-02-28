// Google Sheets API configuration
// Using the same configuration as restaurantLoader.js
const SPREADSHEET_ID = '1jyH_xabjV4b_5Kvuh-LYaRSXFkPBsPo3L15cy1WjjOI';
const API_KEY = 'AIzaSyBvurpo433IqQFAasjdf1PLHEvEVoddWK4';

/**
 * Save orders to Google Sheets
 * @param {string} restaurant - The restaurant name
 * @param {Array} orders - Array of order objects
 */
function saveOrdersToSheet(restaurant, orders) {
    console.log("Saving orders to Google Sheets...");
    
    // Format today's date as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize the Google API client if not already initialized
    if (!gapi.client) {
        console.log("Google API client not initialized, initializing now...");
        initializeAndSaveOrders(restaurant, orders, today);
        return;
    }
    
    // Check if the sheet exists, if not create it
    checkAndCreateSheet(restaurant, orders, today);
}

/**
 * Initialize Google API client and save orders
 */
function initializeAndSaveOrders(restaurant, orders, today) {
    gapi.load('client', function() {
        gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        }).then(function() {
            console.log("Google API client initialized successfully for saving orders");
            checkAndCreateSheet(restaurant, orders, today);
        }).catch(function(error) {
            console.error('Error initializing Google Sheets API for saving orders:', error);
            showErrorMessage('Could not connect to Google Sheets to save orders. Orders are still saved locally.');
        });
    });
}

/**
 * Check if a sheet exists for the restaurant and date, create if not
 */
function checkAndCreateSheet(restaurant, orders, today) {
    const sheetName = `${restaurant}_${today}`;
    
    // First, check if the sheet exists
    gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    }).then(function(response) {
        const sheets = response.result.sheets;
        let sheetExists = false;
        
        for (let i = 0; i < sheets.length; i++) {
            if (sheets[i].properties.title === sheetName) {
                sheetExists = true;
                break;
            }
        }
        
        if (sheetExists) {
            // Sheet exists, update it
            updateOrdersInSheet(sheetName, orders);
        } else {
            // Sheet doesn't exist, create it
            createSheetAndSaveOrders(sheetName, orders);
        }
    }).catch(function(error) {
        console.error('Error checking if sheet exists:', error);
        showErrorMessage('Could not check if sheet exists. Orders are still saved locally.');
    });
}

/**
 * Create a new sheet and save orders
 */
function createSheetAndSaveOrders(sheetName, orders) {
    gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
            requests: [{
                addSheet: {
                    properties: {
                        title: sheetName
                    }
                }
            }]
        }
    }).then(function(response) {
        console.log('Sheet created:', response);
        
        // Add headers to the new sheet
        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A1:D1`,
            valueInputOption: 'RAW',
            resource: {
                values: [['Name', 'Order', 'Price', 'Timestamp']]
            }
        }).then(function() {
            // Now save the orders
            updateOrdersInSheet(sheetName, orders);
        }).catch(function(error) {
            console.error('Error adding headers to sheet:', error);
            showErrorMessage('Could not add headers to sheet. Orders are still saved locally.');
        });
    }).catch(function(error) {
        console.error('Error creating sheet:', error);
        showErrorMessage('Could not create sheet. Orders are still saved locally.');
    });
}

/**
 * Update orders in an existing sheet
 */
function updateOrdersInSheet(sheetName, orders) {
    // First, clear existing data (except headers)
    gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A2:D1000` // Clear a large range to ensure all data is removed
    }).then(function() {
        // Prepare the order data
        const values = orders.map(order => {
            const timestamp = new Date().toISOString();
            return [order.name, order.orderText, order.price.toString(), timestamp];
        });
        
        // Update the sheet with the new data
        gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A2:D${1 + values.length}`,
            valueInputOption: 'RAW',
            resource: {
                values: values
            }
        }).then(function(response) {
            console.log('Orders saved to Google Sheets:', response);
            showSuccessMessage('Orders saved to Google Sheets successfully!');
        }).catch(function(error) {
            console.error('Error saving orders to sheet:', error);
            showErrorMessage('Could not save orders to Google Sheets. Orders are still saved locally.');
        });
    }).catch(function(error) {
        console.error('Error clearing sheet data:', error);
        showErrorMessage('Could not clear existing sheet data. Orders are still saved locally.');
    });
}

/**
 * Show an error message to the user
 */
function showErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    document.querySelector('.order-summary').appendChild(errorMessage);
    setTimeout(() => {
        if (errorMessage.parentNode) {
            errorMessage.parentNode.removeChild(errorMessage);
        }
    }, 5000);
}

/**
 * Show a success message to the user
 */
function showSuccessMessage(message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;
    document.querySelector('.order-summary').appendChild(successMessage);
    setTimeout(() => {
        if (successMessage.parentNode) {
            successMessage.parentNode.removeChild(successMessage);
        }
    }, 3000);
} 