-- Migration: Add Tenant Settings Columns
-- Date: 2025-12-10
-- Description: Adds business hours, pricing config, and notification settings to tenants table

USE processserve_db;

-- Add new JSON columns for tenant settings
ALTER TABLE tenants 
ADD COLUMN business_hours JSON DEFAULT NULL COMMENT 'Operating hours for each day of the week',
ADD COLUMN pricing_config JSON DEFAULT NULL COMMENT 'Pricing configuration including minimum price and commission rate',
ADD COLUMN notification_settings JSON DEFAULT NULL COMMENT 'Notification preferences for email, SMS, and reports';

-- Set default values for existing tenants
UPDATE tenants 
SET 
  business_hours = JSON_OBJECT(
    'monday', JSON_OBJECT('open', '09:00', 'close', '18:00', 'enabled', true),
    'tuesday', JSON_OBJECT('open', '09:00', 'close', '18:00', 'enabled', true),
    'wednesday', JSON_OBJECT('open', '09:00', 'close', '18:00', 'enabled', true),
    'thursday', JSON_OBJECT('open', '09:00', 'close', '18:00', 'enabled', true),
    'friday', JSON_OBJECT('open', '09:00', 'close', '18:00', 'enabled', true),
    'saturday', JSON_OBJECT('open', '09:00', 'close', '18:00', 'enabled', true),
    'sunday', JSON_OBJECT('open', '09:00', 'close', '18:00', 'enabled', true)
  ),
  pricing_config = JSON_OBJECT(
    'minimumOrderPrice', 50.00,
    'commissionRate', 15
  ),
  notification_settings = JSON_OBJECT(
    'emailForNewOrders', true,
    'smsForDelivery', true,
    'weeklyReports', false
  )
WHERE business_hours IS NULL;

-- Verify the changes
SELECT id, name, 
  business_hours IS NOT NULL as has_business_hours,
  pricing_config IS NOT NULL as has_pricing_config,
  notification_settings IS NOT NULL as has_notification_settings
FROM tenants;
