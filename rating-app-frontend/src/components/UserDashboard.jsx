import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useContext(AuthContext);

  // 1. Fetch Stores from Backend
  useEffect(() => {
    fetchStores();
  }, [searchTerm]);

  const fetchStores = async () => {
    try {
      // If we have a search term, send it to the backend
      const url = searchTerm 
        ? `http://localhost:3000/api/stores?search=${searchTerm}` 
        : 'http://localhost:3000/api/stores';
        
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStores(res.data);
    } catch (err) {
      console.error("Error fetching stores", err);
    }
  };

  // 2. Handle Rating Submission
  const handleRate = async (storeId, ratingValue) => {
    try {
      await axios.post(`http://localhost:3000/api/stores/${storeId}/rate`, 
        { rating: parseInt(ratingValue) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Rating submitted!");
      fetchStores(); // Refresh to show new average
    } catch (err) {
      alert("Error submitting rating");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Stores List</h2>
      
      {/* Search Bar */}
      <input 
        type="text" 
        placeholder="Search stores..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '8px', width: '300px', marginBottom: '20px' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {stores.map(store => (
          <div key={store.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>{store.name}</h3>
            <p><strong>Address:</strong> {store.address}</p>
            <p><strong>Avg Rating:</strong> ⭐ {parseFloat(store.overall_rating).toFixed(1)} / 5</p>
            
            <div style={{ marginTop: '10px' }}>
              <label>Rate this store: </label>
              <select onChange={(e) => handleRate(store.id, e.target.value)} defaultValue="">
                <option value="" disabled>Select</option>
                <option value="1">1 - Poor</option>
                <option value="2">2 - Fair</option>
                <option value="3">3 - Good</option>
                <option value="4">4 - Very Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;