const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');

// Utility function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// Register Controller
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create the new user (password will be hashed automatically by the pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate JWT token
    const token = generateToken(user._id);

    // Respond with user details and token
    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err.message); // Log error for debugging
    return res.status(500).json({ error: 'Server error' });
  }
};

// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email); // Debugging log
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare the password using the comparePassword method from the schema
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email); // Debugging log
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Respond with user details and token
    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err.message); // Log the actual error
    return res.status(500).json({ error: 'Server error' });
  }
};


// Login Controller
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Validate input
//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required' });
//     }

//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     // Compare the password using the comparePassword method from the schema
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     // Generate JWT token
//     const token = generateToken(user._id);

//     // Respond with user details and token
//     return res.status(200).json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error('Login error:', err.message); // Log the actual error
//     return res.status(500).json({ error: 'Server error' });
//   }
// };









// const User = require('../models/userModel');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

// // Utility function to generate JWT token
// const generateToken = (userId) => {
//   return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
// };

// // Register Controller
// exports.register = async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'Email already in use' });
//     }

//     // Create the new user
//     const hashedPassword = await bcrypt.hash(password, 10); // Hash password
//     const user = await User.create({ name, email, password: hashedPassword });

//     // Generate JWT token
//     const token = generateToken(user._id);

//     // Respond with user details and token
//     return res.status(201).json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error('Register error:', err.message);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };

// // Login Controller
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required' });
//     }

//     // Find the user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     // Generate JWT token
//     const token = generateToken(user._id);

//     // Respond with user details and token
//     return res.status(200).json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error('Login error:', err.message);
//     return res.status(500).json({ error: 'Server error' });
//   }
// };

// // Middleware to protect routes
// exports.protect = async (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Extract token from header

//   if (!token) {
//     return res.status(401).json({ error: 'Not authorized, no token' });
//   }

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach the user to the request
//     req.user = await User.findById(decoded.id).select('-password');

//     if (!req.user) {
//       return res.status(401).json({ error: 'Not authorized' });
//     }

//     next();
//   } catch (err) {
//     console.error('Token verification error:', err.message);
//     return res.status(401).json({ error: 'Token is invalid' });
//   }
// };
