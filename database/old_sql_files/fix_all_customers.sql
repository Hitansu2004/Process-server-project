USE processserve_db;

-- 1. Add Orders for Customer 3 (Missed previously)
-- Customer 3 Profile ID: c3f5911b-8a2f-4315-b5fd-6f454df39d7e (from previous query)
INSERT INTO orders (id, tenant_id, customer_id, order_number, status, pickup_address, pickup_zip_code, deadline, final_agreed_price, has_multiple_dropoffs, total_dropoffs, created_at)
VALUES 
('ord-c3-001', 'tenant-1', 'c3f5911b-8a2f-4315-b5fd-6f454df39d7e', 'C3f59-ORD1', 'OPEN', '333 3rd St, New York, NY', '10030', DATE_ADD(NOW(), INTERVAL 8 DAY), 55.00, FALSE, 1, NOW()),
('ord-c3-002', 'tenant-1', 'c3f5911b-8a2f-4315-b5fd-6f454df39d7e', 'C3f59-ORD2', 'BIDDING', '444 4th St, New York, NY', '10031', DATE_ADD(NOW(), INTERVAL 9 DAY), 65.00, FALSE, 1, NOW());

INSERT INTO order_dropoffs (id, order_id, sequence_number, recipient_name, dropoff_address, dropoff_zip_code, dropoff_type, status, created_at)
VALUES
('drop-c3-001', 'ord-c3-001', 1, 'Recipient C3-1', '555 5th St, New York, NY', '10032', 'AUTOMATED', 'OPEN', NOW()),
('drop-c3-002', 'ord-c3-002', 1, 'Recipient C3-2', '666 6th St, New York, NY', '10033', 'AUTOMATED', 'OPEN', NOW());

-- 2. Update Customer 4 Order to COMPLETED
-- Order: ord-c4-001, Server: 48bff7b9-6dbe-45a4-ba6d-f9c557b39c80 (Server 1)
UPDATE orders 
SET status = 'COMPLETED', process_server_payout = 60.00, completed_at = NOW()
WHERE id = 'ord-c4-001';

UPDATE order_dropoffs
SET status = 'DELIVERED', assigned_process_server_id = '48bff7b9-6dbe-45a4-ba6d-f9c557b39c80', delivered_at = NOW()
WHERE id = 'drop-c4-001';

-- Add Contact for Customer 4
INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname, created_at)
VALUES 
('contact-c4-ps1', '0e1b5d79-887f-4a2b-8450-01c385e4ed18', '48bff7b9-6dbe-45a4-ba6d-f9c557b39c80', 'AUTO_ADDED', 'Auto Server 1', NOW());

-- 3. Update Customer 5 Order to COMPLETED
-- Order: ord-c5-001, Server: 2a1a85f4-103e-47a8-b259-3abf738337c7 (Server 2)
UPDATE orders 
SET status = 'COMPLETED', process_server_payout = 90.00, completed_at = NOW()
WHERE id = 'ord-c5-001';

UPDATE order_dropoffs
SET status = 'DELIVERED', assigned_process_server_id = '2a1a85f4-103e-47a8-b259-3abf738337c7', delivered_at = NOW()
WHERE id = 'drop-c5-001';

-- Add Contact for Customer 5
INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname, created_at)
VALUES 
('contact-c5-ps2', 'ab3435d4-7174-4989-b443-b9d60bff298f', '2a1a85f4-103e-47a8-b259-3abf738337c7', 'AUTO_ADDED', 'Auto Server 2', NOW());

-- 4. Update Customer 3 Order to COMPLETED (Newly created)
-- Order: ord-c3-001, Server: bb008306-dbca-4dfe-b99c-cf9bc7f6c4ea (Server 3)
UPDATE orders 
SET status = 'COMPLETED', process_server_payout = 55.00, completed_at = NOW()
WHERE id = 'ord-c3-001';

UPDATE order_dropoffs
SET status = 'DELIVERED', assigned_process_server_id = 'bb008306-dbca-4dfe-b99c-cf9bc7f6c4ea', delivered_at = NOW()
WHERE id = 'drop-c3-001';

-- Add Contact for Customer 3
-- Need Customer 3 Global ID. Querying it dynamically or hardcoding if known.
-- From previous 'global_users' query, I didn't get Customer 3 ID explicitly in the last step, but I can subquery it.
INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname, created_at)
VALUES 
('contact-c3-ps3', (SELECT id FROM global_users WHERE email = 'customer3@example.com'), 'bb008306-dbca-4dfe-b99c-cf9bc7f6c4ea', 'AUTO_ADDED', 'Auto Server 3', NOW());
