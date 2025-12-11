USE processserve_db;

-- Backfill missing orders for AUTO_ADDED relationships

-- 1. Customer 1 -> Server 11
INSERT INTO orders (id, tenant_id, customer_id, order_number, status, pickup_address, pickup_zip_code, deadline, final_agreed_price, customer_payment_amount, process_server_payout, tenant_commission, super_admin_fee, tenant_profit, created_at, completed_at, total_dropoffs)
VALUES ('fix-ord-001', '550e8400-e29b-41d4-a716-446655440001', '78650ad7-23fc-4eb4-9a5c-f280f0463771', 'FIX-ORD-001', 'COMPLETED', '123 Fix St, NY', '10001', DATE_SUB(NOW(), INTERVAL 5 DAY), 100.00, 120.00, 100.00, 15.00, 5.00, 10.00, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 1);

INSERT INTO order_dropoffs (id, order_id, sequence_number, recipient_name, dropoff_address, dropoff_zip_code, assigned_process_server_id, status, final_agreed_price, attempt_count, delivered_at, created_at)
VALUES ('fix-drop-001', 'fix-ord-001', 1, 'Recipient 1', '456 Fix Ave, NY', '10002', 'db9829d6-f9c2-4083-93f9-9d65a1bc27c9', 'DELIVERED', 100.00, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY));


-- 2. Customer 2 -> Server 16
INSERT INTO orders (id, tenant_id, customer_id, order_number, status, pickup_address, pickup_zip_code, deadline, final_agreed_price, customer_payment_amount, process_server_payout, tenant_commission, super_admin_fee, tenant_profit, created_at, completed_at, total_dropoffs)
VALUES ('fix-ord-002', '550e8400-e29b-41d4-a716-446655440001', 'c371b934-2f03-4d8e-8ec6-fdf3470c1aef', 'FIX-ORD-002', 'COMPLETED', '789 Fix Blvd, NY', '10002', DATE_SUB(NOW(), INTERVAL 4 DAY), 150.00, 180.00, 150.00, 20.00, 10.00, 10.00, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), 1);

INSERT INTO order_dropoffs (id, order_id, sequence_number, recipient_name, dropoff_address, dropoff_zip_code, assigned_process_server_id, status, final_agreed_price, attempt_count, delivered_at, created_at)
VALUES ('fix-drop-002', 'fix-ord-002', 1, 'Recipient 2', '101 Fix Ln, NY', '10003', '5d796a83-0a1d-486c-9ba8-762fae8d7af6', 'DELIVERED', 150.00, 1, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY));


-- 3. Customer 3 -> Server 21
INSERT INTO orders (id, tenant_id, customer_id, order_number, status, pickup_address, pickup_zip_code, deadline, final_agreed_price, customer_payment_amount, process_server_payout, tenant_commission, super_admin_fee, tenant_profit, created_at, completed_at, total_dropoffs)
VALUES ('fix-ord-003', '550e8400-e29b-41d4-a716-446655440001', 'c3f5911b-8a2f-4315-b5fd-6f454df39d7e', 'FIX-ORD-003', 'COMPLETED', '222 Fix Rd, NY', '10003', DATE_SUB(NOW(), INTERVAL 3 DAY), 200.00, 240.00, 200.00, 30.00, 10.00, 20.00, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY), 1);

INSERT INTO order_dropoffs (id, order_id, sequence_number, recipient_name, dropoff_address, dropoff_zip_code, assigned_process_server_id, status, final_agreed_price, attempt_count, delivered_at, created_at)
VALUES ('fix-drop-003', 'fix-ord-003', 1, 'Recipient 3', '333 Fix Ct, NY', '10004', '31f1bf3e-0643-40c4-85cf-ffdb48aa525c', 'DELIVERED', 200.00, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY));


-- 4. Customer 4 -> Server 1
INSERT INTO orders (id, tenant_id, customer_id, order_number, status, pickup_address, pickup_zip_code, deadline, final_agreed_price, customer_payment_amount, process_server_payout, tenant_commission, super_admin_fee, tenant_profit, created_at, completed_at, total_dropoffs)
VALUES ('fix-ord-004', '550e8400-e29b-41d4-a716-446655440001', 'd25ec2b5-242a-4b35-80a4-3696c5da745e', 'FIX-ORD-004', 'COMPLETED', '444 Fix Pl, NY', '10004', DATE_SUB(NOW(), INTERVAL 2 DAY), 120.00, 145.00, 120.00, 20.00, 5.00, 15.00, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 1);

INSERT INTO order_dropoffs (id, order_id, sequence_number, recipient_name, dropoff_address, dropoff_zip_code, assigned_process_server_id, status, final_agreed_price, attempt_count, delivered_at, created_at)
VALUES ('fix-drop-004', 'fix-ord-004', 1, 'Recipient 4', '555 Fix Dr, NY', '10005', 'e4eb5941-83df-425f-aeea-974a91d8f397', 'DELIVERED', 120.00, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY));


-- 5. Customer 5 -> Server 6
INSERT INTO orders (id, tenant_id, customer_id, order_number, status, pickup_address, pickup_zip_code, deadline, final_agreed_price, customer_payment_amount, process_server_payout, tenant_commission, super_admin_fee, tenant_profit, created_at, completed_at, total_dropoffs)
VALUES ('fix-ord-005', '550e8400-e29b-41d4-a716-446655440001', '3708ddee-f034-4591-83f1-5bf2d6a160fb', 'FIX-ORD-005', 'COMPLETED', '666 Fix Way, NY', '10005', DATE_SUB(NOW(), INTERVAL 1 DAY), 180.00, 210.00, 180.00, 25.00, 5.00, 20.00, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 1);

INSERT INTO order_dropoffs (id, order_id, sequence_number, recipient_name, dropoff_address, dropoff_zip_code, assigned_process_server_id, status, final_agreed_price, attempt_count, delivered_at, created_at)
VALUES ('fix-drop-005', 'fix-ord-005', 1, 'Recipient 5', '777 Fix Cir, NY', '10001', '700d2d05-c30a-4657-85df-1ee168d22a81', 'DELIVERED', 180.00, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY));
