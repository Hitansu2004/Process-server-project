-- ProcessServe Database - Complete Seed Data
-- Updated: 2024-12-12
-- Includes tenant-1 (existing) with metadata + tenant-2 (new)

-- Use password: 'password' for all test users

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
TRUNCATE TABLE notifications;
TRUNCATE TABLE ratings;
TRUNCATE TABLE delivery_attempts;
TRUNCATE TABLE bids;
TRUNCATE TABLE contact_book_entries;
TRUNCATE TABLE order_dropoffs;
TRUNCATE TABLE orders;
TRUNCALE TABLE process_server_profiles;
TRUNCATE TABLE customer_profiles;
TRUNCATE TABLE tenant_user_roles;
TRUNCATE TABLE global_users;
TRUNCATE TABLE tenants;

SET FOREIGN_KEY_CHECKS = 1;

-- =======================
-- TENANTS
-- =======================

-- Tenant 1: Demo Shop (Updated with metadata)
INSERT INTO tenants (
    id, name, domain_url, subdomain, api_key, subscription_tier, is_active,
    business_email, business_phone, business_address, business_category, business_type,
    contact_person_name, contact_person_email, contact_person_phone,
    tax_id, license_number, website_url, timezone, currency
) VALUES (
    'tenant-1', 'Demo Shop', 'http://localhost:3000', 'demo', 'api-key-1', 'PREMIUM', 1,
    'contact@demoshop.com', '+1-555-0100', '123 Main Street, New York, NY 10001',
    'PROCESS_SERVING', 'LLC', 'John Manager', 'john@demoshop.com', '+1-555-0101',
    '12-3456789', 'PS-NY-2024-001', 'https://demoshop.processserve.com', 'America/New_York', 'USD'
);

-- Tenant 2: Legal Services Pro
INSERT INTO tenants (
    id, name, domain_url, subdomain, api_key, subscription_tier, is_active,
    business_email, business_phone, business_address, business_category, business_type,
    contact_person_name, contact_person_email, contact_person_phone,
    tax_id, license_number, website_url, timezone, currency
) VALUES (
    'tenant-2', 'Legal Services Pro', 'http://localhost:3000', 'legalservices',
    'api-key-tenant-2-secure-9876543210abcdef', 'BASIC', 1,
    'info@legalservicespro.com', '+1-555-0200', '456 Business Avenue, Brooklyn, NY 11201',
    'LEGAL_SERVICES', 'CORPORATION', 'Sarah Williams', 'sarah.williams@legalservicespro.com', '+1-555-0201',
    '98-7654321', 'LS-NY-2024-042', 'https://legalservicespro.com', 'America/New_York', 'USD'
);

-- Continue importing from current_data_dump.sql for tenant-1 users...
-- (This file will be properly generated after running the update script)

SELECT 'Seed data schema created. Run update-database.sh to populate with complete data.' as Status;
