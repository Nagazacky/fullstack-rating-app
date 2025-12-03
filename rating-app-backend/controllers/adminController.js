const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Count Total Users
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    
    // 2. Count Total Stores
    const storeCount = await pool.query('SELECT COUNT(*) FROM stores');
    
    // 3. Count Total Ratings
    const ratingCount = await pool.query('SELECT COUNT(*) FROM ratings');

    // Send the numbers back to the Frontend
    res.json({
      users: userCount.rows[0].count,
      stores: storeCount.rows[0].count,
      ratings: ratingCount.rows[0].count
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};