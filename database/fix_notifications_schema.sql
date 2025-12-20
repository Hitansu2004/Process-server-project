-- Fix notifications table schema
-- Add missing columns to match NotificationEntity

ALTER TABLE notifications
  ADD COLUMN tenant_id VARCHAR(36) NOT NULL AFTER id,
  ADD COLUMN type VARCHAR(50) NOT NULL AFTER user_id,
  ADD COLUMN title VARCHAR(255) NOT NULL AFTER type,
  MODIFY COLUMN message TEXT NOT NULL,
  ADD COLUMN related_order_id VARCHAR(36) DEFAULT NULL AFTER message;

-- Update is_read to match entity (already correct, but ensuring consistency)
ALTER TABLE notifications
  MODIFY COLUMN is_read TINYINT(1) DEFAULT 0;

-- Verify the structure
DESCRIBE notifications;
