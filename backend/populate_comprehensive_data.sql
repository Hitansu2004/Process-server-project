-- Comprehensive Data Population Script
-- Assigns personas to all 30 process servers and generates realistic order history.

SET @tenant_id = (SELECT id FROM tenants LIMIT 1);

-- Procedure to generate orders for a specific server with specific success rate
DROP PROCEDURE IF EXISTS GenerateComprehensiveOrders;
DELIMITER //
CREATE PROCEDURE GenerateComprehensiveOrders(
    IN ps_id VARCHAR(36), 
    IN target_count INT, 
    IN success_rate DECIMAL(5,2), -- e.g., 1.00 for 100%, 0.90 for 90%
    IN rating_min DECIMAL(3,1),
    IN rating_max DECIMAL(3,1)
)
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE current_count INT;
    DECLARE is_success BOOLEAN;
    DECLARE order_status VARCHAR(20);
    DECLARE dropoff_status VARCHAR(20);
    DECLARE cust_id VARCHAR(36);
    DECLARE rating_val INT;
    DECLARE dropoff_id VARCHAR(36);
    
    -- Count existing
    SELECT COUNT(DISTINCT order_id) INTO current_count 
    FROM order_dropoffs 
    WHERE assigned_process_server_id = ps_id COLLATE utf8mb4_unicode_ci;
    
    SET i = current_count + 1;
    
    WHILE i <= target_count DO
        SET @new_order_id = UUID();
        SET @order_num = CONCAT('ORD-', SUBSTRING(ps_id, 1, 4), '-', i);
        
        -- Pick a random customer (Corrected Join)
        SELECT tur.global_user_id INTO cust_id 
        FROM customer_profiles cp
        JOIN tenant_user_roles tur ON cp.tenant_user_role_id = tur.id
        ORDER BY RAND() LIMIT 1;
        
        -- Determine success based on rate
        IF (RAND() <= success_rate) THEN
            SET is_success = TRUE;
            SET order_status = 'COMPLETED';
            SET dropoff_status = 'DELIVERED';
        ELSE
            SET is_success = FALSE;
            SET order_status = 'FAILED'; 
            SET dropoff_status = 'FAILED';
        END IF;
        
        -- Create Order
        INSERT IGNORE INTO orders (id, order_number, status, customer_id, created_at, total_dropoffs, pickup_address, pickup_zip_code, deadline, tenant_id)
        VALUES (@new_order_id, @order_num, order_status, cust_id, DATE_SUB(NOW(), INTERVAL FLOOR(RAND()*365) DAY), 1, '123 Real St', '10001', NOW(), @tenant_id);
        
        IF ROW_COUNT() > 0 THEN
             SET dropoff_id = UUID();
             -- Create Dropoff
             INSERT INTO order_dropoffs (id, order_id, dropoff_address, dropoff_zip_code, status, assigned_process_server_id, final_agreed_price, recipient_name, sequence_number)
             VALUES (dropoff_id, @new_order_id, CONCAT('456 Target Blvd ', i), '10002', dropoff_status, ps_id, 60.00 + FLOOR(RAND()*40), CONCAT('Target ', i), 1);
             
             -- Create Attempts
             IF is_success THEN
                -- Attempt 1: Failed
                INSERT INTO delivery_attempts (id, attempt_number, attempt_time, process_server_id, was_successful, order_dropoff_id, outcome_notes)
                VALUES (UUID(), 1, DATE_SUB(NOW(), INTERVAL 2 DAY), ps_id, 0, dropoff_id, 'No answer');
                -- Attempt 2: Success
                INSERT INTO delivery_attempts (id, attempt_number, attempt_time, process_server_id, was_successful, order_dropoff_id, outcome_notes)
                VALUES (UUID(), 2, DATE_SUB(NOW(), INTERVAL 1 DAY), ps_id, 1, dropoff_id, 'Delivered to recipient');
             ELSE
                -- 3 Failed Attempts
                INSERT INTO delivery_attempts (id, attempt_number, attempt_time, process_server_id, was_successful, order_dropoff_id, outcome_notes)
                VALUES (UUID(), 1, DATE_SUB(NOW(), INTERVAL 3 DAY), ps_id, 0, dropoff_id, 'No answer');
                INSERT INTO delivery_attempts (id, attempt_number, attempt_time, process_server_id, was_successful, order_dropoff_id, outcome_notes)
                VALUES (UUID(), 2, DATE_SUB(NOW(), INTERVAL 2 DAY), ps_id, 0, dropoff_id, 'No answer');
                INSERT INTO delivery_attempts (id, attempt_number, attempt_time, process_server_id, was_successful, order_dropoff_id, outcome_notes)
                VALUES (UUID(), 3, DATE_SUB(NOW(), INTERVAL 1 DAY), ps_id, 0, dropoff_id, 'Max attempts reached');
             END IF;

             -- Add Rating if successful (80% chance of rating)
             IF is_success AND RAND() > 0.2 THEN
                SET rating_val = FLOOR(rating_min + (RAND() * (rating_max - rating_min + 1)));
                IF rating_val > 5 THEN SET rating_val = 5; END IF;
                
                INSERT INTO ratings (id, order_id, customer_id, process_server_id, rating, feedback, created_at)
                VALUES (UUID(), @new_order_id, cust_id, ps_id, rating_val, 'Great service!', NOW());
             END IF;
        END IF;
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;

