-- SQL script to create the grocery_orders table
-- This script assumes that standard Supabase extensions like uuid-ossp are available if using UUIDs by default.

-- Drop table if it exists (optional, for development to easily reset)
-- DROP TABLE IF EXISTS public.grocery_orders;

-- Create the grocery_orders table
CREATE TABLE IF NOT EXISTS public.grocery_orders (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, -- Standard auto-incrementing primary key
    order_id TEXT UNIQUE NOT NULL,                          -- Custom order ID like "TDG-timestamp-random"
    customer_details JSONB,                                 -- To store name, phone, address, lat, long
    grocery_list TEXT,                                      -- The actual list of groceries
    order_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,       -- Timestamp of when the order was placed
    status TEXT DEFAULT 'pending',                          -- Order status (e.g., pending, processing, completed)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP        -- Timestamp of row creation
);

-- Add comments to columns for clarity
COMMENT ON COLUMN public.grocery_orders.id IS 'Primary key for the grocery order';
COMMENT ON COLUMN public.grocery_orders.order_id IS 'Unique identifier for the grocery order (e.g., TDG-xxxxx)';
COMMENT ON COLUMN public.grocery_orders.customer_details IS 'JSON object containing customer name, phone, address, and location coordinates';
COMMENT ON COLUMN public.grocery_orders.grocery_list IS 'Text field containing the list of groceries requested by the customer';
COMMENT ON COLUMN public.grocery_orders.order_date IS 'Timestamp of when the order was placed/submitted by the user';
COMMENT ON COLUMN public.grocery_orders.status IS 'Current status of the grocery order (e.g., pending, processing, out for delivery, completed, cancelled)';
COMMENT ON COLUMN public.grocery_orders.created_at IS 'Timestamp of when the record was created in the database';

-- Example of how to insert data (for testing purposes, not part of table creation)
-- INSERT INTO public.grocery_orders (order_id, customer_details, grocery_list, order_date, status)
-- VALUES (
--   'TDG-1678886400000-abcdef',
--   '{
--     "name": "Test User",
--     "phone": "+1234567890",
--     "address": "123 Main St, Anytown",
--     "latitude": 34.0522,
--     "longitude": -118.2437
--   }',
--   '2L Milk, 1 Dozen Eggs, Bread, Apples',
--   '2023-03-15T10:00:00Z',
--   'pending'
-- );

-- Note: You should apply RLS (Row Level Security) policies to this table in your Supabase dashboard
-- to control who can access and modify the data, similar to your other tables.
-- e.g., Allow authenticated users to insert their own orders.
-- e.g., Allow specific roles (like admin or delivery personnel) to read/update orders.

SELECT 'grocery_orders table script executed successfully.'; 