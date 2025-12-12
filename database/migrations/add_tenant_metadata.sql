-- Migration: Add Tenant Metadata Fields
-- This migration adds comprehensive business metadata to the tenants table

USE processserve_db;

-- Add new columns to tenants table
ALTER TABLE tenants
ADD COLUMN business_email VARCHAR(255) AFTER api_key,
ADD COLUMN business_phone VARCHAR(20) AFTER business_email,
ADD COLUMN business_address TEXT AFTER business_phone,
ADD COLUMN business_category ENUM('LEGAL_SERVICES', 'PROCESS_SERVING', 'COURIER', 'DELIVERY', 'OTHER') DEFAULT 'PROCESS_SERVING' AFTER business_address,
ADD COLUMN business_type ENUM('LLC', 'CORPORATION', 'SOLE_PROPRIETOR', 'PARTNERSHIP', 'NPO') DEFAULT 'LLC' AFTER business_category,
ADD COLUMN contact_person_name VARCHAR(255) AFTER business_type,
ADD COLUMN contact_person_email VARCHAR(255) AFTER contact_person_name,
ADD COLUMN contact_person_phone VARCHAR(20) AFTER contact_person_email,
ADD COLUMN tax_id VARCHAR(50) AFTER contact_person_phone,
ADD COLUMN license_number VARCHAR(100) AFTER tax_id,
ADD COLUMN logo_url VARCHAR(500) AFTER license_number,
ADD COLUMN website_url VARCHAR(500) AFTER logo_url,
ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/New_York' AFTER website_url,
ADD COLUMN currency VARCHAR(3) DEFAULT 'USD' AFTER timezone;

-- Update existing tenant with metadata
UPDATE tenants 
SET 
    business_email = 'contact@demoshop.com',
    business_phone = '+1-555-0100',
    business_address = '123 Main Street, New York, NY 10001',
    business_category = 'PROCESS_SERVING',
    business_type = 'LLC',
    contact_person_name = 'John Manager',
    contact_person_email = 'john@demoshop.com',
    contact_person_phone = '+1-555-0101',
    tax_id = '12-3456789',
    license_number = 'PS-NY-2024-001',
    website_url = 'https://demoshop.processserve.com',
    timezone = 'America/New_York',
    currency = 'USD'
WHERE id = 'tenant-1';

-- Verify migration
SELECT id, name, business_email, business_category, business_type FROM tenants;
