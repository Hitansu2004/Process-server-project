USE processserve_db;

-- Customer 2 Orders (OPEN/BIDDING - no final_agreed_price yet)
INSERT INTO orders (id, tenant_id, customer_id, order_number, status, pickup_address, pickup_zip_code, deadline, has_multiple_dropoffs, total_dropoffs, created_at)
VALUES 
('ord-c2-001', 'tenant-1', 'c371b934-2f03-4d8e-8ec6-fdf3470c1aef', 'C2f03-ORD1', 'OPEN', '123 Broadway, New York, NY', '10001', DATE_ADD(NOW(), INTERVAL 2 DAY), FALSE, 1, NOW()),
('ord-c2-002', 'tenant-1', 'c371b934-2f03-4d8e-8ec6-fdf3470c1aef', 'C2f03-ORD2', 'BIDDING', '456 5th Ave, New York, NY', '10002', DATE_ADD(NOW(), INTERVAL 3 DAY), FALSE, 1, NOW());

INSERT INTO order_dropoffs (id, order_id, sequence_number, recipient_name, dropoff_address, dropoff_zip_code, dropoff_type, status, attempt_count, max_attempts, created_at)
VALUES
('drop-c2-001', 'ord-c2-001', 1, 'Recipient 1', '789 7th Ave, New York, NY', '10003', 'AUTOMATED', 'OPEN', 0, 5, NOW()),
('drop-c2-002', 'ord-c2-002', 1, 'Recipient 2', '101 8th Ave, New York, NY', '10004', 'AUTOMATED', 'BIDDING', 0, 5, NOW());

-- Customer 4 Orders (OPEN/BIDDING - no final_agreed_price yet)
INSERT INTO orders (id, tenant_id, customer_id, order_number, status, pickup_address, pickup_zip_code, deadline, has_multiple_dropoffs, total_dropoffs, created_at)
VALUES 
('ord-c4-001', 'tenant-1', 'd25ec2b5-242a-4b35-80a4-3696c5da745e', 'C25ec-ORD1', 'OPEN', '222 Park Ave, New York, NY', '10010', DATE_ADD(NOW(), INTERVAL 4 DAY), FALSE, 1, NOW()),
('ord-c4-002', 'tenant-1', 'd25ec2b5-242a-4b35-80a4-3696c5da745e', 'C25ec-ORD2', 'BIDDING', '333 Madison Ave, New York, NY', '10011', DATE_ADD(NOW(), INTERVAL 5 DAY), FALSE, 1, NOW());

INSERT INTO order_dropoffs (id, order_id, sequence_number, recipient_name, dropoff_address, dropoff_zip_code, dropoff_type, status, attempt_count, max_attempts, created_at)
VALUES
('drop-c4-001', 'ord-c4-001', 1, 'Recipient 3', '444 Lexington Ave, New York, NY', '10012', 'AUTOMATED', 'OPEN', 0, 5, NOW()),
('drop-c4-002', 'ord-c4-002', 1, 'Recipient 4', '555 3rd Ave, New York, NY', '10013', 'AUTOMATED', 'BIDDING', 0, 5, NOW());

-- Customer 5 Orders (OPEN/BIDDING - no final_agreed_price yet)
INSERT INTO orders (id, tenant_id, customer_id, order_number, status, pickup_address, pickup_zip_code, deadline, has_multiple_dropoffs, total_dropoffs, created_at)
VALUES 
('ord-c5-001', 'tenant-1', '3708ddee-f034-4591-83f1-5bf2d6a160fb', 'C708d-ORD1', 'OPEN', '666 6th Ave, New York, NY', '10020', DATE_ADD(NOW(), INTERVAL 6 DAY), FALSE, 1, NOW()),
('ord-c5-002', 'tenant-1', '3708ddee-f034-4591-83f1-5bf2d6a160fb', 'C708d-ORD2', 'BIDDING', '777 7th Ave, New York, NY', '10021', DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE, 1, NOW());

INSERT INTO order_dropoffs (id, order_id, sequence_number, recipient_name, dropoff_address, dropoff_zip_code, dropoff_type, status, attempt_count, max_attempts, created_at)
VALUES
('drop-c5-001', 'ord-c5-001', 1, 'Recipient 5', '888 8th Ave, New York, NY', '10022', 'AUTOMATED', 'OPEN', 0, 5, NOW()),
('drop-c5-002', 'ord-c5-002', 1, 'Recipient 6', '999 9th Ave, New York, NY', '10023', 'AUTOMATED', 'BIDDING', 0, 5, NOW());
