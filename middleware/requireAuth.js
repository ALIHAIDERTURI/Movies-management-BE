const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Retrieve the user using the decoded ID, excluding the password
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Pass the control to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Authorization error:', err.message);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = requireAuth;
