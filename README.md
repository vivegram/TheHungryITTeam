# Lunch Order Collector

This is a web application built with HTML, CSS, and JavaScript that helps collect and organize lunch orders from coworkers. It loads restaurants from Google Sheets and saves orders locally for easy tracking.

## 🌟 Features

- Load restaurants from Google Sheets (no authentication required)
- Save favorite orders by restaurant
- Quickly reuse favorite orders with one click
- Add orders with name, food item, and price
- Delete orders if needed
- Track total number of orders and total price
- Orders are saved in local storage
- Orders are organized by restaurant and date
- No authentication required

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- A Google Cloud project with the Google Sheets API enabled (for restaurant data)

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
   - Enable the Google Sheets API for your project

   b. **Create API Credentials**:
   - In your Google Cloud project, go to "APIs & Services" > "Credentials"
   - Create an API Key (restrict it to Google Sheets API only)
   - Add your application's domain to the authorized JavaScript origins

   c. **Create a Google Sheet**:
   - Create a new Google Sheet
   - Create a sheet named "Restaurants" with restaurant names in column A
   - Make sure the sheet is publicly accessible (at least for reading)
   - Copy the spreadsheet ID from the URL (it's the long string between /d/ and /edit in the URL)

   d. **Update the Configuration**:
   - Open the `restaurantLoader.js` file
   - Replace the values for `SPREADSHEET_ID` and `API_KEY` with your actual values

## 💻 Usage

1. Open the `index.html` file in your web browser (through a local server)
2. The app will automatically load restaurants from Google Sheets
3. Select a restaurant from the dropdown
4. Enter your name, your order, and the price (optional)
5. Click the "Add Order" button to add your order to the list
6. The app will automatically calculate the total number of orders and total price
7. All orders are saved to local storage and organized by restaurant and date

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

## 🛠️ Development

### Running Locally

You can run this app locally by opening the `index.html` file in any modern web browser. However, for the Google Sheets API to work properly, you'll need to:

1. Host the app on a web server (even locally)
2. Configure your Google Cloud project with the correct origins
3. Set up the API key as described above
4. Make sure your Google Sheet is publicly accessible for reading

### Customizing the App

You can easily customize this app for your team:

1. **Add More Default Restaurants**:
   - Edit the `restaurantLoader.js` file to add more default restaurants to the `defaultRestaurants` array

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
- Google Sheets API integration (read-only)
- Local storage for user data and preferences
- Asynchronous JavaScript with Promises
- Responsive design 