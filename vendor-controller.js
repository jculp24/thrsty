const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.getAllVendors = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*');
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getVendorMenu = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if vendor exists
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (vendorError) throw vendorError;
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    // Get menu items for this vendor
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('vendor_id', id);
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      count: data.length,
      data: {
        vendor,
        menu: data
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { name, location, category, description, rating, is_featured } = req.body;
    
    const { data, error } = await supabase
      .from('vendors')
      .insert([
        { name, location, category, description, rating, is_featured }
      ])
      .select();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, category, description, rating, is_featured } = req.body;
    
    const { data, error } = await supabase
      .from('vendors')
      .update({ name, location, category, description, rating, is_featured })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      message: 'Vendor deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};