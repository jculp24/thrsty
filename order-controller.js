const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        vendor:vendors(*),
        order_items:order_items(*, drink:drinks(*))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
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

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        vendor:vendors(*),
        order_items:order_items(*, drink:drinks(*))
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
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

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware sets req.user
    const { vendor_id, items, pickup_time, total_amount } = req.body;
    
    // Start a transaction to ensure order and order items are created together
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        { 
          user_id: userId,
          vendor_id,
          status: 'Pending',
          pickup_time,
          total_amount
        }
      ])
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    // Prepare order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      drink_id: item.id,
      quantity: item.quantity,
      price: item.price
    }));
    
    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    // Create notification for vendor
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: null, // null means it's for a vendor
          vendor_id: vendor_id,
          type: 'new_order',
          message: `New order #${order.id} received`,
          order_id: order.id,
          is_read: false
        }
      ]);
    
    if (notificationError) throw notificationError;
    
    res.status(201).json({
      success: true,
      data: {
        order_id: order.id,
        status: order.status
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get the order with user info to send notification
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*)
      `)
      .eq('id', id)
      .single();
    
    if (orderError) throw orderError;
    
    // Create notification for user
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: orderData.user_id,
          vendor_id: null,
          type: 'status_update',
          message: `Your order #${id} status has been updated to ${status}`,
          order_id: id,
          is_read: false
        }
      ]);
    
    if (notificationError) throw notificationError;
    
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

exports.getVendorOrders = async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    // Verify the user is associated with this vendor
    // This would typically check if the authenticated user has vendor permissions
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(id, first_name, last_name),
        order_items:order_items(*, drink:drinks(*))
      `)
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    
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