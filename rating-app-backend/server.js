const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // Import the DB connection
const authRoutes = require('./routes/authRoutes'); // Import the routes
const storeRoutes = require('./routes/storeRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/stores', storeRoutes);
app.use('/api/admin', adminRoutes);

// Test Connection on Start
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL Database!'))
  .catch(err => console.error('❌ Database connection error:', err));

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});