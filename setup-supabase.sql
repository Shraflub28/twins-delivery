-- Create the orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    orderId TEXT NOT NULL UNIQUE,
    items JSONB NOT NULL,
    restaurant TEXT NOT NULL,
    customer JSONB NOT NULL,
    orderDate TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS orders_orderId_idx ON public.orders USING btree (orderId);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders USING btree (status);

-- Create a more complete restaurants table to match our JSON data
CREATE TABLE IF NOT EXISTS public.restaurants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    cuisine TEXT,
    rating DECIMAL(3, 1),
    reviews INTEGER,
    delivery_time TEXT,
    price TEXT,
    badge JSONB,
    dietary TEXT[],
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a menu_categories table
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id uuid REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(restaurant_id, name)
);

-- Create a menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid REFERENCES public.menu_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'Dh' NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a function to update the updated_at column automatically
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at on records
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at();

DROP TRIGGER IF EXISTS update_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON public.restaurants
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at();

DROP TRIGGER IF EXISTS update_menu_categories_updated_at ON public.menu_categories;
CREATE TRIGGER update_menu_categories_updated_at
BEFORE UPDATE ON public.menu_categories
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies that allow anonymous users to read and write to tables
CREATE POLICY "Allow anonymous access to orders" 
ON public.orders
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anonymous read access to restaurants" 
ON public.restaurants
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous read access to menu_categories" 
ON public.menu_categories
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anonymous read access to menu_items" 
ON public.menu_items
FOR SELECT
TO anon
USING (true);

-- Helpful comment for users
COMMENT ON TABLE public.orders IS 'Table to store all order information for Twins Delivery';
COMMENT ON TABLE public.restaurants IS 'Table to store restaurant information for Twins Delivery';
COMMENT ON TABLE public.menu_categories IS 'Table to store menu categories for restaurants';
COMMENT ON TABLE public.menu_items IS 'Table to store menu items for each category';

-- Optional: Add some test data
-- INSERT INTO public.restaurants (name, description, categories) 
-- VALUES 
--     ('Test Restaurant 1', 'A test restaurant', ARRAY['Burgers', 'Fast Food']),
--     ('Test Restaurant 2', 'Another test restaurant', ARRAY['Pizza', 'Italian']);

-- Sample test data (optional)
-- INSERT INTO public.orders (orderId, items, customer, status)
-- VALUES (
--   'TEST-123456',
--   '[{"name": "Test Item", "price": "9.99", "currency": "MAD", "quantity": 1}]',
--   '{"name": "Test Customer", "addressDetail": "Test Address"}',
--   'test'
-- ); 