-- Procedure to Loop through all servers and assign personas
DROP PROCEDURE IF EXISTS AssignPersonas;
DELIMITER //
CREATE PROCEDURE AssignPersonas()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE p_id VARCHAR(36);
    DECLARE counter INT DEFAULT 0;
    DECLARE cur CURSOR FOR SELECT id FROM process_server_profiles;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO p_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET counter = counter + 1;
        
        -- Logic to assign personas based on counter
        IF counter <= 5 THEN
            -- Top Performers (5): 50-80 orders, 95% success, 4.5-5.0 rating
            CALL GenerateComprehensiveOrders(p_id, 50 + FLOOR(RAND()*30), 0.95, 4.5, 5.0);
            
        ELSEIF counter <= 10 THEN
            -- Reliable (5): 20-40 orders, 100% success, 4.8-5.0 rating
            CALL GenerateComprehensiveOrders(p_id, 20 + FLOOR(RAND()*20), 1.00, 4.8, 5.0);
            
        ELSEIF counter <= 20 THEN
            -- Mid-Level (10): 10-30 orders, 80-90% success, 3.5-4.5 rating
            CALL GenerateComprehensiveOrders(p_id, 10 + FLOOR(RAND()*20), 0.85, 3.5, 4.5);
            
        ELSEIF counter <= 25 THEN
            -- Beginners (5): 1-5 orders, variable success, variable rating
            CALL GenerateComprehensiveOrders(p_id, 1 + FLOOR(RAND()*5), 0.70, 3.0, 5.0);
            
        ELSE
            -- New (Rest): 0 orders
            -- Do nothing, they stay at 0
            ITERATE read_loop;
        END IF;
        
    END LOOP;
    
    CLOSE cur;
END //
DELIMITER ;

-- Execute the population
CALL AssignPersonas();

-- Update Stats for ALL profiles
UPDATE process_server_profiles p
SET 
    total_orders_assigned = (
        SELECT COUNT(DISTINCT order_id) FROM order_dropoffs 
        WHERE assigned_process_server_id = p.id COLLATE utf8mb4_unicode_ci
    ),
    successful_deliveries = (
        SELECT COUNT(DISTINCT order_id) FROM order_dropoffs 
        WHERE assigned_process_server_id = p.id COLLATE utf8mb4_unicode_ci AND status = 'DELIVERED'
    ),
    failed_after_max_attempts = (
        SELECT COUNT(DISTINCT order_id) FROM order_dropoffs 
        WHERE assigned_process_server_id = p.id COLLATE utf8mb4_unicode_ci AND status = 'FAILED'
    ),
    current_rating = IFNULL((
        SELECT AVG(rating) FROM ratings 
        WHERE process_server_id = p.id COLLATE utf8mb4_unicode_ci
    ), 0.0),
    total_attempts = (
        SELECT COUNT(*) FROM delivery_attempts 
        WHERE process_server_id = p.id COLLATE utf8mb4_unicode_ci
    ),
    average_attempts_per_delivery = IFNULL((
        SELECT AVG(attempts_count) FROM (
            SELECT COUNT(*) as attempts_count 
            FROM delivery_attempts 
            WHERE process_server_id = p.id COLLATE utf8mb4_unicode_ci
            GROUP BY order_dropoff_id
        ) as sub
    ), 0.0);

-- Verify
SELECT id, total_orders_assigned, successful_deliveries, current_rating, total_attempts FROM process_server_profiles LIMIT 10;
