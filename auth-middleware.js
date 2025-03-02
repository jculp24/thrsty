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
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    // Verify token
    const { data: session, error } = await supabase.auth.getSession(token);
    
    if (error || !session) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    // Set user data in request
    const { data: { user } } = await supabase.auth.getUser(token);
    req.user = user;
    
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Middleware to check if user is vendor admin
exports.isVendorAdmin = async (req, res, next) => {
  try {
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
    
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Not authorized as a vendor admin'
    });
  }
};
