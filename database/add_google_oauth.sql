-- Add google_id column to global_users table
ALTER TABLE `global_users` 
ADD COLUMN `google_id` VARCHAR(255) NULL UNIQUE AFTER `is_active`;

-- Index for faster lookups
CREATE INDEX idx_google_id ON `global_users`(google_id);
