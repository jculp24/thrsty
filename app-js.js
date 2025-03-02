// File: src/App.js
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ThrstyApp from './components/ThrstyApp';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThrstyApp />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

// File: src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
        
        if (data.user) {
          await fetchUserData(data.user.id);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Set up listener for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchUserData(currentUser.id);
        } else {
          setUserData(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      if (authListener && authListener.unsubscribe) {
        authListener.unsubscribe();
      }
    };
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, firstName, lastName, phone) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              email,
              phone_number: phone
            }
          ]);
          
        if (profileError) throw profileError;
      }
      
      return { success: true, data: authData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userData,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// File: src/contexts/CartContext.js
import React, { createContext, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  const addToCart = (item, vendor) => {
    // Store vendor info with the item for pickup location
    const itemWithVendor = {
      ...item,
      vendorId: vendor?.id,
      vendorName: vendor?.name,
      vendorLocation: vendor?.location
    };
    
    const existingItem = cartItems.find(i => i.id === item.id);
    if (existingItem) {
      setCartItems(cartItems.map(i => 
        i.id === item.id ? {...i, quantity: i.quantity + 1} : i
      ));
    } else {
      setCartItems([...cartItems, {...itemWithVendor, quantity: 1}]);
    }
  };

  const updateQuantity = (id, change) => {
    const updatedCart = cartItems.map(item => 
      item.id === id ? {...item, quantity: Math.max(0, item.quantity + change)} : item
    ).filter(item => item.quantity > 0);
    
    setCartItems(updatedCart);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const placeOrder = async () => {
    if (!user || cartItems.length === 0) {
      return { success: false, message: 'User not logged in or cart is empty' };
    }
    
    try {
      // Calculate total amount
      const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = total * 0.085;
      const totalWithTax = total + tax;
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user.id,
            vendor_id: cartItems[0].vendorId,
            status: 'Pending',
            pickup_time: '15-20 min',
            total_amount: totalWithTax
          }
        ])
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        drink_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
      
      // Clear cart
      clearCart();
      
      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Error placing order:', error);
      return { success: false, message: error.message };
    }
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    clearCart,
    placeOrder,
    totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// File: src/services/api.js
import { supabase } from '../supabaseClient';

export const vendorService = {
  getAll: async () => {
    const { data, error } = await supabase.from('vendors').select('*');
    if (error) throw error;
    return data;
  },
  
  getById: async (id) => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  
  getMenu: async (vendorId) => {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('vendor_id', vendorId);
    if (error) throw error;
    return data;
  }
};

export const orderService = {
  getUserOrders: async (userId) => {
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
    return data;
  },
  
  getById: async (orderId) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        vendor:vendors(*),
        order_items:order_items(*, drink:drinks(*))
      `)
      .eq('id', orderId)
      .single();
    if (error) throw error;
    return data;
  }
};

// File: src/components/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { MapPin, Search, ArrowRight, Star } from 'lucide-react';
import { vendorService } from '../../services/api';
import VendorCard from '../common/VendorCard';

const HomeScreen = ({ navigateTo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const categories = [
    { id: 1, name: 'Cola', icon: '🥤' },
    { id: 2, name: 'Diet Cola', icon: '🥤' },
    { id: 3, name: 'Flavored', icon: '🍋' },
    { id: 4, name: 'Lemon-Lime', icon: '🍈' },
    { id: 5, name: 'Root Beer', icon: '🍺' },
  ];
  
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await vendorService.getAll();
        setVendors(data);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendors();
  }, []);
  
  // Filter vendors by search query
  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get featured vendors
  const featuredVendors = filteredVendors.filter(v => v.is_featured);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="pb-4">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">THRSTY</h1>
            <div className="flex items-center mt-1">
              <MapPin size={16} />
              <span className="ml-1 text-sm">Current Location</span>
            </div>
          </div>
        </div>
        
        {/* Search bar */}
        <div className="mt-4 bg-white rounded-full flex items-center px-4 py-2 text-gray-700">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for drinks or vendors..." 
            className="ml-2 flex-1 outline-none bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Categories */}
      <div className="px-4 py-3">
        <h2 className="text-lg font-semibold mb-3">Categories</h2>
        <div className="flex overflow-x-auto pb-2 -mx-1">
          {categories.map(category => (
            <div key={category.id} className="flex flex-col items-center mx-2 min-w-fit">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl">
                {category.icon}
              </div>
              <span className="mt-1 text-xs text-center">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Featured Vendors */}
      {featuredVendors.length > 0 && (
        <div className="px-4 mt-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Featured Vendors</h2>
            <button className="text-blue-600 text-sm flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          
          {featuredVendors.map(vendor => (
            <VendorCard 
              key={vendor.id} 
              vendor={vendor} 
              onClick={() => navigateTo('vendor', vendor)} 
              featured
            />
          ))}
        </div>
      )}
      
      {/* Nearby Vendors */}
      <div className="px-4 mt-4">
        <h2 className="text-lg font-semibold mb-3">Nearby Vendors</h2>
        
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">
            No vendors found matching your search.
          </div>
        ) : (
          filteredVendors.map(vendor => (
            <VendorCard 
              key={vendor.id} 
              vendor={vendor} 
              onClick={() => navigateTo('vendor', vendor)} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HomeScreen;

// File: src/components/common/VendorCard.js
import React from 'react';
import { MapPin, Star } from 'lucide-react';

const VendorCard = ({ vendor, onClick, featured = false }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow mb-3 p-3 flex cursor-pointer"
      onClick={onClick}
    >
      <img 
        src={vendor.image_url || '/api/placeholder/80/80'} 
        alt={vendor.name} 
        className={featured ? "w-20 h-20 rounded-lg object-cover" : "w-16 h-16 rounded-lg object-cover"}
      />
      <div className="ml-3 flex-1">
        <div className="flex justify-between">
          <h3 className={featured ? "font-bold" : "font-semibold"}>{vendor.name}</h3>
          <div className="flex items-center text-yellow-500">
            <Star size={featured ? 16 : 14} fill="currentColor" />
            <span className="ml-1 text-sm text-gray-700">{vendor.rating}</span>
          </div>
        </div>
        <p className={featured ? "text-sm text-gray-500" : "text-xs text-gray-500"}>{vendor.category}</p>
        <div className={`flex items-center mt-${featured ? '2' : '1'} text-${featured ? 'sm' : 'xs'} text-gray-500`}>
          <MapPin size={featured ? 14 : 12} />
          <span className="ml-1">{vendor.location}</span>
          {featured && (
            <div className="bg-blue-100 text-blue-800 ml-2 px-2 py-0.5 rounded-full text-xs">
              Quick Pickup
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(VendorCard);
