# Lunch Order Collector with Google Maps Integration

This is a web application built with HTML, CSS, and JavaScript that helps collect and organize lunch orders from coworkers. It saves all orders to Google Sheets for easy tracking and reference, and uses Google Maps Places API to search for local restaurants.

## 🌟 Features

- Search for local restaurants using Google Places API
- Select from search results or common restaurants
- Save favorite orders by restaurant
- Quickly reuse favorite orders with one click
- Add orders with name, food item, and price
- Delete orders if needed
- Track total number of orders and total price
- Data persists in Google Sheets
- Orders are organized by restaurant and date
- Google account authentication

## 🚀 Getting Started

### Prerequisites

- A Google account
- A Google Cloud project with the following APIs enabled:
  - Google Sheets API
  - Google Maps JavaScript API

### Setup

1. **Clone the repository**
   ```
   git clone https://github.com/yourusername/lunch-order-collector.git
   cd lunch-order-collector
   ```

2. **Configure Google API Integration**

   a. **Create a Google Cloud Project**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable the Google Sheets API and Google Maps JavaScript API for your project

   b. **Create API Credentials**:
   - In your Google Cloud project, go to "APIs & Services" > "Credentials"
   - Create an API Key (this will be used for both Sheets and Maps)
   - Create an OAuth 2.0 Client ID (Web application type)
   - Add your application's domain to the authorized JavaScript origins

   c. **Create a Google Sheet**:
   - Create a new Google Sheet
   - The app will automatically create separate sheets for each restaurant
   - Copy the spreadsheet ID from the URL (it's the long string between /d/ and /edit in the URL)

   d. **Update the Configuration**:
   - Open the `googleSheets.js` file
   - Replace the values for `SPREADSHEET_ID`, `API_KEY`, and `CLIENT_ID` with your actual values
   - Open the `index.html` file
   - Replace the API key in the Google Maps script tag with your actual API key

## 💻 Usage

1. Open the `index.html` file in your web browser (through a local server)
2. Click "Sign In with Google" and authorize the application
3. Search for a restaurant using the search bar or select one from the dropdown menu
4. Enter your name, your order, and the price (optional)
5. Click the "Add Order" button to add your order to the list
6. The app will automatically calculate the total number of orders and total price
7. All orders are saved to Google Sheets and organized by restaurant and date

### Restaurant Search

The app provides two ways to select a restaurant:

1. **Search for Local Restaurants**:
   - Type a restaurant name or location in the search bar
   - The app will use Google Places API to find matching restaurants
   - Select a restaurant from the search results

2. **Select from Common Restaurants**:
   - Choose from the dropdown list of commonly ordered restaurants
   - This is useful for frequently visited places

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

## 🛠️ Development

### Running Locally

You can run this app locally by opening the `index.html` file in any modern web browser. However, for the Google API integrations to work properly, you'll need to:

1. Host the app on a web server (even locally)
2. Configure your Google Cloud project with the correct origins
3. Set up the API keys and credentials as described above

### Customizing the App

You can easily customize this app for your team:

1. **Add More Common Restaurants**:
   - Edit the `index.html` file to add more restaurant options to the dropdown menu

2. **Modify the Order Form**:
   - Add additional fields like special instructions or dietary preferences
   - Change the styling in the CSS file to match your company branding

3. **Add Features**:
   - Implement order sorting or filtering
   - Add a feature to export the day's orders as a PDF
   - Create a view for order history

## 📚 Learning Points

This application demonstrates several key web development concepts:

- HTML structure and semantic elements
- CSS styling and layout
- JavaScript DOM manipulation
- Event handling
- Google Sheets API integration
- Google Maps Places API integration
- OAuth 2.0 authentication
- Local storage for user preferences
- Asynchronous JavaScript with Promises
- Responsive design 