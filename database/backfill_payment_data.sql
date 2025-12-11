-- Backfill Payment Breakdown for Existing Orders
-- Date: 2025-12-10
-- Description: Calculate and populate payment breakdown for orders that don't have it yet

USE processserve_db;

-- For ProcessServe NY (tenant_id: 550e8400-e29b-41d4-a716-446655440001)
-- Commission rate: 15% (default)

-- Update ORD-2024-002 with 15% commission
UPDATE orders 
SET 
    customer_payment_amount = 150.00,
    delivery_person_payout = 127.50,      -- 150 - (150 * 0.15) = 150 - 22.50 = 127.50
    tenant_commission = 22.50,             -- 150 * 0.15 = 22.50
    super_admin_fee = 1.13,                -- 22.50 * 0.05 = 1.125 -> 1.13
    tenant_profit = 21.37,                 -- 22.50 - 1.13 = 21.37
    commission_rate_applied = 15.00
WHERE order_number = 'ORD-2024-002' 
  AND final_agreed_price = 150.00;
--   AND delivery_person_payout IS NULL; -- Allow updating existing record

-- Generic update for all other orders with NULL payment breakdown
-- This will use default 15% if we don't know their specific rate
UPDATE orders o
SET 
    customer_payment_amount = o.final_agreed_price,
    delivery_person_payout = ROUND(o.final_agreed_price * 0.85, 2),  -- 85% to delivery person (15% commission)
    tenant_commission = ROUND(o.final_agreed_price * 0.15, 2),       -- 15% commission
    super_admin_fee = ROUND(o.final_agreed_price * 0.15 * 0.05, 2),  -- 5% of 15%
    tenant_profit = ROUND(o.final_agreed_price * 0.15 * 0.95, 2),    -- 95% of 15%
    commission_rate_applied = 15.00
WHERE o.final_agreed_price IS NOT NULL 
  AND o.delivery_person_payout IS NULL
  AND o.order_number != 'ORD-2024-002';  -- Skip the one we just updated

-- Verify results
SELECT 
    order_number,
    status,
    customer_payment_amount as customer,
    delivery_person_payout as delivery,
    tenant_commission as commission,
    super_admin_fee as platform,
    tenant_profit as tenant,
    commission_rate_applied as rate
FROM orders 
WHERE final_agreed_price IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
