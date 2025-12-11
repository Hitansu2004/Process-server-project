USE processserve_db;
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE contact_book_entries;
TRUNCATE TABLE notifications;
TRUNCATE TABLE ratings;
TRUNCATE TABLE delivery_attempts;
TRUNCATE TABLE bids;
TRUNCATE TABLE order_dropoffs;
TRUNCATE TABLE orders;
TRUNCATE TABLE process_server_profiles;
TRUNCATE TABLE customer_profiles;
TRUNCATE TABLE tenant_user_roles;
TRUNCATE TABLE global_users;
TRUNCATE TABLE tenants;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO tenants (id, name, domain_url, subdomain, api_key, subscription_tier, is_active, business_hours, pricing_config, notification_settings)
VALUES ('550e8400-e29b-41d4-a716-446655440001', 'ProcessServe NY', 'ny.processserve.com', 'processserve-ny', 'api_key_ny_001', 'PREMIUM', TRUE,
'{"monday": {"open": "09:00", "close": "18:00", "enabled": true}, "tuesday": {"open": "09:00", "close": "18:00", "enabled": true}, "wednesday": {"open": "09:00", "close": "18:00", "enabled": true}, "thursday": {"open": "09:00", "close": "18:00", "enabled": true}, "friday": {"open": "09:00", "close": "18:00", "enabled": true}, "saturday": {"open": "09:00", "close": "18:00", "enabled": true}, "sunday": {"open": "09:00", "close": "18:00", "enabled": true}}',
'{"minimumOrderPrice": 50.00, "commissionRate": 15}',
'{"emailForNewOrders": true, "smsForDelivery": true, "weeklyReports": false}');


INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
VALUES ('user-admin-0001-0000-0000-000000000000', 'admin@processserve.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Admin', 'User', FALSE, TRUE);

INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
VALUES ('role-admin-0001-0000-0000-000000000000', 'user-admin-0001-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'TENANT_ADMIN');


    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-cust-0001-0000-0000-000000000000', 'customer1@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Customer', '1', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-cust-0001-0000-0000-000000000000', 'user-cust-0001-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'CUSTOMER');

    INSERT INTO customer_profiles (id, tenant_user_role_id, default_address, default_zip_code)
    VALUES ('prof-cust-0001-0000-0000-000000000000', 'role-cust-0001-0000-0000-000000000000', '123 Customer St 1', '10001');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-cust-0002-0000-0000-000000000000', 'customer2@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Customer', '2', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-cust-0002-0000-0000-000000000000', 'user-cust-0002-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'CUSTOMER');

    INSERT INTO customer_profiles (id, tenant_user_role_id, default_address, default_zip_code)
    VALUES ('prof-cust-0002-0000-0000-000000000000', 'role-cust-0002-0000-0000-000000000000', '123 Customer St 2', '10002');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-cust-0003-0000-0000-000000000000', 'customer3@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Customer', '3', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-cust-0003-0000-0000-000000000000', 'user-cust-0003-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'CUSTOMER');

    INSERT INTO customer_profiles (id, tenant_user_role_id, default_address, default_zip_code)
    VALUES ('prof-cust-0003-0000-0000-000000000000', 'role-cust-0003-0000-0000-000000000000', '123 Customer St 3', '10003');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-cust-0004-0000-0000-000000000000', 'customer4@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Customer', '4', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-cust-0004-0000-0000-000000000000', 'user-cust-0004-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'CUSTOMER');

    INSERT INTO customer_profiles (id, tenant_user_role_id, default_address, default_zip_code)
    VALUES ('prof-cust-0004-0000-0000-000000000000', 'role-cust-0004-0000-0000-000000000000', '123 Customer St 4', '10004');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-cust-0005-0000-0000-000000000000', 'customer5@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Customer', '5', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-cust-0005-0000-0000-000000000000', 'user-cust-0005-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'CUSTOMER');

    INSERT INTO customer_profiles (id, tenant_user_role_id, default_address, default_zip_code)
    VALUES ('prof-cust-0005-0000-0000-000000000000', 'role-cust-0005-0000-0000-000000000000', '123 Customer St 5', '10005');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0001-0000-0000-000000000000', 'server1@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 1', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0001-0000-0000-000000000000', 'user-ps-0001-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0001-0000-0000-000000000000', 'role-ps-0001-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0002-0000-0000-000000000000', 'server2@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 2', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0002-0000-0000-000000000000', 'user-ps-0002-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0002-0000-0000-000000000000', 'role-ps-0002-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0003-0000-0000-000000000000', 'server3@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 3', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0003-0000-0000-000000000000', 'user-ps-0003-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0003-0000-0000-000000000000', 'role-ps-0003-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0004-0000-0000-000000000000', 'server4@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 4', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0004-0000-0000-000000000000', 'user-ps-0004-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0004-0000-0000-000000000000', 'role-ps-0004-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0005-0000-0000-000000000000', 'server5@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 5', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0005-0000-0000-000000000000', 'user-ps-0005-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0005-0000-0000-000000000000', 'role-ps-0005-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0006-0000-0000-000000000000', 'server6@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 6', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0006-0000-0000-000000000000', 'user-ps-0006-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0006-0000-0000-000000000000', 'role-ps-0006-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0007-0000-0000-000000000000', 'server7@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 7', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0007-0000-0000-000000000000', 'user-ps-0007-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0007-0000-0000-000000000000', 'role-ps-0007-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0008-0000-0000-000000000000', 'server8@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 8', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0008-0000-0000-000000000000', 'user-ps-0008-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0008-0000-0000-000000000000', 'role-ps-0008-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0009-0000-0000-000000000000', 'server9@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 9', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0009-0000-0000-000000000000', 'user-ps-0009-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0009-0000-0000-000000000000', 'role-ps-0009-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0010-0000-0000-000000000000', 'server10@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 10', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0010-0000-0000-000000000000', 'user-ps-0010-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0010-0000-0000-000000000000', 'role-ps-0010-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0011-0000-0000-000000000000', 'server11@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 11', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0011-0000-0000-000000000000', 'user-ps-0011-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0011-0000-0000-000000000000', 'role-ps-0011-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0012-0000-0000-000000000000', 'server12@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 12', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0012-0000-0000-000000000000', 'user-ps-0012-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0012-0000-0000-000000000000', 'role-ps-0012-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0013-0000-0000-000000000000', 'server13@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 13', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0013-0000-0000-000000000000', 'user-ps-0013-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0013-0000-0000-000000000000', 'role-ps-0013-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0014-0000-0000-000000000000', 'server14@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 14', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0014-0000-0000-000000000000', 'user-ps-0014-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0014-0000-0000-000000000000', 'role-ps-0014-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0015-0000-0000-000000000000', 'server15@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 15', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0015-0000-0000-000000000000', 'user-ps-0015-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0015-0000-0000-000000000000', 'role-ps-0015-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0016-0000-0000-000000000000', 'server16@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 16', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0016-0000-0000-000000000000', 'user-ps-0016-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0016-0000-0000-000000000000', 'role-ps-0016-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0017-0000-0000-000000000000', 'server17@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 17', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0017-0000-0000-000000000000', 'user-ps-0017-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0017-0000-0000-000000000000', 'role-ps-0017-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0018-0000-0000-000000000000', 'server18@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 18', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0018-0000-0000-000000000000', 'user-ps-0018-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0018-0000-0000-000000000000', 'role-ps-0018-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0019-0000-0000-000000000000', 'server19@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 19', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0019-0000-0000-000000000000', 'user-ps-0019-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0019-0000-0000-000000000000', 'role-ps-0019-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0020-0000-0000-000000000000', 'server20@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 20', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0020-0000-0000-000000000000', 'user-ps-0020-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0020-0000-0000-000000000000', 'role-ps-0020-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0021-0000-0000-000000000000', 'server21@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 21', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0021-0000-0000-000000000000', 'user-ps-0021-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0021-0000-0000-000000000000', 'role-ps-0021-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0022-0000-0000-000000000000', 'server22@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 22', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0022-0000-0000-000000000000', 'user-ps-0022-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0022-0000-0000-000000000000', 'role-ps-0022-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0023-0000-0000-000000000000', 'server23@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 23', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0023-0000-0000-000000000000', 'user-ps-0023-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0023-0000-0000-000000000000', 'role-ps-0023-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0024-0000-0000-000000000000', 'server24@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 24', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0024-0000-0000-000000000000', 'user-ps-0024-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0024-0000-0000-000000000000', 'role-ps-0024-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-ps-0025-0000-0000-000000000000', 'server25@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Process', 'Server 25', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-ps-0025-0000-0000-000000000000', 'user-ps-0025-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-ps-0025-0000-0000-000000000000', 'role-ps-0025-0000-0000-000000000000', '["10001", "10002", "10003"]', 4.5, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-gps-0001-0000-0000-000000000000', 'global_server_1@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Global', 'Server_1', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-gps-0001-0000-0000-000000000000', 'user-gps-0001-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-gps-0001-0000-0000-000000000000', 'role-gps-0001-0000-0000-000000000000', '["10001", "10002", "10003"]', 5.0, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-gps-0002-0000-0000-000000000000', 'global_server_2@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Global', 'Server_2', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-gps-0002-0000-0000-000000000000', 'user-gps-0002-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-gps-0002-0000-0000-000000000000', 'role-gps-0002-0000-0000-000000000000', '["10001", "10002", "10003"]', 5.0, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-gps-0003-0000-0000-000000000000', 'global_server_3@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Global', 'Server_3', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-gps-0003-0000-0000-000000000000', 'user-gps-0003-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-gps-0003-0000-0000-000000000000', 'role-gps-0003-0000-0000-000000000000', '["10001", "10002", "10003"]', 5.0, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-gps-0004-0000-0000-000000000000', 'global_server_4@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Global', 'Server_4', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-gps-0004-0000-0000-000000000000', 'user-gps-0004-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-gps-0004-0000-0000-000000000000', 'role-gps-0004-0000-0000-000000000000', '["10001", "10002", "10003"]', 5.0, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-gps-0005-0000-0000-000000000000', 'global_server_5@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Global', 'Server_5', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-gps-0005-0000-0000-000000000000', 'user-gps-0005-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-gps-0005-0000-0000-000000000000', 'role-gps-0005-0000-0000-000000000000', '["10001", "10002", "10003"]', 5.0, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-gps-0006-0000-0000-000000000000', 'global_server_6@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Global', 'Server_6', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-gps-0006-0000-0000-000000000000', 'user-gps-0006-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-gps-0006-0000-0000-000000000000', 'role-gps-0006-0000-0000-000000000000', '["10001", "10002", "10003"]', 5.0, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-gps-0007-0000-0000-000000000000', 'global_server_7@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Global', 'Server_7', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-gps-0007-0000-0000-000000000000', 'user-gps-0007-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-gps-0007-0000-0000-000000000000', 'role-gps-0007-0000-0000-000000000000', '["10001", "10002", "10003"]', 5.0, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-gps-0008-0000-0000-000000000000', 'global_server_8@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Global', 'Server_8', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-gps-0008-0000-0000-000000000000', 'user-gps-0008-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-gps-0008-0000-0000-000000000000', 'role-gps-0008-0000-0000-000000000000', '["10001", "10002", "10003"]', 5.0, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-gps-0009-0000-0000-000000000000', 'global_server_9@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Global', 'Server_9', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-gps-0009-0000-0000-000000000000', 'user-gps-0009-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-gps-0009-0000-0000-000000000000', 'role-gps-0009-0000-0000-000000000000', '["10001", "10002", "10003"]', 5.0, 'ACTIVE');
    

    INSERT INTO global_users (id, email, password_hash, first_name, last_name, is_super_admin, email_verified)
    VALUES ('user-gps-0010-0000-0000-000000000000', 'global_server_10@example.com', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Global', 'Server_10', FALSE, TRUE);

    INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role)
    VALUES ('role-gps-0010-0000-0000-000000000000', 'user-gps-0010-0000-0000-000000000000', '550e8400-e29b-41d4-a716-446655440001', 'PROCESS_SERVER');

    INSERT INTO process_server_profiles (id, tenant_user_role_id, operating_zip_codes, current_rating, status)
    VALUES ('prof-gps-0010-0000-0000-000000000000', 'role-gps-0010-0000-0000-000000000000', '["10001", "10002", "10003"]', 5.0, 'ACTIVE');
    

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('a98e5c64-881a-408e-89ed-395a04222e5d', 'role-cust-0001-0000-0000-000000000000', 'prof-ps-0001-0000-0000-000000000000', 'MANUAL', 'My Server 1');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('4fea79f1-65e3-4a08-99cc-f38d04aadaac', 'role-cust-0001-0000-0000-000000000000', 'prof-ps-0002-0000-0000-000000000000', 'MANUAL', 'My Server 2');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('8077f71e-705b-4468-a9bf-ca8f0c6a05fb', 'role-cust-0001-0000-0000-000000000000', 'prof-ps-0003-0000-0000-000000000000', 'MANUAL', 'My Server 3');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('3d192d9f-2b00-4bdf-b19b-af0004b095f8', 'role-cust-0001-0000-0000-000000000000', 'prof-ps-0004-0000-0000-000000000000', 'MANUAL', 'My Server 4');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('20be9723-539f-403d-9869-9a2351ff8957', 'role-cust-0001-0000-0000-000000000000', 'prof-ps-0005-0000-0000-000000000000', 'MANUAL', 'My Server 5');
            

    INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
    VALUES ('15bb573f-e04a-45d7-abac-635aeb6194a7', 'role-cust-0001-0000-0000-000000000000', 'prof-ps-0011-0000-0000-000000000000', 'AUTO_ADDED', 'Auto Server');
    

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('52be5be0-7e7a-419f-aae6-ea6797d63296', 'role-cust-0002-0000-0000-000000000000', 'prof-ps-0006-0000-0000-000000000000', 'MANUAL', 'My Server 6');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('9335bac7-78bf-4670-b5c2-d8c711797c8d', 'role-cust-0002-0000-0000-000000000000', 'prof-ps-0007-0000-0000-000000000000', 'MANUAL', 'My Server 7');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('de5bd715-9e57-4174-88f1-479de194e1f8', 'role-cust-0002-0000-0000-000000000000', 'prof-ps-0008-0000-0000-000000000000', 'MANUAL', 'My Server 8');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('76280347-719a-4f20-b035-2bb958158742', 'role-cust-0002-0000-0000-000000000000', 'prof-ps-0009-0000-0000-000000000000', 'MANUAL', 'My Server 9');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('3b817d71-59d7-4fb8-a4a2-3357f5a75701', 'role-cust-0002-0000-0000-000000000000', 'prof-ps-0010-0000-0000-000000000000', 'MANUAL', 'My Server 10');
            

    INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
    VALUES ('e42c0a9d-f9a1-465f-b263-32e0640fd036', 'role-cust-0002-0000-0000-000000000000', 'prof-ps-0016-0000-0000-000000000000', 'AUTO_ADDED', 'Auto Server');
    

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('a0fc642b-c62a-4c7d-a6b0-8edd646844c0', 'role-cust-0003-0000-0000-000000000000', 'prof-ps-0011-0000-0000-000000000000', 'MANUAL', 'My Server 11');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('69fa17fb-295a-4037-8cec-c64923e9d00a', 'role-cust-0003-0000-0000-000000000000', 'prof-ps-0012-0000-0000-000000000000', 'MANUAL', 'My Server 12');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('abf33a6d-c1bd-4311-b0c1-4948514c81bc', 'role-cust-0003-0000-0000-000000000000', 'prof-ps-0013-0000-0000-000000000000', 'MANUAL', 'My Server 13');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('be0908a5-dafe-40a8-8ed0-dda287a6ef88', 'role-cust-0003-0000-0000-000000000000', 'prof-ps-0014-0000-0000-000000000000', 'MANUAL', 'My Server 14');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('b914c1fe-5718-4177-a554-d2a6e9b7910d', 'role-cust-0003-0000-0000-000000000000', 'prof-ps-0015-0000-0000-000000000000', 'MANUAL', 'My Server 15');
            

    INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
    VALUES ('fe296e97-beb6-41b1-9f7e-be03c8308903', 'role-cust-0003-0000-0000-000000000000', 'prof-ps-0021-0000-0000-000000000000', 'AUTO_ADDED', 'Auto Server');
    

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('5b73cf52-e5ac-47aa-9dae-1662b60b9939', 'role-cust-0004-0000-0000-000000000000', 'prof-ps-0016-0000-0000-000000000000', 'MANUAL', 'My Server 16');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('93973373-8068-4e59-9dc7-f9dd5fa27091', 'role-cust-0004-0000-0000-000000000000', 'prof-ps-0017-0000-0000-000000000000', 'MANUAL', 'My Server 17');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('91c11382-0e9e-4ad1-b37b-47b0b7fcbff4', 'role-cust-0004-0000-0000-000000000000', 'prof-ps-0018-0000-0000-000000000000', 'MANUAL', 'My Server 18');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('56aa991e-21f8-4d5d-9a77-484a9676c846', 'role-cust-0004-0000-0000-000000000000', 'prof-ps-0019-0000-0000-000000000000', 'MANUAL', 'My Server 19');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('d406423c-5c79-4054-af95-4ddfbb5a08e5', 'role-cust-0004-0000-0000-000000000000', 'prof-ps-0020-0000-0000-000000000000', 'MANUAL', 'My Server 20');
            

    INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
    VALUES ('0de65ec3-9d45-4505-8bbe-686428af1bc8', 'role-cust-0004-0000-0000-000000000000', 'prof-ps-0001-0000-0000-000000000000', 'AUTO_ADDED', 'Auto Server');
    

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('814a721c-7d7f-4d4e-9dd8-2e2593746549', 'role-cust-0005-0000-0000-000000000000', 'prof-ps-0021-0000-0000-000000000000', 'MANUAL', 'My Server 21');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('2a0fcc3c-aec1-429b-ad5c-932f36ed998e', 'role-cust-0005-0000-0000-000000000000', 'prof-ps-0022-0000-0000-000000000000', 'MANUAL', 'My Server 22');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('6cd637dc-b897-4522-a07b-69e270fcbe26', 'role-cust-0005-0000-0000-000000000000', 'prof-ps-0023-0000-0000-000000000000', 'MANUAL', 'My Server 23');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('11eb2d7d-d631-4e2c-a980-f5701a9b17c6', 'role-cust-0005-0000-0000-000000000000', 'prof-ps-0024-0000-0000-000000000000', 'MANUAL', 'My Server 24');
            

            INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
            VALUES ('3016d583-6bd5-4692-9ba1-98f9141228f8', 'role-cust-0005-0000-0000-000000000000', 'prof-ps-0025-0000-0000-000000000000', 'MANUAL', 'My Server 25');
            

    INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
    VALUES ('48630bce-1abf-4183-983c-559ab3859eae', 'role-cust-0005-0000-0000-000000000000', 'prof-ps-0006-0000-0000-000000000000', 'AUTO_ADDED', 'Auto Server');
    

    INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
    VALUES ('a6d92792-7090-4df9-bdf8-b5e3e87632c1', 'role-admin-0001-0000-0000-000000000000', 'prof-ps-0001-0000-0000-000000000000', 'MANUAL', 'Admin Server 1');
    

    INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
    VALUES ('a758e8e6-6459-4e50-906c-5bcb6a05cb26', 'role-admin-0001-0000-0000-000000000000', 'prof-ps-0002-0000-0000-000000000000', 'MANUAL', 'Admin Server 2');
    

    INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
    VALUES ('a6ac7316-37e1-420f-93a0-0442edc4334d', 'role-admin-0001-0000-0000-000000000000', 'prof-ps-0003-0000-0000-000000000000', 'MANUAL', 'Admin Server 3');
    

    INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
    VALUES ('cb354652-55ef-4178-a08d-b43284b839fd', 'role-admin-0001-0000-0000-000000000000', 'prof-ps-0004-0000-0000-000000000000', 'MANUAL', 'Admin Server 4');
    

    INSERT INTO contact_book_entries (id, owner_user_role_id, process_server_id, entry_type, nickname)
    VALUES ('6d2b75c1-8da2-426c-8fcb-c8305b604f72', 'role-admin-0001-0000-0000-000000000000', 'prof-ps-0005-0000-0000-000000000000', 'MANUAL', 'Admin Server 5');
    
