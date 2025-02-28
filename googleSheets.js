// Google Sheets API configuration
const SPREADSHEET_ID = '1jyH_xabjV4b_5Kvuh-LYaRSXFkPBsPo3L15cy1WjjOI'; // You'll need to replace this with your actual spreadsheet ID
const API_KEY = 'AIzaSyBvurpo433IqQFAasjdf1PLHEvEVoddWK4'; // You'll need to replace this with your actual API key
const CLIENT_ID = '372521150206-6a8npakvef3van165tfn9t1vvti7tqe4.apps.googleusercontent.com'; // You'll need to replace this with your actual client ID
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Variables to store API client and auth status
let gapiInited = false;
let gisInited = false;
let tokenClient;

/**
 * Initialize the Google API client
 */
function initializeGoogleAPI() {
    gapi.load('client', initializeGapiClient);
}

/**
 * Initialize the Google API client library
 */
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * Initialize the Google Identity Services client
 */
function initializeGoogleIdentity() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

/**
 * Enable buttons when both APIs are initialized
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.display = 'block';
    }
}

/**
 * Handle the sign-in flow
 */
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw resp;
        }
        document.getElementById('authorize_button').style.display = 'none';
        document.getElementById('signout_button').style.display = 'block';
        
        // Check if a restaurant is already selected
        const selectedRestaurant = document.getElementById('restaurantSelect').value;
        if (selectedRestaurant) {
            loadOrdersFromSheet(selectedRestaurant);
        }
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

/**
 * Handle the sign-out flow
 */
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        document.getElementById('authorize_button').style.display = 'block';
        document.getElementById('signout_button').style.display = 'none';
        document.getElementById('orderList').innerHTML = '';
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('totalPrice').textContent = '0.00';
    }
}

/**
 * Create a sheet for the restaurant if it doesn't exist
 */
async function ensureSheetExists(restaurant) {
    try {
        // Get the spreadsheet to check if the sheet exists
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });
        
        const sheets = response.result.sheets;
        const sheetExists = sheets.some(sheet => sheet.properties.title === restaurant);
        
        if (!sheetExists) {
            // Add a new sheet for the restaurant
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                resource: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: restaurant
                                }
                            }
                        }
                    ]
                }
            });
            
            // Add headers to the new sheet
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${restaurant}!A1:E1`,
                valueInputOption: 'RAW',
                resource: {
                    values: [['Name', 'Order', 'Price', 'Timestamp', 'Date']]
                }
            });
        }
    } catch (err) {
        console.error('Error ensuring sheet exists:', err);
    }
}

/**
 * Load orders from Google Sheet for a specific restaurant
 */
async function loadOrdersFromSheet(restaurant) {
    try {
        // Ensure the sheet exists
        await ensureSheetExists(restaurant);
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Get the orders for today
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${restaurant}!A2:E`,
        });

        // Clear existing orders
        document.getElementById('orderList').innerHTML = '';
        
        // Reset totals
        let totalOrders = 0;
        let totalPrice = 0;
        
        const range = response.result;
        if (range.values && range.values.length > 0) {
            for (let i = 0; i < range.values.length; i++) {
                const row = range.values[i];
                const orderDate = row[4] || ''; // Date column
                
                // Only show orders from today
                if (orderDate === today) {
                    const name = row[0] || '';
                    const orderText = row[1] || '';
                    const price = parseFloat(row[2]) || 0;
                    
                    // Create order element
                    createOrderElement(name, orderText, price);
                    
                    // Don't need to update totals here as createOrderElement does that
                }
            }
        }
        
    } catch (err) {
        console.error('Error loading orders from Google Sheets:', err);
    }
}

/**
 * Save orders to Google Sheet for a specific restaurant
 */
async function saveOrdersToSheet(restaurant) {
    try {
        // Ensure the sheet exists
        await ensureSheetExists(restaurant);
        
        const orders = [];
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Get all order items
        const orderItems = document.querySelectorAll('.order-item');
        
        // Loop through order items and save their details
        orderItems.forEach(function(orderItem) {
            const name = orderItem.querySelector('.order-name').textContent;
            const orderText = orderItem.querySelector('.order-text').textContent;
            const priceText = orderItem.querySelector('.order-price').textContent;
            
            // Extract price value (remove $ and convert to number)
            let price = 0;
            if (priceText) {
                price = parseFloat(priceText.replace('$', '')) || 0;
            }
            
            orders.push([
                name,
                orderText,
                price.toString(),
                new Date().toISOString(),
                today
            ]);
        });
        
        // Get existing orders for other dates (we don't want to delete them)
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${restaurant}!A2:E`,
        });
        
        const existingOrders = [];
        const range = response.result;
        if (range.values && range.values.length > 0) {
            for (let i = 0; i < range.values.length; i++) {
                const row = range.values[i];
                const orderDate = row[4] || ''; // Date column
                
                // Keep orders from other dates
                if (orderDate !== today) {
                    existingOrders.push(row);
                }
            }
        }
        
        // Combine existing orders from other dates with today's orders
        const allOrders = [...existingOrders, ...orders];
        
        // Clear the existing data
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: `${restaurant}!A2:E`,
        });
        
        // Write all the data back
        if (allOrders.length > 0) {
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: `${restaurant}!A2`,
                valueInputOption: 'RAW',
                resource: {
                    values: allOrders
                }
            });
        }
        
    } catch (err) {
        console.error('Error saving orders to Google Sheets:', err);
    }
} 