-- Migration to assign unique order numbers to existing orders
-- This ensures all orders have proper ORD-YYYY-XXX format order numbers

-- Create a temporary variable to track the counter
SET @counter = 0;

-- Update all orders to have unique order numbers in format ORD-2026-XXX
UPDATE orders 
SET order_number = CONCAT('ORD-2026-', LPAD(@counter := @counter + 1, 3, '0'))
WHERE order_number IS NULL 
   OR order_number = custom_name 
   OR order_number NOT LIKE 'ORD-%'
ORDER BY created_at ASC;

-- Verify the update
SELECT 
    id,
    custom_name,
    order_number,
    created_at
FROM orders
ORDER BY created_at ASC;
