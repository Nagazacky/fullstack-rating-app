const pool = require('../config/db');

// 1. Get All Stores (With Search & Average Rating)
exports.getAllStores = async (req, res) => {
  const { search } = req.query; // ?search=Pizza

  try {
    let query = `
      SELECT s.id, s.name, s.address, 
      COALESCE(AVG(r.rating), 0) as overall_rating, -- Calculate Average
      COUNT(r.rating) as rating_count
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;
    
    // Add Search Filter if provided
    const values = [];
    if (search) {
      query += ` WHERE s.name ILIKE $1 OR s.address ILIKE $1`; // ILIKE is case-insensitive
      values.push(`%${search}%`);
    }

    query += ` GROUP BY s.id ORDER BY overall_rating DESC`; // Sort by highest rating

    const stores = await pool.query(query, values);
    res.json(stores.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 2. Add a New Store (Admin Only)
exports.createStore = async (req, res) => {
  const { name, address, owner_id } = req.body;

  try {
    // Validation: Address Max 400 chars [cite: 64]
    if (address.length > 400) {
      return res.status(400).json({ error: "Address cannot exceed 400 characters" });
    }

    const newStore = await pool.query(
      'INSERT INTO stores (name, address, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, address, owner_id]
    );
    res.json(newStore.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 3. Rate a Store (Upsert: Create or Update)
exports.rateStore = async (req, res) => {
  const { storeId } = req.params; // from URL /stores/:storeId/rate
  const { rating } = req.body; // 1-5
  const userId = req.user.id; // from the Token

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be between 1 and 5" });
  }

  try {
    // Check if user already rated this store
    const existingRating = await pool.query(
      'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingRating.rows.length > 0) {
      // Update existing rating [cite: 52]
      await pool.query(
        'UPDATE ratings SET rating = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND store_id = $3',
        [rating, userId, storeId]
      );
      return res.json({ message: "Rating updated successfully" });
    } else {
      // Create new rating 
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
        [userId, storeId, rating]
      );
      return res.json({ message: "Rating submitted successfully" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// 4. Get Dashboard Stats for Store Owner
exports.getOwnerDashboard = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Find the store owned by this user
    const storeRes = await pool.query('SELECT * FROM stores WHERE owner_id = $1', [userId]);
    
    if (storeRes.rows.length === 0) {
      return res.status(404).json({ error: "You do not own any store yet." });
    }

    const store = storeRes.rows[0];

    // 2. Get all ratings for this store, including User details
    const ratingsRes = await pool.query(`
      SELECT r.rating, u.name as user_name, u.email 
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
    `, [store.id]);

    // 3. Calculate Average
    const avgRes = await pool.query(`
      SELECT AVG(rating) as average_rating 
      FROM ratings WHERE store_id = $1
    `, [store.id]);

    res.json({
      storeName: store.name,
      address: store.address,
      averageRating: avgRes.rows[0].average_rating || 0,
      ratings: ratingsRes.rows // List of users who rated
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};