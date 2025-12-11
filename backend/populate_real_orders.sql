-- Script to populate real orders to match stats
-- Server 1: Needs 10 total orders.
-- Server 2: Needs 50 total orders.

SET @ps1_id = '48bff7b9-6dbe-45a4-ba6d-f9c557b39c80';
SET @ps2_id = '01aac0f9-2747-4c16-8fa3-997bc2ebdb20';
SET @customer_id = (SELECT id FROM global_users LIMIT 1);
SET @tenant_id = (SELECT id FROM tenants LIMIT 1);

-- 2. Procedure to generate orders
DROP PROCEDURE IF EXISTS GenerateOrders;
DELIMITER //
CREATE PROCEDURE GenerateOrders(IN ps_id VARCHAR(36), IN target_count INT, IN start_index INT)
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE current_count INT;
    
    -- Count existing assignments
    SELECT COUNT(DISTINCT order_id) INTO current_count 
    FROM order_dropoffs 
    WHERE assigned_process_server_id = ps_id COLLATE utf8mb4_unicode_ci;
    
    SET i = current_count + 1;
    
    WHILE i <= target_count DO
        SET @new_order_id = UUID();
        SET @order_num = CONCAT('DEMO-ORD-', SUBSTRING(ps_id, 1, 4), '-', i);
        
        -- Create Order (Using INSERT IGNORE to skip duplicates)
        INSERT IGNORE INTO orders (id, order_number, status, customer_id, created_at, total_dropoffs, pickup_address, pickup_zip_code, deadline, tenant_id)
        VALUES (@new_order_id, @order_num, 'COMPLETED', @customer_id, NOW(), 1, '123 Demo St', '10001', NOW(), @tenant_id);
        
        IF ROW_COUNT() > 0 THEN
             -- Create Dropoff (Added sequence_number)
             INSERT INTO order_dropoffs (id, order_id, dropoff_address, dropoff_zip_code, status, assigned_process_server_id, final_agreed_price, recipient_name, sequence_number)
             VALUES (UUID(), @new_order_id, CONCAT('456 Dropoff Ave ', i), '10002', 'DELIVERED', ps_id, 60.00, CONCAT('Recipient ', i), 1);
        END IF;
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

-- 3. Generate Orders for Server 1 (Target 10)
CALL GenerateOrders(@ps1_id, 10, 1);

-- 4. Generate Orders for Server 2 (Target 50)
CALL GenerateOrders(@ps2_id, 50, 1);

-- 5. Update Profile Stats to match EXACTLY the count in DB
UPDATE process_server_profiles p
SET total_orders_assigned = (
    SELECT COUNT(DISTINCT order_id) 
    FROM order_dropoffs 
    WHERE assigned_process_server_id = p.id COLLATE utf8mb4_unicode_ci
)
WHERE id COLLATE utf8mb4_unicode_ci IN (@ps1_id, @ps2_id);

-- 6. Verify
SELECT p.id, p.total_orders_assigned, 
       (SELECT COUNT(DISTINCT order_id) FROM order_dropoffs WHERE assigned_process_server_id = p.id COLLATE utf8mb4_unicode_ci) as 'Actual DB Count'
FROM process_server_profiles p
WHERE id COLLATE utf8mb4_unicode_ci IN (@ps1_id, @ps2_id);
