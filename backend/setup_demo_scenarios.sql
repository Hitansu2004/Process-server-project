-- 1. Setup Variables for Process Servers
SET @ps1_id = (SELECT id FROM process_server_profiles LIMIT 1);
SET @ps2_id = (SELECT id FROM process_server_profiles WHERE id != @ps1_id LIMIT 1);
SET @ps3_id = (SELECT id FROM process_server_profiles WHERE id NOT IN (@ps1_id, @ps2_id) LIMIT 1);

-- 2. Configure Server 1 (The one for Order 5) -> 10 Deliveries
UPDATE process_server_profiles 
SET 
    total_orders_assigned = 10,
    successful_deliveries = 9,
    failed_after_max_attempts = 1,
    total_attempts = 30,
    current_rating = 4.5
WHERE id = @ps1_id;

-- 3. Configure Server 2 (The experienced one for Order 1) -> 50 Deliveries
UPDATE process_server_profiles 
SET 
    total_orders_assigned = 50,
    successful_deliveries = 48,
    failed_after_max_attempts = 2,
    total_attempts = 150,
    current_rating = 4.8
WHERE id = @ps2_id;

-- 4. Configure Server 3 (The new one for Order 1) -> 0 Deliveries
UPDATE process_server_profiles 
SET 
    total_orders_assigned = 0,
    successful_deliveries = 0,
    failed_after_max_attempts = 0,
    total_attempts = 0,
    current_rating = 0.0
WHERE id = @ps3_id;

-- 5. Setup Order C3771-ORD1 (Completed, Split Assignment)
-- Check if it exists
SET @order1_id = (SELECT id FROM orders WHERE order_number = 'C3771-ORD1' LIMIT 1);
-- If not, pick one
SET @order1_id = IFNULL(@order1_id, (SELECT id FROM orders WHERE status = 'COMPLETED' AND total_dropoffs >= 2 LIMIT 1));
-- Update name if needed (ignore error if duplicate, though logic above should prevent it unless race condition)
UPDATE IGNORE orders SET order_number = 'C3771-ORD1' WHERE id = @order1_id;

-- Assign Dropoff 1 to Server 2 (50 deliveries)
UPDATE order_dropoffs 
SET assigned_process_server_id = @ps2_id 
WHERE order_id = @order1_id 
ORDER BY id ASC LIMIT 1;

-- Assign Dropoff 2 to Server 3 (New)
UPDATE order_dropoffs 
SET assigned_process_server_id = @ps3_id 
WHERE order_id = @order1_id 
ORDER BY id DESC LIMIT 1;

-- Clear ratings
DELETE FROM ratings WHERE order_id = @order1_id;

-- 6. Setup Order C3771-ORD5 (Assigned, Server 1)
-- Check if it exists
SET @order5_id = (SELECT id FROM orders WHERE order_number = 'C3771-ORD5' LIMIT 1);
-- If not, pick one
SET @order5_id = IFNULL(@order5_id, (SELECT id FROM orders WHERE status = 'ASSIGNED' LIMIT 1));
-- Update name
UPDATE IGNORE orders SET order_number = 'C3771-ORD5' WHERE id = @order5_id;

-- Assign all dropoffs to Server 1 (10 deliveries)
UPDATE order_dropoffs 
SET assigned_process_server_id = @ps1_id 
WHERE order_id = @order5_id;

-- Output details
SELECT 'Server 1 (10 dels)' as Role, id, total_orders_assigned FROM process_server_profiles WHERE id = @ps1_id
UNION
SELECT 'Server 2 (50 dels)', id, total_orders_assigned FROM process_server_profiles WHERE id = @ps2_id
UNION
SELECT 'Server 3 (New)', id, total_orders_assigned FROM process_server_profiles WHERE id = @ps3_id;

SELECT 'Order 1' as Ord, id, order_number, status FROM orders WHERE id = @order1_id
UNION
SELECT 'Order 5', id, order_number, status FROM orders WHERE id = @order5_id;
