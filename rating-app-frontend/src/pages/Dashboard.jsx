import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Import all the dashboard components
import UserDashboard from '../components/UserDashboard';
import AdminDashboard from '../components/AdminDashboard';
import OwnerDashboard from '../components/OwnerDashboard';

const Dashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for Change Password Form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '' });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3000/api/auth/change-password', passData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Password Changed Successfully!");
      setShowPasswordForm(false);
      setPassData({ oldPassword: '', newPassword: '' });
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update password");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      {/* 1. Header Bar */}
      <div style={{ background: '#333', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Welcome, {user.name} ({user.role})</h3>
        <button onClick={handleLogout} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* 2. Change Password Section */}
      <div style={{ padding: '15px', background: '#f9f9f9', borderBottom: '1px solid #ddd' }}>
        <button onClick={() => setShowPasswordForm(!showPasswordForm)} style={{ marginBottom: '10px' }}>
          {showPasswordForm ? 'Close Password Form' : 'Change Password'}
        </button>
        
        {showPasswordForm && (
          <form onSubmit={handleChangePassword}>
            <input 
              type="password" placeholder="Old Password" required 
              value={passData.oldPassword}
              onChange={e => setPassData({...passData, oldPassword: e.target.value})}
              style={{ marginRight: '10px', padding: '5px' }}
            />
            <input 
              type="password" placeholder="New Password (Complex)" required 
              value={passData.newPassword}
              onChange={e => setPassData({...passData, newPassword: e.target.value})}
              style={{ marginRight: '10px', padding: '5px' }}
            />
            <button type="submit" style={{ padding: '5px 10px', background: '#28a745', color: '#fff', border: 'none' }}>
              Update
            </button>
          </form>
        )}
      </div>

      {/* 3. Role-Based Dashboard Switching */}
      {user.role === 'NORMAL_USER' && <UserDashboard />}
      {user.role === 'SYSTEM_ADMIN' && <AdminDashboard />}
      {user.role === 'STORE_OWNER' && <OwnerDashboard />}

    </div>
  );
};

export default Dashboard;