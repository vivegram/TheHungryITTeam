// Google Sheets API configuration
// Using the same configuration as restaurantLoader.js
const SPREADSHEET_ID = '1jyH_xabjV4b_5Kvuh-LYaRSXFkPBsPo3L15cy1WjjOI';
const API_KEY = 'AIzaSyBvurpo433IqQFAasjdf1PLHEvEVoddWK4';

// Track if we're currently saving to avoid multiple simultaneous saves
let isSaving = false;

// Name of the orders sheet
const ORDERS_SHEET_NAME = 'Orders';

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
    
    // Check if the Orders sheet exists, if not create it
    checkAndCreateOrdersSheet(restaurant, orders, today);
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
            checkAndCreateOrdersSheet(restaurant, orders, today);
        }).catch(function(error) {
            console.error('Error initializing Google Sheets API for saving orders:', error);
            showErrorMessage('Could not connect to Google Sheets to save orders. Please check your internet connection and try again.');
            isSaving = false;
            hideSavingIndicator();
        });
    });
}

/**
 * Check if the Orders sheet exists, create if not
 */
function checkAndCreateOrdersSheet(restaurant, orders, today) {
    // First, check if the Orders sheet exists
    gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    }).then(function(response) {
        const sheets = response.result.sheets;
        let sheetExists = false;
        let sheetId = null;
        
        for (let i = 0; i < sheets.length; i++) {
            if (sheets[i].properties.title === ORDERS_SHEET_NAME) {
                sheetExists = true;
                sheetId = sheets[i].properties.sheetId;
                break;
            }
        }
        
        if (sheetExists) {
            // Sheet exists, append orders to it
            appendOrdersToSheet(restaurant, orders, today, sheetId);
        } else {
            // Sheet doesn't exist, create it
            createOrdersSheetAndSaveOrders(restaurant, orders, today);
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
 * Create the Orders sheet and save orders
 */
function createOrdersSheetAndSaveOrders(restaurant, orders, today) {
    gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
            requests: [{
                addSheet: {
                    properties: {
                        title: ORDERS_SHEET_NAME,
                        gridProperties: {
                            frozenRowCount: 1, // Freeze the header row
                            frozenColumnCount: 0
                        }
                    }
                }
            }]
        }
    }).then(function(response) {
        console.log('Orders sheet created:', response);
        const sheetId = response.result.replies[0].addSheet.properties.sheetId;
        
        // Add headers to the new sheet with formatting
        gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [
                    // Format header row
                    {
                        repeatCell: {
                            range: {
                                sheetId: sheetId,
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
                                sheetId: sheetId,
                                dimension: "COLUMNS",
                                startIndex: 0,
                                endIndex: 6
                            }
                        }
                    }
                ]
            }
        }).then(function() {
            // Add headers to the new sheet
            gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${ORDERS_SHEET_NAME}!A1:F1`,
                valueInputOption: 'RAW',
                resource: {
                    values: [['Date', 'Restaurant', 'Name', 'Order', 'Price', 'Timestamp']]
                }
            }).then(function() {
                // Now save the orders
                appendOrdersToSheet(restaurant, orders, today, sheetId);
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
                range: `${ORDERS_SHEET_NAME}!A1:F1`,
                valueInputOption: 'RAW',
                resource: {
                    values: [['Date', 'Restaurant', 'Name', 'Order', 'Price', 'Timestamp']]
                }
            }).then(function() {
                // Now save the orders
                appendOrdersToSheet(restaurant, orders, today, sheetId);
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
            showErrorMessage('Could not create the Orders sheet. Please check your permissions and try again.');
        }
        
        isSaving = false;
        hideSavingIndicator();
    });
}

/**
 * Append orders to the Orders sheet
 */
function appendOrdersToSheet(restaurant, orders, today, sheetId) {
    // If there are no orders, we're done
    if (orders.length === 0) {
        console.log('No orders to save');
        showSuccessMessage('No orders to save to Google Sheets.');
        isSaving = false;
        hideSavingIndicator();
        return;
    }
    
    // First, get the current orders for this restaurant and date
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${ORDERS_SHEET_NAME}!A:F`
    }).then(function(response) {
        const values = response.result.values || [];
        
        // If there are existing orders for this restaurant and date, remove them
        if (values.length > 1) { // Skip header row
            // Find rows to delete
            const rowsToDelete = [];
            for (let i = 1; i < values.length; i++) {
                if (values[i][0] === today && values[i][1] === restaurant) {
                    rowsToDelete.push(i);
                }
            }
            
            // If there are rows to delete, delete them
            if (rowsToDelete.length > 0) {
                // We need to delete in reverse order to avoid shifting issues
                const deleteRequests = rowsToDelete.reverse().map(rowIndex => {
                    return {
                        deleteDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: "ROWS",
                                startIndex: rowIndex,
                                endIndex: rowIndex + 1
                            }
                        }
                    };
                });
                
                gapi.client.sheets.spreadsheets.batchUpdate({
                    spreadsheetId: SPREADSHEET_ID,
                    resource: {
                        requests: deleteRequests
                    }
                }).then(function() {
                    // Now append the new orders
                    appendNewOrders(restaurant, orders, today);
                }).catch(function(error) {
                    console.error('Error deleting existing orders:', error);
                    // Continue anyway and try to append the new orders
                    appendNewOrders(restaurant, orders, today);
                });
            } else {
                // No rows to delete, just append the new orders
                appendNewOrders(restaurant, orders, today);
            }
        } else {
            // No existing data, just append the new orders
            appendNewOrders(restaurant, orders, today);
        }
    }).catch(function(error) {
        console.error('Error getting existing orders:', error);
        // Try to append the new orders anyway
        appendNewOrders(restaurant, orders, today);
    });
}

