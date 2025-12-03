import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const OwnerDashboard = () => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/stores/owner/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Could not load dashboard");
      }
    };
    fetchData();
  }, [token]);

  if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  if (!data) return <div style={{ padding: '20px' }}>Loading your store stats...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>🏪 Owner Dashboard</h2>
      
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>{data.storeName}</h3>
        <p><strong>Address:</strong> {data.address}</p>
        <p style={{ fontSize: '20px' }}>
          <strong>Average Rating:</strong> ⭐ {parseFloat(data.averageRating).toFixed(1)} / 5
        </p>
      </div>

      <h3>Recent Customer Reviews</h3>
      {data.ratings.length === 0 ? (
        <p>No ratings yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Customer Name</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {data.ratings.map((rate, index) => (
              <tr key={index}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rate.user_name}</td>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                  {rate.rating} / 5
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OwnerDashboard;