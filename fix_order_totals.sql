-- Update final_agreed_price in orders table from dropoffs
UPDATE orders o
JOIN (
    SELECT order_id, SUM(final_agreed_price) as total_price
    FROM order_dropoffs
    WHERE final_agreed_price IS NOT NULL
    GROUP BY order_id
) d ON o.id = d.order_id
SET o.final_agreed_price = d.total_price
WHERE o.final_agreed_price IS NULL;

-- Update customer_payment_amount (Gross) = final_agreed_price
UPDATE orders
SET customer_payment_amount = final_agreed_price
WHERE customer_payment_amount IS NULL AND final_agreed_price IS NOT NULL;

-- Update breakdown based on deduction logic
-- Commission = 15% of Gross
-- Super Admin Fee = 5% of Commission
-- Tenant Profit = Commission - Super Admin Fee
-- Process Server Payout = Gross - Commission
UPDATE orders
SET tenant_commission = customer_payment_amount * 0.15,
    super_admin_fee = (customer_payment_amount * 0.15) * 0.05,
    tenant_profit = (customer_payment_amount * 0.15) - ((customer_payment_amount * 0.15) * 0.05),
    process_server_payout = customer_payment_amount - (customer_payment_amount * 0.15)
WHERE process_server_payout IS NULL OR process_server_payout = final_agreed_price;
