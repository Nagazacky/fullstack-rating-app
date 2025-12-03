const jwt = require('jsonwebtoken');
const JWT_SECRET = 'super_secret_key_123'; // Must match the one in authController

// 1. Check if the user is Logged In
const verifyToken = (req, res, next) => {
  const tokenHeader = req.header('Authorization');
  
  if (!tokenHeader) return res.status(401).json({ error: "Access Denied: No Token Provided" });

  try {
    // The token usually comes as "Bearer <token>", so we split it
    const token = tokenHeader.split(" ")[1];
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // We attach the user info (id, role) to the request
    next(); // Pass to the next function
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

// 2. Check if the user is an Admin
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({ error: "Access Denied: You are not an Admin" });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };