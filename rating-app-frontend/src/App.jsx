import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard'; // <--- NEW IMPORT

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ fontFamily: 'Arial' }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* The line below is what changed */}
            <Route path="/dashboard" element={<Dashboard />} /> 
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;