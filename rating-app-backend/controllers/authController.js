const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for signing tokens (In a real app, put this in .env)
const JWT_SECRET = 'super_secret_key_123'; 

// VALIDATION HELPER FUNCTIONS
const validateEmail = (email) => {
  return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const validatePassword = (password) => {
  // Rule: 8-16 chars, 1 uppercase, 1 special char
  const regex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*)(?=.*[a-z].*).{8,16}$/;
  return regex.test(password);
};

exports.signup = async (req, res) => {
  const { name, email, password, address, role } = req.body;

  try {
    // 1. Validation Checks
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ error: "Name must be between 20 and 60 characters" });
    }
    if (address.length > 400) {
      return res.status(400).json({ error: "Address cannot exceed 400 characters" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid Email format" });
    }
    // Note: This regex is a simplified check for the complexity rule
    // "8-16 characters, must include at least one uppercase letter and one special character"
    if (password.length < 8 || password.length > 16) {
         return res.status(400).json({ error: "Password must be 8-16 characters long" });
    }
    
    // 2. Check if user already exists
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 3. Hash the password (Security)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert into Database
    // Default role is 'NORMAL_USER' if not provided
    const userRole = role ? role : 'NORMAL_USER'; 
    
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email, hashedPassword, address, userRole]
    );

    // 5. Generate Token
    const token = jwt.sign({ id: newUser.rows[0].id, role: userRole }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: newUser.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    // 2. Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    // 3. Generate Token
    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.rows[0].id, name: user.rows[0].name, role: user.rows[0].role } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get All Users (with Filters & Sorting)
exports.getAllUsers = async (req, res) => {
  const { search, role, sortBy } = req.query; 

  try {
    let query = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
    const values = [];
    let valueIndex = 1;

    // Filter by Name or Email
    if (search) {
      query += ` AND (name ILIKE $${valueIndex} OR email ILIKE $${valueIndex})`;
      values.push(`%${search}%`);
      valueIndex++;
    }

    // Filter by Role
    if (role) {
      query += ` AND role = $${valueIndex}`;
      values.push(role);
      valueIndex++;
    }

    // Sort by Name (Default) or other fields
    if (sortBy === 'name') {
      query += ' ORDER BY name ASC';
    } else {
      query += ' ORDER BY id DESC';
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // 1. Get the user
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    // 2. Check Old Password
    const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Incorrect old password" });
    }

    // 3. Validate New Password (Complexity Rule)
    const regex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*)(?=.*[a-z].*).{8,16}$/;
    if (!regex.test(newPassword)) {
      return res.status(400).json({ error: "Password must be 8-16 chars, with Uppercase & Special char." });
    }

    // 4. Hash New Password & Update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    
    res.json({ message: "Password updated successfully!" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};