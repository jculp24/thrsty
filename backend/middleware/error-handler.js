// File: /backend/middleware/error-handler.js
/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle Supabase errors
  if (err.code && err.message) {
    return res.status(err.code >= 400 && err.code < 600 ? err.code : 400).json({
      success: false,
      message: err.message,
      code: err.code
    });
  }
  
  // Handle other errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;

// File: /backend/middleware/validate.js
/**
 * Validation middleware using express-validator
 */
const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check if there are validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // Return validation errors
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  };
};

module.exports = validate;

// File: /backend/middleware/auth-middleware.js (improved)
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid token.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Set user data in request
    req.user = data.user;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user is vendor admin
exports.isVendorAdmin = async (req, res, next) => {
  try {
    // First check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const vendorId = req.params.vendorId || req.body.vendor_id;
    
    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Vendor ID is required'
      });
    }
    
    // Check if user is vendor admin
    const { data, error } = await supabase
      .from('vendor_admins')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('user_id', req.user.id)
      .single();
    
    if (error || !data) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as a vendor admin'
      });
    }
    
    // Add vendor admin role to request
    req.vendorAdmin = data;
    next();
  } catch (error) {
    next(error);
  }
};

// File: /backend/controllers/authController.js (improved)
const { createClient } = require('@supabase/supabase-js');
const { body } = require('express-validator');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Validation rules
exports.signupValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required')
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Controllers
exports.signup = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name, phone_number } = req.body;
    
    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          phone_number
        }
      }
    });
    
    if (authError) throw authError;
    
    // Store additional user info in 'users' table
    if (authData.user) {
      const { error: userError } = await supabase
        .from('users')
        .insert([
          { 
            id: authData.user.id,
            first_name,
            last_name,
            email,
            phone_number
          }
        ]);
      
      if (userError) throw userError;
    }
    
    res.status(201).json({
      success: true,
      message: authData.user ? 'User registered successfully' : 'Confirmation email sent',
      data: authData
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    // User should already be set by the auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    // Get additional user data from 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (userError) throw userError;
    
    res.status(200).json({
      success: true,
      data: {
        ...req.user,
        user_details: userData
      }
    });
  } catch (error) {
    next(error);
  }
};

// File: /backend/index.js (improved)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

// Import middleware
const errorHandler = require('./middleware/error-handler');
const { protect } = require('./middleware/auth-middleware');

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL
    : true
}));

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Parse JSON body
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const vendorsRoutes = require('./routes/vendors');
const ordersRoutes = require('./routes/orders');
const notificationsRoutes = require('./routes/notifications');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/orders', protect, ordersRoutes);
app.use('/api/notifications', protect, notificationsRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('THRSTY API is running');
});

// Error handler middleware (should be after routes)
app.use(error
