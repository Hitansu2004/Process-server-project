-- Migration: Add profile photos and default process server support
-- Date: 2025-12-15

USE processserve_db;

-- Add profile_photo_url to process_server_profiles
ALTER TABLE `process_server_profiles`
ADD COLUMN `profile_photo_url` VARCHAR(500) DEFAULT NULL
AFTER `verification_docs`;

-- Add default_process_server_id to customer_profiles
ALTER TABLE `customer_profiles`
ADD COLUMN `default_process_server_id` VARCHAR(36) DEFAULT NULL
AFTER `default_zip_code`,
ADD CONSTRAINT `fk_customer_default_ps`
    FOREIGN KEY (`default_process_server_id`)
    REFERENCES `process_server_profiles` (`id`)
    ON DELETE SET NULL;

-- Backfill all existing process servers with default profile photo
UPDATE `process_server_profiles`
SET `profile_photo_url` = '1.png'
WHERE `profile_photo_url` IS NULL;

-- Optional: Set a random default process server for existing customers
-- (Uncomment if you want to auto-assign defaults)
-- UPDATE `customer_profiles` cp
-- SET cp.`default_process_server_id` = (
--     SELECT psp.`id`
--     FROM `process_server_profiles` psp
--     WHERE psp.`is_global` = 1
--     AND psp.`status` = 'ACTIVE'
--     ORDER BY RAND()
--     LIMIT 1
-- )
-- WHERE cp.`default_process_server_id` IS NULL;
