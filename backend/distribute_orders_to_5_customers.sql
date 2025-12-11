-- Distribute Orders Among 5 Specific Demo Customers Script
-- Distributes all existing orders among the 5 hardcoded demo customers.

DROP PROCEDURE IF EXISTS DistributeOrdersToCustomers;
DELIMITER //
CREATE PROCEDURE DistributeOrdersToCustomers()
BEGIN
    DECLARE c1, c2, c3, c4, c5 VARCHAR(36);
    
    -- Global User IDs (fetched from database)
    SET c1 = 'aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e'; -- Customer 1
    SET c2 = '17812fce-9c0b-493c-9e4b-0189fb1c31c8'; -- Customer 2
    SET c3 = '9db8f52f-b73d-49a4-8831-48781f9d90a2'; -- Customer 3
    SET c4 = '0e1b5d79-887f-4a2b-8450-01c385e4ed18'; -- Customer 4
    SET c5 = 'ab3435d4-7174-4989-b443-b9d60bff298f'; -- Customer 5

    -- Update Orders with Weighted Distribution
    -- C1: 30%, C2: 25%, C3: 20%, C4: 15%, C5: 10%
    
    UPDATE orders 
    SET customer_id = CASE 
        WHEN RAND() < 0.30 THEN c1
        WHEN RAND() < 0.55 THEN c2
        WHEN RAND() < 0.75 THEN c3
        WHEN RAND() < 0.90 THEN c4
        ELSE c5
    END
    WHERE id IS NOT NULL;

    -- Update Ratings to match new Order owners
    UPDATE ratings r
    JOIN orders o ON r.order_id = o.id
    SET r.customer_id = o.customer_id;

    SELECT 'Orders distributed successfully among the 5 demo customers' as message;
END //
DELIMITER ;

CALL DistributeOrdersToCustomers();
