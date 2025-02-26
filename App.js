import React, { useState, useEffect } from 'react';

const LunchPlannerApp = () => {
  const [preferences, setPreferences] = useState([]);
  const [newPreference, setNewPreference] = useState('');
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState(['Me', 'Coworker']);
  const [selectedUser, setSelectedUser] = useState('Me');
  const [selectedDate, setSelectedDate] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [importData, setImportData] = useState('');
  const [showImport, setShowImport] = useState(false);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  }, []);

  // Functions for managing preferences
  const addPreference = () => {
    if (newPreference.trim() === '') return;
    
    const newEntry = {
      id: Date.now(),
      text: newPreference,
      user: selectedUser,
      date: selectedDate,
      timestamp: new Date().toLocaleString()
    };
    
    setPreferences([...preferences, newEntry]);
    setNewPreference('');
  };

  const deletePreference = (id) => {
    setPreferences(preferences.filter(preference => preference.id !== id));
  };

  // Functions for managing users
  const addNewUser = () => {
    if (userName.trim() === '') return;
    if (users.includes(userName)) return;
    
    setUsers([...users, userName]);
    setUserName('');
  };

  // Functions for managing favorites
  const addFavoriteRestaurant = () => {
    if (newRestaurant.trim() === '') return;
    
    const newFavorite = {
      id: Date.now(),
      name: newRestaurant,
      user: selectedUser
    };
    
    setFavorites([...favorites, newFavorite]);
    setNewRestaurant('');
  };

  const deleteFavorite = (id) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  const selectFavorite = (restaurantName) => {
    setNewPreference(restaurantName);
  };

  // Filter preferences by date
  const filteredPreferences = preferences.filter(pref => pref.date === selectedDate);
  
  // Filter favorites by user
  const userFavorites = favorites.filter(fav => fav.user === selectedUser);

  // Export data as JSON string for sharing
  const exportData = () => {
    const data = {
      preferences,
      favorites,
      users
    };
    
    const jsonString = JSON.stringify(data);
    setShareLink(jsonString);
  };

  // Import data from JSON string
  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      
      if (data.preferences) setPreferences(data.preferences);
      if (data.favorites) setFavorites(data.favorites);
      if (data.users) setUsers(data.users);
      
      setImportData('');
      setShowImport(false);
    } catch (error) {
      alert('Invalid data format. Please check the imported data.');
    }
  };

  // Burger Icon SVG
  const BurgerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="40" height="40">
      <path d="M50,20H14c-1.1,0-2,0.9-2,2v2c0,1.1,0.9,2,2,2h36c1.1,0,2-0.9,2-2v-2C52,20.9,51.1,20,50,20z" fill="#8B4513" />
      <path d="M52,34H12c-1.1,0-2,0.9-2,2v2c0,1.1,0.9,2,2,2h40c1.1,0,2-0.9,2-2v-2C54,34.9,53.1,34,52,34z" fill="#8B4513" />
      <path d="M54,27H10c-3.3,0-6,2.7-6,6s2.7,6,6,6h44c3.3,0,6-2.7,6-6S57.3,27,54,27z" fill="#F4A460" />
      <circle cx="15" cy="30" r="2" fill="#228B22" />
      <circle cx="25" cy="33" r="2" fill="#FF6347" />
      <circle cx="35" cy="28" r="2" fill="#F4A460" />
      <circle cx="45" cy="32" r="2" fill="#228B22" />
      <path d="M56,46H8c-2.2,0-4,1.8-4,4v2c0,2.2,1.8,4,4,4h48c2.2,0,4-1.8,4-4v-2C60,47.8,58.2,46,56,46z" fill="#F4A460" />
      <path d="M54,40H10c-3.3,0-6,2.7-6,6s2.7,6,6,6h44c3.3,0,6-2.7,6-6S57.3,40,54,40z" fill="#FFD700" />
    </svg>
  );

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-4">
        <BurgerIcon />
        <h1 className="text-2xl font-bold text-center ml-2">The Hungry IT Team</h1>
      </div>
      
      {/* Date Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
      
      {/* User Management */}
      <div className="mb-4 p-3 bg-white rounded-md shadow-md">
        <div className="flex items-center mb-2">
          <label className="block text-sm font-medium mr-2">Add Team Member:</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="New team member"
            className="flex-1 px-3 py-1 border rounded-md mr-2"
          />
          <button 
            onClick={addNewUser}
            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Select Team Member:</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex mb-4">
        <button 
          className={`flex-1 py-2 ${!showFavorites ? 'bg-orange-500 text-white' : 'bg-gray-200'} rounded-l-md`}
          onClick={() => setShowFavorites(false)}
        >
          Today's Lunch
        </button>
        <button 
          className={`flex-1 py-2 ${showFavorites ? 'bg-orange-500 text-white' : 'bg-gray-200'} rounded-r-md`}
          onClick={() => setShowFavorites(true)}
        >
          Favorites
        </button>
      </div>
      
      {!showFavorites ? (
        <>
          {/* New Preference Input */}
          <div className="mb-4 p-3 bg-white rounded-md shadow-md">
            <label className="block text-sm font-medium mb-1">
              What does {selectedUser} want for lunch today?
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                value={newPreference}
                onChange={(e) => setNewPreference(e.target.value)}
                placeholder="Enter lunch preference..."
                className="flex-1 px-3 py-2 border rounded-md mr-2"
                onKeyPress={(e) => e.key === 'Enter' && addPreference()}
              />
              <button
                onClick={addPreference}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Add
              </button>
            </div>
            
            {userFavorites.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">Quick select from favorites:</p>
                <div className="flex flex-wrap gap-1">
                  {userFavorites.map(fav => (
                    <button
                      key={fav.id}
                      onClick={() => selectFavorite(fav.name)}
                      className="bg-gray-200 text-sm px-2 py-1 rounded-md hover:bg-gray-300"
                    >
                      {fav.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Preferences List */}
          <div className="bg-white rounded-md shadow-md p-3">
            <h2 className="text-lg font-semibold mb-2">Today's Team Lunch Picks</h2>
            {filteredPreferences.length === 0 ? (
              <p className="text-gray-500 italic">No preferences added for this date yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredPreferences.map(preference => (
                  <li key={preference.id} className="py-2">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">{preference.user}: </span>
                        <span>{preference.text}</span>
                        <div className="text-xs text-gray-500">{preference.timestamp}</div>
                      </div>
                      <button
                        onClick={() => deletePreference(preference.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Favorites Management */}
          <div className="mb-4 p-3 bg-white rounded-md shadow-md">
            <h2 className="text-lg font-semibold mb-2">{selectedUser}'s Favorite Restaurants</h2>
            <div className="flex mb-4">
              <input
                type="text"
                value={newRestaurant}
                onChange={(e) => setNewRestaurant(e.target.value)}
                placeholder="Add favorite restaurant..."
                className="flex-1 px-3 py-2 border rounded-md mr-2"
                onKeyPress={(e) => e.key === 'Enter' && addFavoriteRestaurant()}
              />
              <button
                onClick={addFavoriteRestaurant}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Save
              </button>
            </div>
            
            {/* Favorites List */}
            {userFavorites.length === 0 ? (
              <p className="text-gray-500 italic">No favorites added yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {userFavorites.map(favorite => (
                  <li key={favorite.id} className="py-2">
                    <div className="flex justify-between items-center">
                      <span>{favorite.name}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => selectFavorite(favorite.name)}
                          className="bg-blue-500 text-white px-2 py-1 text-sm rounded hover:bg-blue-600"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => deleteFavorite(favorite.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
      
      {/* Sharing Controls - Moved to bottom */}
      <div className="mt-6 p-3 bg-white rounded-md shadow-md">
        <h2 className="text-lg font-semibold mb-2">Share with Coworkers</h2>
        <div className="flex space-x-2 mb-2">
          <button 
            onClick={exportData} 
            className="bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 flex-1"
          >
            Export Data
          </button>
          <button 
            onClick={() => setShowImport(!showImport)} 
            className="bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 flex-1"
          >
            Import Data
          </button>
        </div>
        
        {shareLink && (
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Share this data with coworkers:</label>
            <textarea
              value={shareLink}
              readOnly
              onClick={(e) => e.target.select()}
              className="w-full px-3 py-2 border rounded-md text-xs h-24"
            />
            <p className="text-xs text-gray-500 mt-1">Copy this text and send it to your coworkers to share your lunch data</p>
          </div>
        )}
        
        {showImport && (
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Paste shared data here:</label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-xs h-24"
            />
            <button 
              onClick={handleImport} 
              className="mt-2 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
            >
              Import
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LunchPlannerApp;
