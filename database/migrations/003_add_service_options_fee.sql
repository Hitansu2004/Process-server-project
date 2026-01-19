-- Migration: Add service_options_fee column to order_dropoffs table
-- Date: 2026-01-18
-- Description: Add column to store service options pricing for GUIDED (directly assigned) orders
--              Each selected service option costs $50 for GUIDED assignments
--              AUTOMATED orders have free service options (no additional fee)

USE processserve_db;

-- Add service_options_fee column
ALTER TABLE order_dropoffs 
ADD COLUMN service_options_fee DECIMAL(10,2) DEFAULT 0.00 
COMMENT 'Total fee for selected service options (GUIDED only): $50 per option';

-- Update existing GUIDED records to calculate service_options_fee based on selected options
UPDATE order_dropoffs
SET service_options_fee = (
    (CASE WHEN process_service = 1 THEN 50.00 ELSE 0.00 END) +
    (CASE WHEN certified_mail = 1 THEN 50.00 ELSE 0.00 END) +
    (CASE WHEN rush_service = 1 THEN 50.00 ELSE 0.00 END) +
    (CASE WHEN remote_location = 1 THEN 50.00 ELSE 0.00 END)
)
WHERE dropoff_type = 'GUIDED' AND service_options_fee IS NULL;

-- Keep service_options_fee as 0 for AUTOMATED orders
UPDATE order_dropoffs
SET service_options_fee = 0.00
WHERE dropoff_type = 'AUTOMATED';

-- Add index for faster queries
CREATE INDEX idx_dropoffs_service_fee ON order_dropoffs(service_options_fee);

SELECT 'Migration 003_add_service_options_fee.sql completed successfully' AS status;
