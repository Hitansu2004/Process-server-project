-- Delete child records first
DELETE FROM order_dropoffs WHERE order_id LIKE 'fix-ord-%';
DELETE FROM process_server_attempts WHERE order_id LIKE 'fix-ord-%';

-- Now delete the orders
DELETE FROM orders WHERE id LIKE 'fix-ord-%';

-- Adjust Payout down by 92.50 and Commission up by 92.50 on 'admin-ord-001'
UPDATE orders 
SET process_server_payout = process_server_payout - 92.50,
    tenant_commission = tenant_commission + 92.50
WHERE id = 'admin-ord-001';

-- Recalculate Fee and Profit for ALL orders
UPDATE orders
SET super_admin_fee = ROUND(tenant_commission * 0.05, 2),
    tenant_profit = tenant_commission - ROUND(tenant_commission * 0.05, 2);

-- Verify totals
SELECT 
    SUM(customer_payment_amount) as Revenue,
    SUM(process_server_payout) as Payout,
    SUM(tenant_commission) as Commission,
    SUM(super_admin_fee) as Fee,
    SUM(tenant_profit) as Profit
FROM orders;
