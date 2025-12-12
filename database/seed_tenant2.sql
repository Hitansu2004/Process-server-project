-- Seed Data for Tenant 2: Legal Services Pro
-- Creates a complete second tenant with 2 customers and 4 process servers

USE processserve_db;

-- Insert Tenant 2
INSERT INTO tenants (
    id, name, domain_url, subdomain, api_key, subscription_tier, 
    is_active, business_email, business_phone, business_address,
    business_category, business_type, contact_person_name, 
    contact_person_email, contact_person_phone, tax_id, license_number,
    website_url, timezone, currency
) VALUES (
    'tenant-2', 
    'Legal Services Pro', 
    'http://localhost:3000', 
    'legalservices', 
    'api-key-tenant-2-secure-9876543210abcdef', 
    'BASIC',
    TRUE,
    'info@legalservicespro.com',
    '+1-555-0200',
    '456 Business Avenue, Brooklyn, NY 11201',
    'LEGAL_SERVICES',
    'CORPORATION',
    'Sarah Williams',
    'sarah.williams@legalservicespro.com',
    '+1-555-0201',
    '98-7654321',
    'LS-NY-2024-042',
    'https://legalservicespro.com',
    'America/New_York',
    'USD'
);

-- Create global users for tenant-2
-- Tenant Admin
INSERT INTO global_users (id, email, password_hash, first_name, last_name, phone_number, is_super_admin, email_verified, is_active) VALUES
('tenant2-admin-uuid', 'admin@legalservicespro.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Sarah', 'Williams', '+1-555-0201', FALSE, TRUE, TRUE);

-- Customers for Tenant 2
INSERT INTO global_users (id, email, password_hash, first_name, last_name, phone_number, is_super_admin, email_verified, is_active) VALUES
('tenant2-customer1-uuid', 'alice@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Alice', 'Johnson', '+1-555-1001', FALSE, TRUE, TRUE),
('tenant2-customer2-uuid', 'bob@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Bob', 'Martinez', '+1-555-1002', FALSE, TRUE, TRUE);

