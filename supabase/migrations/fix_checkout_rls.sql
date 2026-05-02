-- Fix Row Level Security to allow public checkouts
-- The previous migration only allowed SELECT, completely blocking INSERTS without a Service Role Key.

-- 1. Allow any user (authenticated or anonymous guest) to insert a new order
DROP POLICY IF EXISTS "Enable insert access for all users" ON orders;
CREATE POLICY "Enable insert access for all users" ON orders
    FOR INSERT 
    WITH CHECK (true);

-- 2. Allow any user to log the initial order_status_history creation
DROP POLICY IF EXISTS "Enable insert access for all users on history" ON order_status_history;
CREATE POLICY "Enable insert access for all users on history" ON order_status_history
    FOR INSERT 
    WITH CHECK (true);

-- 3. (Optional but good) Ensure users can only UPDATE their own orders if authenticated
-- Right now we don't need update access for guests, just insert!