/**
 * Append new orders to the Orders sheet
 */
function appendNewOrders(restaurant, orders, today) {
    // Prepare the order data
    const values = orders.map(order => {
        const timestamp = new Date().toLocaleString();
        return [today, restaurant, order.name, order.orderText, order.price.toString(), timestamp];
    });
    
    // Append the new orders
    gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${ORDERS_SHEET_NAME}!A:F`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
            values: values
        }
    }).then(function(response) {
        console.log('Orders saved to Google Sheets:', response);
        showSuccessMessage(`${orders.length} order${orders.length === 1 ? '' : 's'} saved to Google Sheets successfully!`);
        
        // Add filter to the sheet if it doesn't already have one
        addFilterToSheet();
    }).catch(function(error) {
        console.error('Error saving orders to sheet:', error);
        showErrorMessage('Could not save orders to Google Sheets. Please try again later.');
        isSaving = false;
        hideSavingIndicator();
    });
}

/**
 * Add filter to the Orders sheet
 */
function addFilterToSheet() {
    // Get the sheet ID for the Orders sheet
    gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    }).then(function(response) {
        const sheets = response.result.sheets;
        let sheetId = null;
        
        for (let i = 0; i < sheets.length; i++) {
            if (sheets[i].properties.title === ORDERS_SHEET_NAME) {
                sheetId = sheets[i].properties.sheetId;
                break;
            }
        }
        
        if (sheetId !== null) {
            // Add filter to the sheet
            gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                resource: {
                    requests: [
                        {
                            setBasicFilter: {
                                filter: {
                                    range: {
                                        sheetId: sheetId,
                                        startRowIndex: 0,
                                        startColumnIndex: 0,
                                        endColumnIndex: 6
                                    }
                                }
                            }
                        }
                    ]
                }
            }).then(function() {
                console.log('Filter added to Orders sheet');
                isSaving = false;
                hideSavingIndicator();
            }).catch(function(error) {
                console.error('Error adding filter to sheet:', error);
                // Not critical, so just log the error and continue
                isSaving = false;
                hideSavingIndicator();
            });
        } else {
            console.error('Could not find Orders sheet ID');
            isSaving = false;
            hideSavingIndicator();
        }
    }).catch(function(error) {
        console.error('Error getting sheet ID:', error);
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