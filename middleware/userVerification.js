const jwt = require('jsonwebtoken');
const User = require("../models/user");

// Middleware for token verification and user retrieval
const userVerification = async (req, res, next) => {
  try {
    // Retrieve token from cookies
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, authorization denied.' 
      });
    }

    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    
    // If verified, find user (assuming you have a user model)
    const user = await User.findOne({email: verified.email}).select('-password').select('-pin');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    };

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    // Generic error handler
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication',
      error: error.message 
    });
  }
};

module.exports = userVerification;

