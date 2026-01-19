-- Migration: Remove all pricing-related fields from the system
-- Date: 2026-01-13
-- Description: Remove quoted_price, negotiated_price, price_status, final_agreed_price, base_price
--              from order_recipients and orders tables, drop price_negotiations table

-- Remove pricing columns from order_recipients table (ignore errors if columns don't exist)
SET @stmt = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'processserve_db' AND TABLE_NAME = 'order_recipients' AND COLUMN_NAME = 'quoted_price') > 0, 'ALTER TABLE order_recipients DROP COLUMN quoted_price;', 'SELECT "Column quoted_price does not exist";');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'processserve_db' AND TABLE_NAME = 'order_recipients' AND COLUMN_NAME = 'price_status') > 0, 'ALTER TABLE order_recipients DROP COLUMN price_status;', 'SELECT "Column price_status does not exist";');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'processserve_db' AND TABLE_NAME = 'order_recipients' AND COLUMN_NAME = 'final_agreed_price') > 0, 'ALTER TABLE order_recipients DROP COLUMN final_agreed_price;', 'SELECT "Column final_agreed_price does not exist";');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'processserve_db' AND TABLE_NAME = 'order_recipients' AND COLUMN_NAME = 'base_price') > 0, 'ALTER TABLE order_recipients DROP COLUMN base_price;', 'SELECT "Column base_price does not exist";');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'processserve_db' AND TABLE_NAME = 'order_recipients' AND COLUMN_NAME = 'rush_service_fee') > 0, 'ALTER TABLE order_recipients DROP COLUMN rush_service_fee;', 'SELECT "Column rush_service_fee does not exist";');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'processserve_db' AND TABLE_NAME = 'order_recipients' AND COLUMN_NAME = 'remote_location_fee') > 0, 'ALTER TABLE order_recipients DROP COLUMN remote_location_fee;', 'SELECT "Column remote_location_fee does not exist";');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'processserve_db' AND TABLE_NAME = 'order_recipients' AND COLUMN_NAME = 'negotiation_status') > 0, 'ALTER TABLE order_recipients DROP COLUMN negotiation_status;', 'SELECT "Column negotiation_status does not exist";');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'processserve_db' AND TABLE_NAME = 'order_recipients' AND COLUMN_NAME = 'active_negotiation_id') > 0, 'ALTER TABLE order_recipients DROP COLUMN active_negotiation_id;', 'SELECT "Column active_negotiation_id does not exist";');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'processserve_db' AND TABLE_NAME = 'order_recipients' AND COLUMN_NAME = 'last_negotiation_at') > 0, 'ALTER TABLE order_recipients DROP COLUMN last_negotiation_at;', 'SELECT "Column last_negotiation_at does not exist";');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Remove pricing columns from orders table  
SET @stmt = IF((SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'processserve_db' AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'final_agreed_price') > 0, 'ALTER TABLE orders DROP COLUMN final_agreed_price;', 'SELECT "Column final_agreed_price does not exist";');
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Drop price_negotiations table if it exists
DROP TABLE IF EXISTS price_negotiations;



