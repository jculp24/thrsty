-- Sample data for THRSTY App

-- Add sample vendors
INSERT INTO public.vendors (name, location, category, description, rating, is_featured, image_url) VALUES 
  ('CityCenter Freestyle', '233 Main Street', 'Coca-Cola Freestyle', 'Over 100 different combinations of Coca-Cola products in our state-of-the-art machine. Mix and match flavors to create your perfect drink.', 4.8, true, 'https://images.unsplash.com/photo-1581098825914-9a5d95575f1d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ('University Spire', '500 College Ave', 'Pepsi Spire', 'Create your own custom Pepsi beverages with our touch-screen Pepsi Spire machine. Featuring all Pepsi products with add-in flavor options.', 4.6, true, 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ('Downtown Fountain', '55 Park Plaza', 'Classic Soda Fountain', 'Traditional soda fountain with classic flavors and nostalgic atmosphere. Enjoy the perfect pour every time from our trained staff.', 4.5, false, 'https://images.unsplash.com/photo-1529417305485-480f579e7578?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ('Tech Hub Beverages', '780 Innovation Drive', 'Coca-Cola Freestyle', 'Modern beverage station with touchscreen interface offering the widest selection of fountain drinks in the area. Located inside the Tech Hub food court.', 4.7, false, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600');

-- Add sample drinks for each vendor
-- For CityCenter Freestyle
INSERT INTO public.drinks (vendor_id, name, description, price, category, is_available, image_url)
VALUES
  ((SELECT id FROM public.vendors WHERE name = 'CityCenter Freestyle'), 'Cherry Vanilla Coke', 'Classic Coca-Cola with cherry and vanilla flavoring', 2.49, 'Popular', true, 'https://images.unsplash.com/photo-1605548230624-8d2d0419c517?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'CityCenter Freestyle'), 'Strawberry Sprite', 'Crisp lemon-lime Sprite with a hint of strawberry', 2.49, 'Popular', true, 'https://images.unsplash.com/photo-1625772299989-8d6bd18be002?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'CityCenter Freestyle'), 'Orange Vanilla Coke', 'Coca-Cola with a refreshing blend of orange and vanilla', 2.49, 'Signature', true, 'https://images.unsplash.com/photo-1550456866-8c383a7931d4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'CityCenter Freestyle'), 'Raspberry Fanta', 'Bubbly Fanta orange with sweet raspberry flavor', 2.49, 'Classics', true, 'https://images.unsplash.com/photo-1603394630324-3309c5ea815b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'CityCenter Freestyle'), 'Peach Mello Yello', 'Citrus Mello Yello with a smooth peach finish', 2.49, 'Seasonal', true, 'https://images.unsplash.com/photo-1606168094336-48f8f3271724?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600');

-- For University Spire
INSERT INTO public.drinks (vendor_id, name, description, price, category, is_available, image_url)
VALUES
  ((SELECT id FROM public.vendors WHERE name = 'University Spire'), 'Cherry Mountain Dew', 'Mountain Dew with a burst of cherry flavor', 2.49, 'Popular', true, 'https://images.unsplash.com/photo-1541807120430-f3f78c281225?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'University Spire'), 'Lemon Pepsi', 'Classic Pepsi with a zesty lemon twist', 2.49, 'Popular', true, 'https://images.unsplash.com/photo-1611132698696-10f46bf732f2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'University Spire'), 'Vanilla Wild Cherry Pepsi', 'Wild Cherry Pepsi with smooth vanilla notes', 2.49, 'Signature', true, 'https://images.unsplash.com/photo-1567103472667-6898f3a79cf2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'University Spire'), 'Strawberry Sierra Mist', 'Crisp Sierra Mist with sweet strawberry flavor', 2.49, 'Classics', true, 'https://images.unsplash.com/photo-1630356221483-1b978d0d1c7a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'University Spire'), 'Lime Diet Pepsi', 'Diet Pepsi with refreshing lime', 2.49, 'Seasonal', true, 'https://images.unsplash.com/photo-1621873495817-7b5875d7659a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600');

-- For Downtown Fountain
INSERT INTO public.drinks (vendor_id, name, description, price, category, is_available, image_url)
VALUES
  ((SELECT id FROM public.vendors WHERE name = 'Downtown Fountain'), 'Classic Coca-Cola', 'Original Coca-Cola formula', 1.99, 'Popular', true, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'Downtown Fountain'), 'Pepsi', 'Classic Pepsi flavor', 1.99, 'Popular', true, 'https://images.unsplash.com/photo-1629203413338-a89532f7b18b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'Downtown Fountain'), 'Dr Pepper', 'Original Dr Pepper formula', 1.99, 'Classics', true, 'https://images.unsplash.com/photo-1624517456777-ec122ee88183?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'Downtown Fountain'), 'Root Beer', 'Creamy root beer with vanilla notes', 1.99, 'Classics', true, 'https://images.unsplash.com/photo-1581064532664-851a8182e335?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'Downtown Fountain'), 'Lemonade', 'Refreshing lemonade', 1.99, 'Seasonal', true, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600');

-- For Tech Hub Beverages
INSERT INTO public.drinks (vendor_id, name, description, price, category, is_available, image_url)
VALUES
  ((SELECT id FROM public.vendors WHERE name = 'Tech Hub Beverages'), 'Lime Coke Zero', 'Zero-calorie Coca-Cola with lime', 2.49, 'Popular', true, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'Tech Hub Beverages'), 'Raspberry Diet Coke', 'Diet Coke with raspberry flavor', 2.49, 'Popular', true, 'https://images.unsplash.com/photo-1578653889051-18cfb9cf06cc?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'Tech Hub Beverages'), 'Cherry Vanilla Dr Pepper', 'Dr Pepper with cherry and vanilla', 2.49, 'Signature', true, 'https://images.unsplash.com/photo-1604429868769-11735d589856?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'Tech Hub Beverages'), 'Grape Sprite', 'Sprite with grape flavor', 2.49, 'Signature', true, 'https://images.unsplash.com/photo-1625737639858-1ff55b1426b1?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600'),
  ((SELECT id FROM public.vendors WHERE name = 'Tech Hub Beverages'), 'Peach Fanta', 'Fanta with sweet peach flavor', 2.49, 'Seasonal', true, 'https://images.unsplash.com/photo-1621873496265-3d6b05c432d2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=400&w=600');