-- Process Servers for Tenant 2
INSERT INTO global_users (id, email, password_hash, first_name, last_name, phone_number, is_super_admin, email_verified, is_active) VALUES
('tenant2-server1-uuid', 'james.server@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'James', 'Server', '+1-555-2001', FALSE, TRUE, TRUE),
('tenant2-server2-uuid', 'maria.server@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Maria', 'Rodriguez', '+1-555-2002', FALSE, TRUE, TRUE),
('tenant2-server3-uuid', 'david.server@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'David', 'Chen', '+1-555-2003', FALSE, TRUE, TRUE),
('tenant2-server4-uuid', 'linda.server@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Linda', 'Thompson', '+1-555-2004', FALSE, TRUE, TRUE);

-- Create tenant user roles
INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role, is_active) VALUES
-- Admin
('tenant2-admin-role', 'tenant2-admin-uuid', 'tenant-2', 'TENANT_ADMIN', TRUE),
-- Customers
('tenant2-customer1-role', 'tenant2-customer1-uuid', 'tenant-2', 'CUSTOMER', TRUE),
('tenant2-customer2-role', 'tenant2-customer2-uuid', 'tenant-2', 'CUSTOMER', TRUE),
-- Process Servers
('tenant2-server1-role', 'tenant2-server1-uuid', 'tenant-2', 'PROCESS_SERVER', TRUE),
('tenant2-server2-role', 'tenant2-server2-uuid', 'tenant-2', 'PROCESS_SERVER', TRUE),
('tenant2-server3-role', 'tenant2-server3-uuid', 'tenant-2', 'PROCESS_SERVER', TRUE),
('tenant2-server4-role', 'tenant2-server4-uuid', 'tenant-2', 'PROCESS_SERVER', TRUE);

-- Create customer profiles
INSERT INTO customer_profiles (id, tenant_user_role_id, default_zip_code, default_address) VALUES
('tenant2-customer1-profile', 'tenant2-customer1-role', '11201', '789 Park Avenue, Brooklyn, NY 11201'),
('tenant2-customer2-profile', 'tenant2-customer2-role', '11201', '321 Ocean Drive, Brooklyn, NY 11201');

-- Create process server profiles
INSERT INTO process_server_profiles (
    id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, 
    status, current_rating, total_orders_assigned, successful_deliveries
) VALUES
('tenant2-server1-profile', 'tenant2-server1-role', 'tenant-2', FALSE, '["11201", "11205", "11206"]', 'ACTIVE', 4.8, 15, 13),
('tenant2-server2-profile', 'tenant2-server2-role', 'tenant-2', FALSE, '["11201", "11215", "11217"]', 'ACTIVE', 4.6, 12, 11),
('tenant2-server3-profile', 'tenant2-server3-role', 'tenant-2', FALSE, '["11201", "11231", "11232"]', 'ACTIVE', 4.9, 18, 17),
('tenant2-server4-profile', 'tenant2-server4-role', 'tenant-2', FALSE, '["11201", "11215"]', 'ACTIVE', 4.7, 10, 9);

-- Create sample orders for Tenant 2
INSERT INTO orders (
    id, tenant_id, customer_id, order_number, status, 
    customer_payment_amount, process_server_payout, tenant_commission, super_admin_fee, tenant_profit
) VALUES
('tenant2-order1', 'tenant-2', 'tenant2-customer1-profile', 'LS-2024-001', 'COMPLETED', 150.00, 120.00, 25.00, 5.00, 20.00),
('tenant2-order2', 'tenant-2', 'tenant2-customer1-profile', 'LS-2024-002', 'IN_PROGRESS', 200.00, 160.00, 33.00, 7.00, 26.00),
('tenant2-order3', 'tenant-2', 'tenant2-customer2-profile', 'LS-2024-003', 'COMPLETED', 175.00, 140.00, 29.00, 6.00, 23.00),
('tenant2-order4', 'tenant-2', 'tenant2-customer2-profile', 'LS-2024-004', 'ASSIGNED', 250.00, 200.00, 42.00, 8.00, 34.00),
('tenant2-order5', 'tenant-2', 'tenant2-customer1-profile', 'LS-2024-005', 'COMPLETED', 180.00, 145.00, 29.00, 6.00, 23.00);

-- Create order dropoffs
INSERT INTO order_dropoffs (
    id, order_id, sequence_number, recipient_name, dropoff_address, dropoff_zip_code,
    assigned_process_server_id, dropoff_type, status, final_agreed_price, delivered_at
) VALUES
-- Order 1 - Completed
('tenant2-dropoff1', 'tenant2-order1', 1, 'Michael Brown', '100 Court Street, Brooklyn, NY', '11201', 'tenant2-server1-profile', 'AUTOMATED', 'DELIVERED', 120.00, NOW() - INTERVAL 5 DAY),

-- Order 2 - In Progress
('tenant2-dropoff2', 'tenant2-order2', 1, 'Jennifer Davis', '200 Atlantic Ave, Brooklyn, NY', '11201', 'tenant2-server2-profile', 'GUIDED', 'IN_PROGRESS', 160.00, NULL),

-- Order 3 - Completed
('tenant2-dropoff3', 'tenant2-order3', 1, 'Robert Wilson', '300 Flatbush Ave, Brooklyn, NY', '11215', 'tenant2-server3-profile', 'AUTOMATED', 'DELIVERED', 140.00, NOW() - INTERVAL 2 DAY),

-- Order 4 - Assigned
('tenant2-dropoff4', 'tenant2-order4', 1, 'Patricia Moore', '400 Fifth Avenue, Brooklyn, NY', '11215', 'tenant2-server4-profile', 'AUTOMATED', 'ASSIGNED', 200.00, NULL),

-- Order 5 - Completed
('tenant2-dropoff5', 'tenant2-order5', 1, 'Christopher Taylor', '500 Seventh Street, Brooklyn, NY', '11215', 'tenant2-server1-profile', 'AUTOMATED', 'DELIVERED', 145.00, NOW() - INTERVAL 1 DAY);

-- Create delivery attempts for completed orders
INSERT INTO delivery_attempts (
    id, order_dropoff_id, process_server_id, attempt_number, 
    was_successful, outcome_notes, is_valid_attempt
) VALUES
('tenant2-attempt1', 'tenant2-dropoff1', 'tenant2-server1-profile', 1, TRUE, 'Successfully delivered to recipient', TRUE),
('tenant2-attempt2', 'tenant2-dropoff3', 'tenant2-server3-profile', 1, TRUE, 'Document signed and accepted', TRUE),
('tenant2-attempt3', 'tenant2-dropoff5', 'tenant2-server1-profile', 1, TRUE, 'Delivered at business address', TRUE),
('tenant2-attempt4', 'tenant2-dropoff2', 'tenant2-server2-profile', 1, FALSE, 'Recipient not available, will retry', TRUE);

-- Create some bids for the assigned order
INSERT INTO bids (
    id, order_dropoff_id, process_server_id, bid_amount, status, comment
) VALUES
('tenant2-bid1', 'tenant2-dropoff4', 'tenant2-server4-profile', 200.00, 'ACCEPTED', 'Can deliver within 24 hours'),
('tenant2-bid2', 'tenant2-dropoff4', 'tenant2-server2-profile', 215.00, 'REJECTED', 'Available for immediate delivery'),
('tenant2-bid3', 'tenant2-dropoff4', 'tenant2-server1-profile', 210.00, 'REJECTED', 'Experienced in this area');

-- Create contact book entries
INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname) VALUES
('tenant2-contact1', 'tenant2-customer1-uuid', 'tenant2-server1-profile', 'MANUAL', 'James - Reliable Server'),
('tenant2-contact2', 'tenant2-customer1-uuid', 'tenant2-server3-profile', 'AUTO_ADDED', 'David - Fast Delivery'),
('tenant2-contact3', 'tenant2-customer2-uuid', 'tenant2-server2-profile', 'MANUAL', 'Maria - Local Expert'),
('tenant2-contact4', 'tenant2-customer2-uuid', 'tenant2-server4-profile', 'MANUAL', 'Linda - Professional');

-- Create ratings for completed deliveries
INSERT INTO ratings (
    id, order_id, customer_id, process_server_id, rating, review
) VALUES
('tenant2-rating1', 'tenant2-order1', 'tenant2-customer1-profile', 'tenant2-server1-profile', 5, 'Excellent service, very professional'),
('tenant2-rating2', 'tenant2-order3', 'tenant2-customer2-profile', 'tenant2-server3-profile', 5, 'Fast and efficient delivery'),
('tenant2-rating3', 'tenant2-order5', 'tenant2-customer1-profile', 'tenant2-server1-profile', 4, 'Good service overall');

-- Verify tenant-2 data
SELECT 'Tenant 2 created successfully!' as Status;
SELECT COUNT(*) as 'Total Users' FROM global_users WHERE id LIKE 'tenant2%';
SELECT COUNT(*) as 'Total Orders' FROM orders WHERE tenant_id = 'tenant-2';
SELECT COUNT(*) as 'Process Servers' FROM process_server_profiles WHERE tenant_id = 'tenant-2';
SELECT COUNT(*) as 'Customers' FROM customer_profiles WHERE tenant_user_role_id LIKE 'tenant2-customer%';
