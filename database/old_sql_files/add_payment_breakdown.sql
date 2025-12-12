-- Migration: Add Payment Breakdown to Orders
-- Date: 2025-12-10
-- Description: Adds commission distribution fields for multi-tier payment system

USE processserve_db;

-- Add payment breakdown columns to orders table
ALTER TABLE orders 
ADD COLUMN customer_payment_amount DECIMAL(10,2) DEFAULT NULL COMMENT 'Total amount customer pays',
ADD COLUMN delivery_person_payout DECIMAL(10,2) DEFAULT NULL COMMENT 'Amount delivery person receives after commission',
ADD COLUMN tenant_commission DECIMAL(10,2) DEFAULT NULL COMMENT 'Total commission amount to tenant',
ADD COLUMN super_admin_fee DECIMAL(10,2) DEFAULT NULL COMMENT '5% platform fee to super admin from tenant commission',
ADD COLUMN tenant_profit DECIMAL(10,2) DEFAULT NULL COMMENT 'Tenant keeps after super admin fee deduction',
ADD COLUMN commission_rate_applied DECIMAL(5,2) DEFAULT NULL COMMENT 'Commission percentage used for this order';

-- Migrate existing orders: set customer_payment_amount to final_agreed_price
UPDATE orders 
SET customer_payment_amount = final_agreed_price
WHERE final_agreed_price IS NOT NULL AND customer_payment_amount IS NULL;

-- Verify the changes
SELECT 
    COUNT(*) as total_orders,
    COUNT(customer_payment_amount) as orders_with_payment_amount,
    COUNT(delivery_person_payout) as orders_with_payout_calculated
FROM orders;

SELECT 'Migration complete - payment breakdown columns added' AS status;
