SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
TRUNCATE TABLE ratings;
TRUNCATE TABLE delivery_attempts;
TRUNCATE TABLE bids;
TRUNCATE TABLE contact_book_entries;
TRUNCATE TABLE order_dropoffs;
TRUNCATE TABLE orders;
TRUNCATE TABLE process_server_profiles;
TRUNCATE TABLE customer_profiles;
TRUNCATE TABLE tenant_user_roles;
TRUNCATE TABLE global_users;
TRUNCATE TABLE tenants;
SET FOREIGN_KEY_CHECKS = 1;

    INSERT INTO tenants (id, name, domain_url, subdomain, api_key, subscription_tier) VALUES 
    ('tenant-1', 'Demo Shop', 'http://localhost:3000', 'demo', 'api-key-1', 'PREMIUM');
    
INSERT INTO global_users (id, email, password_hash, first_name, last_name, phone_number, is_super_admin, email_verified, is_active) VALUES
('633524dd-afc9-4ea4-b332-5be16c81581b', 'superadmin@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Super', 'Admin', '1234567890', TRUE, TRUE, TRUE),
('65847941-90b2-4dc0-9775-7bc6f6cd5ffd', 'admin@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Tenant', 'Admin', '1234567890', FALSE, TRUE, TRUE),
('aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e', 'customer1@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Customer', '1', '1234567890', FALSE, TRUE, TRUE),
('17812fce-9c0b-493c-9e4b-0189fb1c31c8', 'customer2@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Customer', '2', '1234567890', FALSE, TRUE, TRUE),
('9db8f52f-b73d-49a4-8831-48781f9d90a2', 'customer3@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Customer', '3', '1234567890', FALSE, TRUE, TRUE),
('0e1b5d79-887f-4a2b-8450-01c385e4ed18', 'customer4@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Customer', '4', '1234567890', FALSE, TRUE, TRUE),
('ab3435d4-7174-4989-b443-b9d60bff298f', 'customer5@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Customer', '5', '1234567890', FALSE, TRUE, TRUE),
('de973c92-8a81-4c5b-bef6-ff338f58c4ff', 'server1@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '1', '1234567890', FALSE, TRUE, TRUE),
('ad038547-4a84-401e-b835-4e81980f831a', 'server2@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '2', '1234567890', FALSE, TRUE, TRUE),
('7f7293fd-1c0e-4ba9-bad7-2d34f9aeb17e', 'server3@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '3', '1234567890', FALSE, TRUE, TRUE),
('2cb64b0b-d8c5-4e3b-9789-e76f04bc4adb', 'server4@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '4', '1234567890', FALSE, TRUE, TRUE),
('761ccd90-fd1a-4fa1-b670-02d0b8eb4898', 'server5@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '5', '1234567890', FALSE, TRUE, TRUE),
('5aae69d1-93a7-4e5b-94c5-23292a233661', 'server6@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '6', '1234567890', FALSE, TRUE, TRUE),
('4194ddff-48bf-4f28-86eb-4f37f7ae4148', 'server7@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '7', '1234567890', FALSE, TRUE, TRUE),
('685d2fb7-4e36-42e7-bf59-861c47f73fdc', 'server8@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '8', '1234567890', FALSE, TRUE, TRUE),
('9c91161a-dbc9-49c1-a127-ba2ce748b26a', 'server9@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '9', '1234567890', FALSE, TRUE, TRUE),
('d0731bfe-50f8-473d-b2c6-63a52e821057', 'server10@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '10', '1234567890', FALSE, TRUE, TRUE),
('a4dbc7a9-f79a-4996-bf89-88ebcd99e295', 'server11@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '11', '1234567890', FALSE, TRUE, TRUE),
('2afc9c3f-827c-43ad-956f-7762b74c2c25', 'server12@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '12', '1234567890', FALSE, TRUE, TRUE),
('7ebf2a5c-ed87-4250-aeb6-1f2d90d2fa37', 'server13@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '13', '1234567890', FALSE, TRUE, TRUE),
('e82e4649-6064-47d2-bedc-94a862e4c632', 'server14@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '14', '1234567890', FALSE, TRUE, TRUE),
('d5e39f5e-032e-4fad-b10a-114df88b6d90', 'server15@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '15', '1234567890', FALSE, TRUE, TRUE),
('f2dbcf51-98b7-45ca-b969-d168d5231858', 'server16@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '16', '1234567890', FALSE, TRUE, TRUE),
('b315cb64-1ab5-4a54-92c9-1a4e50d9b59d', 'server17@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '17', '1234567890', FALSE, TRUE, TRUE),
('0eac2f5f-d2ee-4900-8835-14f8d2252786', 'server18@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '18', '1234567890', FALSE, TRUE, TRUE),
('544a564b-e42e-4a04-b70c-a5b687786c1a', 'server19@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '19', '1234567890', FALSE, TRUE, TRUE),
('4310fc71-297d-47f5-8e76-205ae6afe5ef', 'server20@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '20', '1234567890', FALSE, TRUE, TRUE),
('9054a5b9-4571-4028-b024-e20f21b78ea3', 'server21@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '21', '1234567890', FALSE, TRUE, TRUE),
('31ce36ab-9687-481e-95b2-492e39a89785', 'server22@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '22', '1234567890', FALSE, TRUE, TRUE),
('c757a300-4629-47df-b1b2-e03f73098643', 'server23@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '23', '1234567890', FALSE, TRUE, TRUE),
('3e866278-45b7-4bf0-975c-d3e3ff807183', 'server24@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '24', '1234567890', FALSE, TRUE, TRUE),
('bee0849d-781f-4a28-8d54-e550c9b4aec2', 'server25@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Server', '25', '1234567890', FALSE, TRUE, TRUE),
('a05f33f6-2344-4edf-96e8-39631b1a6177', 'global1@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Global', 'Server 1', '1234567890', FALSE, TRUE, TRUE),
('bf47e549-ae40-478c-9b6f-d0a7f08c7033', 'global2@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Global', 'Server 2', '1234567890', FALSE, TRUE, TRUE),
('10a4f742-894c-4d38-9931-b54870f63178', 'global3@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Global', 'Server 3', '1234567890', FALSE, TRUE, TRUE),
('2dd2ec13-e5cf-4285-80e3-178df46ae251', 'global4@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Global', 'Server 4', '1234567890', FALSE, TRUE, TRUE),
('b24abcfb-eb37-4e30-b0e8-c3687877ffac', 'global5@example.com', '$2a$10$yjkg4BIvKSqknK.WqkoJE.6VZMsP67TLFWvP1FMiGvT58XFabIFs2', 'Global', 'Server 5', '1234567890', FALSE, TRUE, TRUE);
INSERT INTO tenant_user_roles (id, global_user_id, tenant_id, role, is_active) VALUES
('7393cdfc-4d3c-4469-8792-14cc87ac34ac', '65847941-90b2-4dc0-9775-7bc6f6cd5ffd', 'tenant-1', 'TENANT_ADMIN', TRUE),
('91cdba85-677a-4d4d-a700-f18e7d5947a5', 'aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e', 'tenant-1', 'CUSTOMER', TRUE),
('4e2fb4e7-d993-4044-9b2f-5e37d58c40e9', '17812fce-9c0b-493c-9e4b-0189fb1c31c8', 'tenant-1', 'CUSTOMER', TRUE),
('0d14c615-7243-42b0-a052-9a213b6303aa', '9db8f52f-b73d-49a4-8831-48781f9d90a2', 'tenant-1', 'CUSTOMER', TRUE),
('e932b672-19ca-4966-bc91-18ff31fc42c5', '0e1b5d79-887f-4a2b-8450-01c385e4ed18', 'tenant-1', 'CUSTOMER', TRUE),
('e7bf756a-d7f6-42f1-ab3b-de5be01375f3', 'ab3435d4-7174-4989-b443-b9d60bff298f', 'tenant-1', 'CUSTOMER', TRUE),
('8f1479a0-ef85-4cf6-867a-804bd6540ade', 'de973c92-8a81-4c5b-bef6-ff338f58c4ff', 'tenant-1', 'PROCESS_SERVER', TRUE),
('05aba0c4-ac02-43c6-b690-785dd5644687', 'ad038547-4a84-401e-b835-4e81980f831a', 'tenant-1', 'PROCESS_SERVER', TRUE),
('dd723ba8-4338-4fb5-8a14-fe8168f04b39', '7f7293fd-1c0e-4ba9-bad7-2d34f9aeb17e', 'tenant-1', 'PROCESS_SERVER', TRUE),
('326384f5-5f58-4b95-bde3-e4a400f46604', '2cb64b0b-d8c5-4e3b-9789-e76f04bc4adb', 'tenant-1', 'PROCESS_SERVER', TRUE),
('3e0f7b55-f3f7-41ef-be44-4fec7d18469c', '761ccd90-fd1a-4fa1-b670-02d0b8eb4898', 'tenant-1', 'PROCESS_SERVER', TRUE),
('e45427cf-c9b4-418b-b317-0635ef9fa299', '5aae69d1-93a7-4e5b-94c5-23292a233661', 'tenant-1', 'PROCESS_SERVER', TRUE),
('3746969b-ee0b-4f6d-9c17-c055d6604844', '4194ddff-48bf-4f28-86eb-4f37f7ae4148', 'tenant-1', 'PROCESS_SERVER', TRUE),
('d61e1a5d-0835-46a0-801d-d75ebb8cce7e', '685d2fb7-4e36-42e7-bf59-861c47f73fdc', 'tenant-1', 'PROCESS_SERVER', TRUE),
('5412f3ff-94b5-48e2-8ff5-82db1aae1123', '9c91161a-dbc9-49c1-a127-ba2ce748b26a', 'tenant-1', 'PROCESS_SERVER', TRUE),
('ce9d4599-625d-4cb6-a30a-7b125dc5136f', 'd0731bfe-50f8-473d-b2c6-63a52e821057', 'tenant-1', 'PROCESS_SERVER', TRUE),
('fcea1d4a-ccaa-4d4e-8655-8ad222a1398e', 'a4dbc7a9-f79a-4996-bf89-88ebcd99e295', 'tenant-1', 'PROCESS_SERVER', TRUE),
('35f33b8e-e103-4477-876e-810320b39e22', '2afc9c3f-827c-43ad-956f-7762b74c2c25', 'tenant-1', 'PROCESS_SERVER', TRUE),
('d28b3274-7678-480a-9461-514fbde5bb32', '7ebf2a5c-ed87-4250-aeb6-1f2d90d2fa37', 'tenant-1', 'PROCESS_SERVER', TRUE),
('a96a9166-ca2e-4a11-8a0f-0ab2a500f4ec', 'e82e4649-6064-47d2-bedc-94a862e4c632', 'tenant-1', 'PROCESS_SERVER', TRUE),
('c0e6d995-38cd-4345-bdb6-c23ad9a527e1', 'd5e39f5e-032e-4fad-b10a-114df88b6d90', 'tenant-1', 'PROCESS_SERVER', TRUE),
('d8ce0370-0d89-439c-bd11-79317e43a479', 'f2dbcf51-98b7-45ca-b969-d168d5231858', 'tenant-1', 'PROCESS_SERVER', TRUE),
('9450163d-eddd-403f-a3fe-9c0445759173', 'b315cb64-1ab5-4a54-92c9-1a4e50d9b59d', 'tenant-1', 'PROCESS_SERVER', TRUE),
('ad4f6eb2-f08e-4c25-beb5-578769768ca2', '0eac2f5f-d2ee-4900-8835-14f8d2252786', 'tenant-1', 'PROCESS_SERVER', TRUE),
('424c6a66-f637-44e6-8b98-5c7703e81822', '544a564b-e42e-4a04-b70c-a5b687786c1a', 'tenant-1', 'PROCESS_SERVER', TRUE),
('342c7cd7-df9d-415a-91c1-9329d9d2f52f', '4310fc71-297d-47f5-8e76-205ae6afe5ef', 'tenant-1', 'PROCESS_SERVER', TRUE),
('4e53b949-8778-4409-99ff-6110380c2763', '9054a5b9-4571-4028-b024-e20f21b78ea3', 'tenant-1', 'PROCESS_SERVER', TRUE),
('dbc49783-305c-4a85-b097-3012e203ca93', '31ce36ab-9687-481e-95b2-492e39a89785', 'tenant-1', 'PROCESS_SERVER', TRUE),
('98ddee5e-1495-4b15-9482-7323fa7408e8', 'c757a300-4629-47df-b1b2-e03f73098643', 'tenant-1', 'PROCESS_SERVER', TRUE),
('86682c46-9511-4a44-b6e8-94bdc33db619', '3e866278-45b7-4bf0-975c-d3e3ff807183', 'tenant-1', 'PROCESS_SERVER', TRUE),
('74a94430-e8de-4551-b5fe-aa99407012e6', 'bee0849d-781f-4a28-8d54-e550c9b4aec2', 'tenant-1', 'PROCESS_SERVER', TRUE),
('170a76cc-5180-4cf0-be9d-86a2dfe8721d', 'a05f33f6-2344-4edf-96e8-39631b1a6177', 'tenant-1', 'PROCESS_SERVER', TRUE),
('c0853192-f2c8-4a2e-9731-19e1b61a92da', 'bf47e549-ae40-478c-9b6f-d0a7f08c7033', 'tenant-1', 'PROCESS_SERVER', TRUE),
('e6c2971f-e9f2-49ae-a463-58e41347b695', '10a4f742-894c-4d38-9931-b54870f63178', 'tenant-1', 'PROCESS_SERVER', TRUE),
('9d2a1248-c013-4b52-9ed3-512d5610cff8', '2dd2ec13-e5cf-4285-80e3-178df46ae251', 'tenant-1', 'PROCESS_SERVER', TRUE),
('64d73b77-5e21-4307-8af1-a0ace1a17796', 'b24abcfb-eb37-4e30-b0e8-c3687877ffac', 'tenant-1', 'PROCESS_SERVER', TRUE);
INSERT INTO customer_profiles (id, tenant_user_role_id, default_zip_code) VALUES ('78650ad7-23fc-4eb4-9a5c-f280f0463771', '91cdba85-677a-4d4d-a700-f18e7d5947a5', '10001');
INSERT INTO customer_profiles (id, tenant_user_role_id, default_zip_code) VALUES ('c371b934-2f03-4d8e-8ec6-fdf3470c1aef', '4e2fb4e7-d993-4044-9b2f-5e37d58c40e9', '10001');
INSERT INTO customer_profiles (id, tenant_user_role_id, default_zip_code) VALUES ('c3f5911b-8a2f-4315-b5fd-6f454df39d7e', '0d14c615-7243-42b0-a052-9a213b6303aa', '10001');
INSERT INTO customer_profiles (id, tenant_user_role_id, default_zip_code) VALUES ('d25ec2b5-242a-4b35-80a4-3696c5da745e', 'e932b672-19ca-4966-bc91-18ff31fc42c5', '10001');
INSERT INTO customer_profiles (id, tenant_user_role_id, default_zip_code) VALUES ('3708ddee-f034-4591-83f1-5bf2d6a160fb', 'e7bf756a-d7f6-42f1-ab3b-de5be01375f3', '10001');

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('e4eb5941-83df-425f-aeea-974a91d8f397', '8f1479a0-ef85-4cf6-867a-804bd6540ade', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('48bff7b9-6dbe-45a4-ba6d-f9c557b39c80', '05aba0c4-ac02-43c6-b690-785dd5644687', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('424f9e7d-758e-43b7-8d3d-5931b99625c5', 'dd723ba8-4338-4fb5-8a14-fe8168f04b39', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('bb008306-dbca-4dfe-b99c-cf9bc7f6c4ea', '326384f5-5f58-4b95-bde3-e4a400f46604', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('68656001-bc8d-4c98-a58e-b7a044580561', '3e0f7b55-f3f7-41ef-be44-4fec7d18469c', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('700d2d05-c30a-4657-85df-1ee168d22a81', 'e45427cf-c9b4-418b-b317-0635ef9fa299', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('1bc2a07c-229a-4e59-aa4c-a34d32ecdcfd', '3746969b-ee0b-4f6d-9c17-c055d6604844', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('8a8487bc-b589-4ab7-9dde-92d97ab6c5d5', 'd61e1a5d-0835-46a0-801d-d75ebb8cce7e', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('d9c5d0ad-d836-4bb2-bdd8-962c5d9a8c28', '5412f3ff-94b5-48e2-8ff5-82db1aae1123', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('0c641388-2721-416f-9cbd-d4a0c5d08c80', 'ce9d4599-625d-4cb6-a30a-7b125dc5136f', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('db9829d6-f9c2-4083-93f9-9d65a1bc27c9', 'fcea1d4a-ccaa-4d4e-8655-8ad222a1398e', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('e7900e47-e286-4c3e-9132-a437af07d3be', '35f33b8e-e103-4477-876e-810320b39e22', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('279d0ab1-e1bc-472b-97fa-5f71f71e0408', 'd28b3274-7678-480a-9461-514fbde5bb32', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('d52d5ae6-4f57-4f9b-b9fb-6a926e1f2a56', 'a96a9166-ca2e-4a11-8a0f-0ab2a500f4ec', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('077c8b15-354f-4635-a05f-2961f2458e9b', 'c0e6d995-38cd-4345-bdb6-c23ad9a527e1', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('5d796a83-0a1d-486c-9ba8-762fae8d7af6', 'd8ce0370-0d89-439c-bd11-79317e43a479', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('46e1eaeb-6bf2-40e0-8f19-ade043e2ecff', '9450163d-eddd-403f-a3fe-9c0445759173', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('433ba68e-7941-4731-880a-af029a12087e', 'ad4f6eb2-f08e-4c25-beb5-578769768ca2', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('fc07ca60-4bb9-4968-bd21-9b88a8ee524d', '424c6a66-f637-44e6-8b98-5c7703e81822', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('ab1cfbd7-f20c-4543-bf95-52b130737adb', '342c7cd7-df9d-415a-91c1-9329d9d2f52f', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('31f1bf3e-0643-40c4-85cf-ffdb48aa525c', '4e53b949-8778-4409-99ff-6110380c2763', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('aaa8c9e0-f544-4cb1-8538-87926bc8c82f', 'dbc49783-305c-4a85-b097-3012e203ca93', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('01aac0f9-2747-4c16-8fa3-997bc2ebdb20', '98ddee5e-1495-4b15-9482-7323fa7408e8', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('074eb09e-7a92-43de-a46a-2fdbf6abe6b9', '86682c46-9511-4a44-b6e8-94bdc33db619', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating, total_orders_assigned) 
        VALUES ('d5089847-1ede-428f-bb0c-675f9af65ed9', '74a94430-e8de-4551-b5fe-aa99407012e6', 'tenant-1', FALSE, '["10001", "10002"]', 'ACTIVE', 4.5, 10);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating) 
        VALUES ('2a1a85f4-103e-47a8-b259-3abf738337c7', '170a76cc-5180-4cf0-be9d-86a2dfe8721d', 'tenant-1', TRUE, '["10001", "10002", "10003"]', 'ACTIVE', 5.0);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating) 
        VALUES ('3d49201e-fc56-400e-bd08-b1d78a20e2fd', 'c0853192-f2c8-4a2e-9731-19e1b61a92da', 'tenant-1', TRUE, '["10001", "10002", "10003"]', 'ACTIVE', 5.0);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating) 
        VALUES ('3e6e7943-d737-456e-922b-833ee9ad76b1', 'e6c2971f-e9f2-49ae-a463-58e41347b695', 'tenant-1', TRUE, '["10001", "10002", "10003"]', 'ACTIVE', 5.0);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating) 
        VALUES ('d04e06bd-2c9c-411b-8d3e-9015d86f0ef2', '9d2a1248-c013-4b52-9ed3-512d5610cff8', 'tenant-1', TRUE, '["10001", "10002", "10003"]', 'ACTIVE', 5.0);
        

        INSERT INTO process_server_profiles (id, tenant_user_role_id, tenant_id, is_global, operating_zip_codes, status, current_rating) 
        VALUES ('2e122896-438c-4c38-81d3-04bd6ee2bfdd', '64d73b77-5e21-4307-8af1-a0ace1a17796', 'tenant-1', TRUE, '["10001", "10002", "10003"]', 'ACTIVE', 5.0);
        

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('305fdf39-89fc-420c-90bd-921d65a0678d', 'aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e', 'e4eb5941-83df-425f-aeea-974a91d8f397', 'MANUAL', 'My Server 1');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('cfb15bc5-db28-45bd-af73-5f2bfb1a9756', 'aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e', '48bff7b9-6dbe-45a4-ba6d-f9c557b39c80', 'MANUAL', 'My Server 2');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('0295c5c2-d1e1-4e65-929f-746a443510d6', 'aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e', '424f9e7d-758e-43b7-8d3d-5931b99625c5', 'MANUAL', 'My Server 3');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('42531df6-4f03-43a3-b508-dd4e70c8d855', 'aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e', 'bb008306-dbca-4dfe-b99c-cf9bc7f6c4ea', 'MANUAL', 'My Server 4');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('a46b6f71-6371-4056-8f34-94aa2fcb5a77', 'aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e', '68656001-bc8d-4c98-a58e-b7a044580561', 'MANUAL', 'My Server 5');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('0a2ae0b3-44c4-4a1f-baf4-0c5387ce190d', 'aa1bf200-5fa0-4dc7-b91a-69efb4ad1b3e', 'ab1cfbd7-f20c-4543-bf95-52b130737adb', 'AUTO_ADDED', 'Auto Server 20');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('3f03755e-dc93-4a71-bf08-6f8b31bb4c86', '17812fce-9c0b-493c-9e4b-0189fb1c31c8', '700d2d05-c30a-4657-85df-1ee168d22a81', 'MANUAL', 'My Server 6');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('15bd275b-a238-4364-80e5-14c8b0a5dc7c', '17812fce-9c0b-493c-9e4b-0189fb1c31c8', '1bc2a07c-229a-4e59-aa4c-a34d32ecdcfd', 'MANUAL', 'My Server 7');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('d26b9dc7-9380-4ac1-b620-600e349f32cd', '17812fce-9c0b-493c-9e4b-0189fb1c31c8', '8a8487bc-b589-4ab7-9dde-92d97ab6c5d5', 'MANUAL', 'My Server 8');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('009eba24-76fc-4054-a1f6-fdc6491ead19', '17812fce-9c0b-493c-9e4b-0189fb1c31c8', 'd9c5d0ad-d836-4bb2-bdd8-962c5d9a8c28', 'MANUAL', 'My Server 9');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('75ecbd8a-98cd-4d45-aa10-59133a961bc8', '17812fce-9c0b-493c-9e4b-0189fb1c31c8', '0c641388-2721-416f-9cbd-d4a0c5d08c80', 'MANUAL', 'My Server 10');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('c7c229c7-cd30-419f-aa1d-79fbc1378628', '17812fce-9c0b-493c-9e4b-0189fb1c31c8', 'ab1cfbd7-f20c-4543-bf95-52b130737adb', 'AUTO_ADDED', 'Auto Server 20');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('62b1e717-207f-4e20-8cdd-66be5e38c60b', '9db8f52f-b73d-49a4-8831-48781f9d90a2', 'db9829d6-f9c2-4083-93f9-9d65a1bc27c9', 'MANUAL', 'My Server 11');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('b4c917bc-e0b9-4e82-91f6-65a8ae18f105', '9db8f52f-b73d-49a4-8831-48781f9d90a2', 'e7900e47-e286-4c3e-9132-a437af07d3be', 'MANUAL', 'My Server 12');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('bd5a963c-b258-4a69-b98c-f526ba1c1477', '9db8f52f-b73d-49a4-8831-48781f9d90a2', '279d0ab1-e1bc-472b-97fa-5f71f71e0408', 'MANUAL', 'My Server 13');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('69062645-871a-4369-af33-9cfbcb0d1c3e', '9db8f52f-b73d-49a4-8831-48781f9d90a2', 'd52d5ae6-4f57-4f9b-b9fb-6a926e1f2a56', 'MANUAL', 'My Server 14');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('612130dd-b6f2-44ff-899e-f5cf8da923d8', '9db8f52f-b73d-49a4-8831-48781f9d90a2', '077c8b15-354f-4635-a05f-2961f2458e9b', 'MANUAL', 'My Server 15');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('4413c1db-8d18-4e26-8803-fdf253115308', '9db8f52f-b73d-49a4-8831-48781f9d90a2', 'ab1cfbd7-f20c-4543-bf95-52b130737adb', 'AUTO_ADDED', 'Auto Server 20');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('cace409b-9379-426d-b645-24d1b7c7406c', '0e1b5d79-887f-4a2b-8450-01c385e4ed18', '5d796a83-0a1d-486c-9ba8-762fae8d7af6', 'MANUAL', 'My Server 16');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('25f39da7-7798-41c0-81df-9d02cc32124d', '0e1b5d79-887f-4a2b-8450-01c385e4ed18', '46e1eaeb-6bf2-40e0-8f19-ade043e2ecff', 'MANUAL', 'My Server 17');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('a1a40525-2e91-457c-809f-009d4ab04af3', '0e1b5d79-887f-4a2b-8450-01c385e4ed18', '433ba68e-7941-4731-880a-af029a12087e', 'MANUAL', 'My Server 18');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('b6222a29-c316-4ec1-afa7-1c08e395fe21', '0e1b5d79-887f-4a2b-8450-01c385e4ed18', 'fc07ca60-4bb9-4968-bd21-9b88a8ee524d', 'MANUAL', 'My Server 19');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('4b127055-0088-4ecc-a712-f184b6d21ccf', '0e1b5d79-887f-4a2b-8450-01c385e4ed18', 'ab1cfbd7-f20c-4543-bf95-52b130737adb', 'MANUAL', 'My Server 20');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('c3d6f97b-2792-4d18-a658-251348bed65a', 'ab3435d4-7174-4989-b443-b9d60bff298f', '31f1bf3e-0643-40c4-85cf-ffdb48aa525c', 'MANUAL', 'My Server 21');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('00324380-58c8-48e6-900e-33a737555afd', 'ab3435d4-7174-4989-b443-b9d60bff298f', 'aaa8c9e0-f544-4cb1-8538-87926bc8c82f', 'MANUAL', 'My Server 22');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('6963ec33-40f5-40c6-8b3e-aa3a7318b2d6', 'ab3435d4-7174-4989-b443-b9d60bff298f', '01aac0f9-2747-4c16-8fa3-997bc2ebdb20', 'MANUAL', 'My Server 23');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('e23f8873-ae01-4862-81cf-8c03c544e825', 'ab3435d4-7174-4989-b443-b9d60bff298f', '074eb09e-7a92-43de-a46a-2fdbf6abe6b9', 'MANUAL', 'My Server 24');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('4afd5de9-4dd0-4d03-b545-cf1b4165b28d', 'ab3435d4-7174-4989-b443-b9d60bff298f', 'd5089847-1ede-428f-bb0c-675f9af65ed9', 'MANUAL', 'My Server 25');
            

            INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname)
            VALUES ('b9bcae0b-289f-4c6d-818c-b75f6a0c4fc3', 'ab3435d4-7174-4989-b443-b9d60bff298f', 'ab1cfbd7-f20c-4543-bf95-52b130737adb', 'AUTO_ADDED', 'Auto Server 20');
            