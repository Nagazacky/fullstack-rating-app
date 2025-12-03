import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('stats');
  
  // Data States
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [usersList, setUsersList] = useState([]);
  const [potentialOwners, setPotentialOwners] = useState([]); // <--- NEW: List of available owners

  // Filter States
  const [filterSearch, setFilterSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Forms State
  // We added 'owner_id' to the store form below
  const [storeForm, setStoreForm] = useState({ name: '', address: '', owner_id: '' }); 
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });

  // 1. Initial Data Fetch
  useEffect(() => {
    fetchStats();
    fetchPotentialOwners(); // <--- NEW: Get the owners list when dashboard loads
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) { console.log("Stats error"); }
  };

  // NEW FUNCTION: Fetch only users who are STORE_OWNER
  const fetchPotentialOwners = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/auth/users?role=STORE_OWNER', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPotentialOwners(res.data);
    } catch (err) { console.log("Error fetching owners"); }
  };

  // Fetch Users for the List Tab
  const fetchUsers = async () => {
    try {
      let url = `http://localhost:3000/api/auth/users?sortBy=name`;
      if (filterSearch) url += `&search=${filterSearch}`;
      if (filterRole) url += `&role=${filterRole}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsersList(res.data);
    } catch (err) { console.log("Fetch users error"); }
  };

  useEffect(() => {
    if (activeTab === 'users_list') {
      fetchUsers();
    }
  }, [activeTab, filterSearch, filterRole]);

  // NEW: Refreshes owners list when switching to "Add Store" tab
  useEffect(() => {
    if (activeTab === 'add_store') {
      fetchPotentialOwners();
    }
  }, [activeTab]);

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      // Now we send the selected owner_id along with name and address
      await axios.post('http://localhost:3000/api/stores', storeForm, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      alert("Store Added & Linked to Owner!"); 
      setStoreForm({ name: '', address: '', owner_id: '' });
    } catch (err) { 
      alert(err.response?.data?.error || "Error adding store"); 
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/auth/signup', userForm, { headers: { Authorization: `Bearer ${token}` } });
      alert("User Added!"); 
      setUserForm({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
      fetchPotentialOwners(); // Refresh the list if we just added a new owner
    } catch (err) { alert(err.response?.data?.error); }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>System Admin Dashboard</h2>
      
      {/* Navigation */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={() => setActiveTab('stats')}>Overview</button>
        <button onClick={() => setActiveTab('users_list')}>Manage Users</button>
        <button onClick={() => setActiveTab('add_store')}>Add Store</button>
        <button onClick={() => setActiveTab('add_user')}>Add User</button>
      </div>
      <hr />

      {/* 1. STATS TAB */}
      {activeTab === 'stats' && (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}><h3>Total Users: {stats.users}</h3></div>
          <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}><h3>Total Stores: {stats.stores}</h3></div>
          <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '8px' }}><h3>Total Ratings: {stats.ratings}</h3></div>
        </div>
      )}

      {/* 2. USERS LIST TAB */}
      {activeTab === 'users_list' && (
        <div>
          <div style={{ marginBottom: '15px' }}>
            <input 
              placeholder="Search by Name or Email..." 
              value={filterSearch} 
              onChange={e => setFilterSearch(e.target.value)}
              style={{ padding: '8px', marginRight: '10px', width: '250px' }}
            />
            <select onChange={e => setFilterRole(e.target.value)} style={{ padding: '8px' }}>
              <option value="">All Roles</option>
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="SYSTEM_ADMIN">Admin</option>
            </select>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.email}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. ADD STORE TAB (UPDATED) */}
      {activeTab === 'add_store' && (
        <form onSubmit={handleAddStore} style={{ maxWidth: '400px' }}>
          <h3>Add New Store</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Store Name:</label>
            <input 
              value={storeForm.name} 
              onChange={e => setStoreForm({...storeForm, name: e.target.value})} 
              required 
              style={{ display: 'block', width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Address:</label>
            <input 
              value={storeForm.address} 
              onChange={e => setStoreForm({...storeForm, address: e.target.value})} 
              required 
              style={{ display: 'block', width: '100%', padding: '8px' }}
            />
          </div>

          {/* NEW DROPDOWN TO SELECT OWNER */}
          <div style={{ marginBottom: '10px' }}>
            <label>Assign Owner:</label>
            <select 
              value={storeForm.owner_id} 
              onChange={e => setStoreForm({...storeForm, owner_id: e.target.value})}
              required
              style={{ display: 'block', width: '100%', padding: '8px' }}
            >
              <option value="">-- Select Store Owner --</option>
              {potentialOwners.length === 0 && <option disabled>No Store Owners found. Create one first!</option>}
              {potentialOwners.map(owner => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white' }}>Create Store</button>
        </form>
      )}

      {/* 4. ADD USER TAB */}
      {activeTab === 'add_user' && (
        <form onSubmit={handleAddUser} style={{ maxWidth: '400px' }}>
          <h3>Add New User</h3>
          <input placeholder="Name (Min 20 chars)" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input placeholder="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input placeholder="Password" type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }} />
          <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '10px' }}>
            <option value="NORMAL_USER">Normal User</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="SYSTEM_ADMIN">System Admin</option>
          </select>
          <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white' }}>Create User</button>
        </form>
      )}
    </div>
  );
};

export default AdminDashboard;