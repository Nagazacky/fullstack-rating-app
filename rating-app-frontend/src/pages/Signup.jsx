import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend Validation Check (Matches Backend)
    if (formData.name.length < 20 || formData.name.length > 60) {
      setError("Name must be between 20 and 60 characters.");
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/auth/signup', formData);
      alert("Signup Successful! Please login.");
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name (Min 20 chars):</label><br />
          <input name="name" onChange={handleChange} required minLength="20" maxLength="60" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input name="email" type="email" onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label><br />
          <input name="password" type="password" onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Address:</label><br />
          <input name="address" onChange={handleChange} maxLength="400" style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none' }}>
          Sign Up
        </button>
      </form>
      <p style={{ marginTop: '10px' }}>
        Already have an account? <Link to="/">Login here</Link>
      </p>
    </div>
  );
};

export default Signup;