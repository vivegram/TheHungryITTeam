# Lunch Order Collector

This is a web application built with HTML, CSS, and JavaScript that helps collect and organize lunch orders from coworkers. It loads restaurants from Google Sheets and saves orders to Google Sheets for easy tracking and reference.

## 🌟 Features

- Load restaurants from Google Sheets (no authentication required)
- Save all orders to a single, filterable Google Sheet
- Built-in filters for date, restaurant, and other order details
- Beautiful visual feedback with saving indicators and success messages
- Formatted Google Sheets with headers, timestamps, and auto-sized columns
- Save favorite orders by restaurant
- Quickly reuse favorite orders with one click
- Add orders with name, food item, and price
- Delete orders if needed
- Track total number of orders and total price
- Orders are organized by restaurant and date
- No authentication required
- Robust error handling with helpful messages
- **Restaurant Selection**: Choose from a list of restaurants loaded from Google Sheets
- **Order Management**: Add and remove orders with names and prices
- **Favorites System**: Save and quickly access favorite restaurants
- **Weekly Reports**: Generate comprehensive weekly reports with statistics and analytics
- **Google Sheets Integration**: All data is automatically saved to Google Sheets

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- A Google Cloud project with the Google Sheets API enabled (for restaurant data and order saving)

### Setup

1. **Clone the repository**
   ```
   git clone https://github.com/vivegram/TheHungryITTeam.git
   cd TheHungryITTeam
   ```

