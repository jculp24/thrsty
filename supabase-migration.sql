-- THRSTY App Supabase Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table to store additional user information
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vendors table to store soda fountain/freestyle machine locations
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Coca-Cola Freestyle', 'Pepsi Spire', 'Classic Soda Fountain'
  description TEXT,
  rating NUMERIC(2,1),
  is_featured BOOLEAN DEFAULT false,
  logo_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drinks table for menu items at each vendor
CREATE TABLE public.drinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL, -- 'Popular', 'Signature', 'Classics', 'Seasonal'
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table to track user orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id),
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'
  pickup_time TEXT, -- Estimated pickup time
  total_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items table to track items in each order
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  drink_id UUID NOT NULL REFERENCES public.drinks(id),
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL, -- Price at time of order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table to notify users and vendors
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id), -- NULL if it's for a vendor
  vendor_id UUID REFERENCES public.vendors(id), -- NULL if it's for a user
  type TEXT NOT NULL, -- 'new_order', 'status_update', 'pickup_reminder'
  message TEXT NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Set up Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own data
CREATE POLICY "Users can view own data" ON public.users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

-- Vendors are publicly viewable
CREATE POLICY "Vendors are viewable by everyone" ON public.vendors
  FOR SELECT USING (true);

-- Authenticated users with vendor role can manage vendor data
CREATE POLICY "Vendor admins can manage vendor data" ON public.vendors
  USING (auth.uid() IN (
    SELECT user_id FROM vendor_admins WHERE vendor_id = vendors.id
  ));

-- Drinks are publicly viewable
CREATE POLICY "Drinks are viewable by everyone" ON public.drinks
  FOR SELECT USING (true);

-- Authenticated users with vendor role can manage drink data
CREATE POLICY "Vendor admins can manage drink data" ON public.drinks
  USING (auth.uid() IN (
    SELECT user_id FROM vendor_admins WHERE vendor_id = drinks.vendor_id
  ));

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vendors can view orders for their location
CREATE POLICY "Vendors can view their orders" ON public.orders
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM vendor_admins WHERE vendor_id = orders.vendor_id
  ));

-- Vendors can update order status
CREATE POLICY "Vendors can update order status" ON public.orders
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM vendor_admins WHERE vendor_id = orders.vendor_id
  ));

-- Order items policies
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM orders WHERE id = order_items.order_id
    )
  );

CREATE POLICY "Vendors can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN vendor_admins va ON o.vendor_id = va.vendor_id
      WHERE o.id = order_items.order_id AND va.user_id = auth.uid()
    )
  );

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Vendors can view their notifications" ON public.notifications
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM vendor_admins WHERE vendor_id = notifications.vendor_id
    )
  );

-- Create a helper table for vendor administrators
CREATE TABLE public.vendor_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin', -- 'admin', 'staff'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, user_id)
);

ALTER TABLE public.vendor_admins ENABLE ROW LEVEL SECURITY;

-- Add function to handle order status updates and notifications
CREATE OR REPLACE FUNCTION public.handle_order_status_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the order's updated_at timestamp
  NEW.updated_at := CURRENT_TIMESTAMP;
  
  -- Create a notification for the user
  IF OLD.status <> NEW.status THEN
    INSERT INTO public.notifications (
      user_id,
      vendor_id,
      type,
      message,
      order_id,
      is_read
    ) VALUES (
      NEW.user_id,
      NULL,
      'status_update',
      'Your order #' || NEW.id || ' status has been updated to ' || NEW.status,
      NEW.id,
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order status updates
CREATE TRIGGER on_order_status_update
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_order_status_update();

-- Add function to handle new orders and vendor notifications
CREATE OR REPLACE FUNCTION public.handle_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a notification for the vendor
  INSERT INTO public.notifications (
    user_id,
    vendor_id,
    type,
    message,
    order_id,
    is_read
  ) VALUES (
    NULL,
    NEW.vendor_id,
    'new_order',
    'New order #' || NEW.id || ' received',
    NEW.id,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new orders
CREATE TRIGGER on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_order();
