// Google Sheets API configuration
// Using the same configuration as restaurantLoader.js
const SPREADSHEET_ID = '1jyH_xabjV4b_5Kvuh-LYaRSXFkPBsPo3L15cy1WjjOI';
const API_KEY = 'AIzaSyBvurpo433IqQFAasjdf1PLHEvEVoddWK4';

// Track if we're currently saving to avoid multiple simultaneous saves
let isSaving = false;

/**
 * Save orders to Google Sheets
 * @param {string} restaurant - The restaurant name
 * @param {Array} orders - Array of order objects
 */
function saveOrdersToSheet(restaurant, orders) {
    // If already saving, don't start another save operation
    if (isSaving) {
        console.log("Already saving orders, please wait...");
        return;
    }
    
    // Set saving flag
    isSaving = true;
    
    console.log("Saving orders to Google Sheets...");
    showSavingIndicator();
    
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
            showErrorMessage('Could not connect to Google Sheets to save orders. Please check your internet connection and try again.');
            isSaving = false;
            hideSavingIndicator();
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
        
        // Check if it's a permission error
        if (error.status === 403) {
            showErrorMessage('Permission denied. Make sure your Google Sheet is shared with "Anyone with the link" as Editor.');
        } else if (error.status === 404) {
            showErrorMessage('Spreadsheet not found. Check your spreadsheet ID in the configuration.');
        } else {
            showErrorMessage('Could not access Google Sheets. Please check your internet connection and try again.');
        }
        
        isSaving = false;
        hideSavingIndicator();
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
                        title: sheetName,
                        gridProperties: {
                            frozenRowCount: 1 // Freeze the header row
                        }
                    }
                }
            }]
        }
    }).then(function(response) {
        console.log('Sheet created:', response);
        
        // Add headers to the new sheet with formatting
        gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [
                    // Format header row
                    {
                        repeatCell: {
                            range: {
                                sheetId: response.result.replies[0].addSheet.properties.sheetId,
                                startRowIndex: 0,
                                endRowIndex: 1
                            },
                            cell: {
                                userEnteredFormat: {
                                    backgroundColor: {
                                        red: 0.2,
                                        green: 0.6,
                                        blue: 0.9
                                    },
                                    textFormat: {
                                        bold: true,
                                        foregroundColor: {
                                            red: 1.0,
                                            green: 1.0,
                                            blue: 1.0
                                        }
                                    }
                                }
                            },
                            fields: "userEnteredFormat(backgroundColor,textFormat)"
                        }
                    },
                    // Auto-resize columns
                    {
                        autoResizeDimensions: {
                            dimensions: {
                                sheetId: response.result.replies[0].addSheet.properties.sheetId,
                                dimension: "COLUMNS",
                                startIndex: 0,
                                endIndex: 4
                            }
                        }
                    }
                ]
            }
        }).then(function() {
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
                showErrorMessage('Could not add headers to sheet. Please try again later.');
                isSaving = false;
                hideSavingIndicator();
            });
        }).catch(function(error) {
            console.error('Error formatting sheet:', error);
            // Continue anyway since this is just formatting
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
                showErrorMessage('Could not add headers to sheet. Please try again later.');
                isSaving = false;
                hideSavingIndicator();
            });
        });
    }).catch(function(error) {
        console.error('Error creating sheet:', error);
        
        // Check if it's a permission error
        if (error.status === 403) {
            showErrorMessage('Permission denied. Make sure your Google Sheet is shared with "Anyone with the link" as Editor.');
        } else {
            showErrorMessage('Could not create a new sheet. Please check your permissions and try again.');
        }
        
        isSaving = false;
        hideSavingIndicator();
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
        // If there are no orders, we're done
        if (orders.length === 0) {
            console.log('No orders to save');
            showSuccessMessage('Orders updated in Google Sheets successfully!');
            isSaving = false;
            hideSavingIndicator();
            return;
        }
        
        // Prepare the order data
        const values = orders.map(order => {
            const timestamp = new Date().toLocaleString();
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
            showSuccessMessage(`${orders.length} order${orders.length === 1 ? '' : 's'} saved to Google Sheets successfully!`);
            isSaving = false;
            hideSavingIndicator();
        }).catch(function(error) {
            console.error('Error saving orders to sheet:', error);
            showErrorMessage('Could not save orders to Google Sheets. Please try again later.');
            isSaving = false;
            hideSavingIndicator();
        });
    }).catch(function(error) {
        console.error('Error clearing sheet data:', error);
        showErrorMessage('Could not update the sheet. Please check your permissions and try again.');
        isSaving = false;
        hideSavingIndicator();
    });
}

/**
 * Show a saving indicator
 */
function showSavingIndicator() {
    // Remove any existing saving indicator
    const existingIndicator = document.querySelector('.saving-indicator');
    if (existingIndicator) {
        existingIndicator.parentNode.removeChild(existingIndicator);
    }
    
    const savingIndicator = document.createElement('div');
    savingIndicator.className = 'saving-indicator';
    savingIndicator.innerHTML = '<span class="spinner"></span> Saving orders...';
    document.querySelector('.order-summary').appendChild(savingIndicator);
}

/**
 * Hide the saving indicator
 */
function hideSavingIndicator() {
    const savingIndicator = document.querySelector('.saving-indicator');
    if (savingIndicator && savingIndicator.parentNode) {
        savingIndicator.parentNode.removeChild(savingIndicator);
    }
}

/**
 * Show an error message to the user
 */
function showErrorMessage(message) {
    // Remove any existing error messages
    const existingMessages = document.querySelectorAll('.error-message');
    existingMessages.forEach(msg => {
        if (msg.parentNode) {
            msg.parentNode.removeChild(msg);
        }
    });
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    document.querySelector('.order-summary').appendChild(errorMessage);
    
    // Scroll to the error message
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
        if (errorMessage.parentNode) {
            errorMessage.parentNode.removeChild(errorMessage);
        }
    }, 8000); // Show error for longer (8 seconds)
}

/**
 * Show a success message to the user
 */
function showSuccessMessage(message) {
    // Remove any existing success messages
    const existingMessages = document.querySelectorAll('.success-message');
    existingMessages.forEach(msg => {
        if (msg.parentNode) {
            msg.parentNode.removeChild(msg);
        }
    });
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;
    document.querySelector('.order-summary').appendChild(successMessage);
    
    setTimeout(() => {
        if (successMessage.parentNode) {
            successMessage.parentNode.removeChild(successMessage);
        }
    }, 5000); // Show success for 5 seconds
} 