2. **Configure Google API Integration**

   a. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Sheets API for your project:
     - In the left sidebar, click on "APIs & Services" > "Library"
     - Search for "Google Sheets API"
     - Click on it and then click "Enable"

   b. **Create API Credentials**:
   - In your Google Cloud project, go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" and select "API Key"
   - A new API key will be created. Copy this key.
   - (Optional but recommended) Restrict the API key:
     - Click on the newly created API key
     - Under "API restrictions", select "Restrict key"
     - Select "Google Sheets API" from the dropdown
     - Click "Save"

   c. **Create a Google Sheet**:
   - Create a new Google Sheet
   - Create a sheet named "Restaurants" with restaurant names in column A
   - Make sure the spreadsheet is publicly accessible:
     - Click "Share" in the top right corner
     - Click "Change to anyone with the link"
     - Make sure "Editor" is selected (this is required for saving orders)
     - Click "Done"
   - Copy the spreadsheet ID from the URL (it's the long string between /d/ and /edit in the URL)
     - For example, in `https://docs.google.com/spreadsheets/d/1jyH_xabjV4b_5Kvuh-LYaRSXFkPBsPo3L15cy1WjjOI/edit`, the ID is `1jyH_xabjV4b_5Kvuh-LYaRSXFkPBsPo3L15cy1WjjOI`

   d. **Update the Configuration**:
   - Open the `restaurantLoader.js` and `orderSaver.js` files
   - Replace the values for `SPREADSHEET_ID` and `API_KEY` with your actual values in both files:
     ```javascript
     const SPREADSHEET_ID = 'your-spreadsheet-id';
     const API_KEY = 'your-api-key';
     ```

## 💻 Usage

1. Open the `index.html` file in your web browser (through a local server)
2. The app will automatically load restaurants from Google Sheets
3. Select a restaurant from the dropdown
4. Enter your name, your order, and the price (optional)
5. Click the "Add Order" button to add your order to the list
6. The app will automatically calculate the total number of orders and total price
7. All orders are saved to Google Sheets and organized by restaurant and date

### Order Management

Orders are saved to Google Sheets for easy reference:

1. **Saving Orders to Google Sheets**:
   - When you add or delete an order, it's automatically saved to Google Sheets
   - All orders are stored in a single "Orders" sheet with columns for Date, Restaurant, Name, Order, Price, and Timestamp
   - The sheet includes built-in filters to easily sort and filter orders by any column
   - The sheet is formatted with colored headers and auto-sized columns for better readability
   - Visual feedback is provided during saving with a spinner and success/error messages

2. **Order Organization and Filtering**:
   - Orders are organized in a single sheet with all necessary information
   - Use the built-in filters to:
     - View orders for a specific date
     - Filter by restaurant name
     - Find orders from a specific person
     - Sort by price or timestamp
   - Headers are frozen for easier navigation when you have many orders
   - When adding new orders for a restaurant on a specific date, any existing orders for that combination are automatically updated

### Restaurant Management

Restaurants are loaded from Google Sheets:

1. **Restaurants from Google Sheets**:
   - Restaurants are loaded from the "Restaurants" sheet in your Google Sheet
   - If the Google Sheets API fails to load, default restaurants will be shown

2. **Select from Existing Restaurants**:
   - Choose from the dropdown list of restaurants
   - This includes both restaurants from Google Sheets and default fallback restaurants

### Favorite Orders

The app allows users to save and reuse their favorite orders:

1. **Saving a Favorite Order**:
   - Select a restaurant
   - Enter your name, order, and price
   - Click the "Save as Favorite" button
   - The order will be saved as your favorite for that restaurant

2. **Using a Favorite Order**:
   - Your saved favorites appear in the "Your Favorite Orders" section
   - Click on any favorite to automatically fill in the order form
   - If the restaurant doesn't match the currently selected one, you'll be asked if you want to switch
   - You can then click "Add Order" to add it to the current order list

## Weekly Reports

The app includes a powerful weekly report feature that provides insights into lunch orders:

1. Click the "Generate Weekly Report" button to create a new report
2. The report includes:
   - Total number of orders for the week
   - Total amount spent
   - Average order price
   - Orders broken down by restaurant
   - Orders broken down by person
   - Daily totals

The report is automatically formatted with:
- Clear section headers
- Color-coded sections
- Proper number formatting
- Easy-to-read date ranges

Reports are saved in a separate "Weekly Report" sheet in your Google Spreadsheet, making it easy to track trends and analyze spending patterns.

## 🛠️ Development

### Running Locally

You can run this app locally by opening the `index.html` file in any modern web browser. However, for the Google Sheets API to work properly, you'll need to:

1. Host the app on a web server (even locally):
   - You can use Python's built-in HTTP server:
     ```
     # Python 3
     python -m http.server 8000
     
     # Python 2
     python -m SimpleHTTPServer 8000
     ```
   - Or use Node.js with a package like `http-server`:
     ```
     # Install http-server globally
     npm install -g http-server
     
     # Run the server
     http-server -p 8000
     ```
   - Then open `http://localhost:8000` in your browser

2. Configure your Google Cloud project:
   - Make sure the Google Sheets API is enabled
   - If you've restricted your API key to specific domains, add `localhost` to the list of authorized domains

3. Make sure your Google Sheet is publicly accessible:
   - Anyone with the link should be able to edit the sheet (required for saving orders)
   - The sheet should have a tab named "Restaurants" with restaurant names in column A

4. If you encounter any issues:
   - Check the browser console for error messages
   - Verify that your API key and spreadsheet ID are correct
   - Ensure that the Google Sheets API is enabled in your Google Cloud project
   - Make sure your spreadsheet is publicly accessible with edit permissions
   - Look for specific error messages in the app's UI for guidance on fixing issues

### Customizing the App

You can easily customize this app for your team:

1. **Add More Default Restaurants**:
   - Edit the `restaurantLoader.js` file to add more default restaurants to the `defaultRestaurants` array

2. **Modify the Order Form**:
   - Add additional fields like special instructions or dietary preferences
   - Change the styling in the CSS file to match your company branding

3. **Add Features**:
   - Implement additional filtering or sorting options
   - Add a feature to export the day's orders as a PDF
   - Create a view for order history

## 📚 Learning Points

This application demonstrates several key web development concepts:

- HTML structure and semantic elements
- CSS styling and layout with animations and visual feedback
- JavaScript DOM manipulation
- Event handling
- Google Sheets API integration (read and write)
- Data filtering and organization
- Local storage for user preferences and favorites
- Asynchronous JavaScript with Promises
- Error handling and user feedback
- Responsive design 