// app.js
import React, { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  doc,
  deleteDoc,
  setDoc 
} from "firebase/firestore";
import { auth, db } from './firebase';

const LunchPlannerApp = () => {
  // User authentication state
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);

  // App state
  const [preferences, setPreferences] = useState([]);
  const [newPreference, setNewPreference] = useState('');
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState(['Me', 'Coworker']);
  const [selectedUser, setSelectedUser] = useState('Me');
  const [selectedDate, setSelectedDate] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        // Load data when user logs in
        loadUserData(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // Set default date to today
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  }, []);

  // Handle authentication
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      if (isRegistering) {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Initialize user data
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          createdAt: new Date()
        });
      } else {
        // Login existing user
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      // Clear form
      setEmail('');
      setPassword('');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPreferences([]);
      setFavorites([]);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Load user data from Firestore
  const loadUserData = async (userId) => {
    try {
      // Load preferences
      const preferencesQuery = query(collection(db, "preferences"), where("userId", "==", userId));
      const preferencesSnapshot = await getDocs(preferencesQuery);
      const preferencesData = preferencesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPreferences(preferencesData);
      
      // Load favorites
      const favoritesQuery = query(collection(db, "favorites"), where("userId", "==", userId));
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoritesData = favoritesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFavorites(favoritesData);
      
      // Load team users
      const usersQuery = query(collection(db, "teamUsers"), where("createdBy", "==", userId));
      const usersSnapshot = await getDocs(usersQuery);
      if (!usersSnapshot.empty) {
        const usersData = usersSnapshot.docs[0].data();
        if (usersData.names && usersData.names.length > 0) {
          setUsers(usersData.names);
        }
      }
    } catch (error) {
      console.error("Error loading user data: ", error);
    }
  };

  // Add preference to Firestore
  const addPreference = async () => {
    if (newPreference.trim() === '' || !user) return;
    
    try {
      const newEntry = {
        text: newPreference,
        user: selectedUser,
        date: selectedDate,
        timestamp: new Date().toISOString(),
        userId: user.uid
      };
      
      const docRef = await addDoc(collection(db, "preferences"), newEntry);
      
      setPreferences([...preferences, {
        id: docRef.id,
        ...newEntry,
        timestamp: new Date().toLocaleString() // For display
      }]);
      
      setNewPreference('');
    } catch (error) {
      console.error("Error adding preference: ", error);
    }
  };

  // Delete preference from Firestore
  const deletePreference = async (id) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, "preferences", id));
      setPreferences(preferences.filter(preference => preference.id !== id));
    } catch (error) {
      console.error("Error deleting preference: ", error);
    }
  };

  // Add team member
  const addNewUser = async () => {
    if (userName.trim() === '' || !user) return;
    if (users.includes(userName)) return;
    
    const updatedUsers = [...users, userName];
    setUsers(updatedUsers);
    setUserName('');
    
    try {
      // Save to Firestore
      const usersQuery = query(collection(db, "teamUsers"), where("createdBy", "==", user.uid));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        // Create new document if none exists
        await addDoc(collection(db, "teamUsers"), {
          names: updatedUsers,
          createdBy: user.uid
        });
      } else {
        // Update existing document
        const docId = usersSnapshot.docs[0].id;
        await setDoc(doc(db, "teamUsers", docId), {
          names: updatedUsers,
          createdBy: user.uid
        });
      }
    } catch (error) {
      console.error("Error saving team users: ", error);
    }
  };

  // Add favorite restaurant to Firestore
  const addFavoriteRestaurant = async () => {
    if (newRestaurant.trim() === '' || !user) return;
    
    try {
      const newFavorite = {
        name: newRestaurant,
        user: selectedUser,
        userId: user.uid
      };
      
      const docRef = await addDoc(collection(db, "favorites"), newFavorite);
      
      setFavorites([...favorites, {
        id: docRef.id,
        ...newFavorite
      }]);
      
      setNewRestaurant('');
    } catch (error) {
      console.error("Error adding favorite: ", error);
    }
  };

  // Delete favorite from Firestore
  const deleteFavorite = async (id) => {
    if (!user) return;
    
    try {
      await deleteDoc(doc(db, "favorites", id));
      setFavorites(favorites.filter(fav => fav.id !== id));
    } catch (error) {
      console.error("Error deleting favorite: ", error);
    }
  };

  const selectFavorite = (restaurantName) => {
    setNewPreference(restaurantName);
  };

  // Filter preferences by date
  const filteredPreferences = preferences.filter(pref => pref.date === selectedDate);
  
  // Filter favorites by user
  const userFavorites = favorites.filter(fav => fav.user === selectedUser);

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

  // Authentication form 
  if (!user) {
    return (
      <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-4">
          <BurgerIcon />
          <h1 className="text-2xl font-bold text-center ml-2">The Hungry IT Team</h1>
        </div>
        
        <div className="bg-white rounded-md shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{isRegistering ? "Create Account" : "Login"}</h2>
          
          {authError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleAuth}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
                minLength="6"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 mb-4"
            >
              {isRegistering ? "Sign Up" : "Log In"}
            </button>
          </form>
          
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full text-center text-blue-500 hover:text-blue-700"
          >
            {isRegistering ? "Already have an account? Log in" : "Need an account? Sign up"}
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Main app
  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-4">
        <BurgerIcon />
        <h1 className="text-2xl font-bold text-center ml-2">The Hungry IT Team</h1>
      </div>
      
      {/* User info */}
      <div className="mb-4 p-3 bg-white rounded-md shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Logged in as:</span>
            <div className="font-medium truncate">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300"
          >
            Log Out
          </button>
        </div>
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
    </div>
  );
};

export default LunchPlannerApp;
