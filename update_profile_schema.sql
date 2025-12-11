USE processserve_db;

ALTER TABLE process_server_profiles
ADD COLUMN successful_deliveries INT DEFAULT 0,
ADD COLUMN failed_after_max_attempts INT DEFAULT 0,
ADD COLUMN total_attempts INT DEFAULT 0,
ADD COLUMN average_attempts_per_delivery DECIMAL(4,2) DEFAULT 0.00,
ADD COLUMN is_red_zone BOOLEAN DEFAULT FALSE,
ADD COLUMN red_zone_trigger_count INT DEFAULT 0,
ADD COLUMN verification_docs JSON,
ADD COLUMN last_delivery_at DATETIME(6),
ADD COLUMN created_at DATETIME(6),
ADD COLUMN updated_at DATETIME(6);
