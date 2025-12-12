-- ========================================
-- Add Realistic Bids and Delivery Attempts
-- ========================================
-- This script populates missing bids for BIDDING orders
-- and adds realistic delivery attempts for COMPLETED orders

-- ========================================
-- PART 1: ADD BIDS FOR BIDDING ORDERS
-- ========================================

-- C3f59-ORD2 (Customer 3): 1 dropoff - Add 3 bids (moderate interest)
INSERT INTO bids (id, order_dropoff_id, process_server_id, bid_amount, status, comment, created_at) VALUES
('bid-c3f59-ord2-1', 'drop-c3-002', 'bb008306-dbca-4dfe-b99c-cf9bc7f6c4ea', 65.00, 'PENDING', 'Available for immediate pickup', NOW() - INTERVAL 2 HOUR),
('bid-c3f59-ord2-2', 'drop-c3-002', 'e7900e47-e286-4c3e-9132-a437af07d3be', 58.00, 'PENDING', 'Can deliver within 24 hours', NOW() - INTERVAL 1 HOUR),
('bid-c3f59-ord2-3', 'drop-c3-002', '1bc2a07c-229a-4e59-aa4c-a34d32ecdcfd', 70.00, 'PENDING', 'Experienced with this area', NOW() - INTERVAL 30 MINUTE);

-- C1aef-ORD3 (Customer 2): 1 dropoff - Add 2 bids (low interest)
INSERT INTO bids (id, order_dropoff_id, process_server_id, bid_amount, status, comment, created_at) VALUES
('bid-c1aef-ord3-1', 'c2-o3-d1', '68656001-bc8d-4c98-a58e-b7a044580561', 72.00, 'PENDING', NULL, NOW() - INTERVAL 3 HOUR),
('bid-c1aef-ord3-2', 'c2-o3-d1', 'fc07ca60-4bb9-4968-bd21-9b88a8ee524d', 68.50, 'PENDING', 'Quick turnaround guaranteed', NOW() - INTERVAL 45 MINUTE);

-- C1aef-ORD4 (Customer 2): 2 dropoffs - Add 4 bids per dropoff (high interest)
INSERT INTO bids (id, order_dropoff_id, process_server_id, bid_amount, status, comment, created_at) VALUES
-- Dropoff 1
('bid-c1aef-ord4-d1-1', 'c2-o4-d1', '31f1bf3e-0643-40c4-85cf-ffdb48aa525c', 55.00, 'PENDING', 'Best rate in the area', NOW() - INTERVAL 4 HOUR),
('bid-c1aef-ord4-d1-2', 'c2-o4-d1', 'd9c5d0ad-d836-4bb2-bdd8-962c5d9a8c28', 60.00, 'PENDING', NULL, NOW() - INTERVAL 3 HOUR),
('bid-c1aef-ord4-d1-3', 'c2-o4-d1', '2e122896-438c-4c38-81d3-04bd6ee2bfdd', 52.50, 'PENDING', 'Same-day service available', NOW() - INTERVAL 2 HOUR),
('bid-c1aef-ord4-d1-4', 'c2-o4-d1', 'd5089847-1ede-428f-bb0c-675f9af65ed9', 58.00, 'PENDING', 'Experienced with multiple dropoffs', NOW() - INTERVAL 1 HOUR),
-- Dropoff 2
('bid-c1aef-ord4-d2-1', 'c2-o4-d2', '074eb09e-7a92-43de-a46a-2fdbf6abe6b9', 57.00, 'PENDING', NULL, NOW() - INTERVAL 4 HOUR),
('bid-c1aef-ord4-d2-2', 'c2-o4-d2', 'e4eb5941-83df-425f-aeea-974a91d8f397', 62.00, 'PENDING', 'Local expert', NOW() - INTERVAL 3 HOUR),
('bid-c1aef-ord4-d2-3', 'c2-o4-d2', '46e1eaeb-6bf2-40e0-8f19-ade043e2ecff', 54.00, 'PENDING', 'Competitive pricing', NOW() - INTERVAL 90 MINUTE),
('bid-c1aef-ord4-d2-4', 'c2-o4-d2', '48bff7b9-6dbe-45a4-ba6d-f9c557b39c80', 59.50, 'PENDING', NULL, NOW() - INTERVAL 45 MINUTE);

-- C25ec-ORD2 (Customer 4): 1 dropoff - Add 1 bid (very low interest)
INSERT INTO bids (id, order_dropoff_id, process_server_id, bid_amount, status, comment, created_at) VALUES
('bid-c25ec-ord2-1', 'drop-c4-002', 'ab1cfbd7-f20c-4543-bf95-52b130737adb', 75.00, 'PENDING', 'Can start tomorrow', NOW() - INTERVAL 5 HOUR);

-- C2f03-ORD2 (Customer 2): 1 dropoff - Add 3 bids (moderate interest)
INSERT INTO bids (id, order_dropoff_id, process_server_id, bid_amount, status, comment, created_at) VALUES
('bid-c2f03-ord2-1', 'drop-c2-002', 'bb008306-dbca-4dfe-b99c-cf9bc7f6c4ea', 66.00, 'PENDING', NULL, NOW() - INTERVAL 2 HOUR),
('bid-c2f03-ord2-2', 'drop-c2-002', '1bc2a07c-229a-4e59-aa4c-a34d32ecdcfd', 63.50, 'PENDING', 'Fast and reliable', NOW() - INTERVAL 90 MINUTE),
('bid-c2f03-ord2-3', 'drop-c2-002', '68656001-bc8d-4c98-a58e-b7a044580561', 69.00, 'PENDING', NULL, NOW() - INTERVAL 30 MINUTE);

-- C3771-ORD3 (Customer 1): 3 dropoffs - Add 5 bids for first dropoff, 3 for others (varied interest)
INSERT INTO bids (id, order_dropoff_id, process_server_id, bid_amount, status, comment, created_at) VALUES
-- Dropoff 1 (high interest)
('bid-c3771-ord3-d1-1', 'c1-o3-d1', 'd9c5d0ad-d836-4bb2-bdd8-962c5d9a8c28', 50.00, 'PENDING', 'Lowest bid guaranteed', NOW() - INTERVAL 5 HOUR),
('bid-c3771-ord3-d1-2', 'c1-o3-d1', '2e122896-438c-4c38-81d3-04bd6ee2bfdd', 52.00, 'PENDING', NULL, NOW() - INTERVAL 4 HOUR),
('bid-c3771-ord3-d1-3', 'c1-o3-d1', 'd5089847-1ede-428f-bb0c-675f9af65ed9', 48.50, 'PENDING', 'Best value', NOW() - INTERVAL 3 HOUR),
('bid-c3771-ord3-d1-4', 'c1-o3-d1', '074eb09e-7a92-43de-a46a-2fdbf6abe6b9', 55.00, 'PENDING', NULL, NOW() - INTERVAL 2 HOUR),
('bid-c3771-ord3-d1-5', 'c1-o3-d1', 'e4eb5941-83df-425f-aeea-974a91d8f397', 51.00, 'PENDING', 'Reliable service', NOW() - INTERVAL 1 HOUR),
-- Dropoff 2 (moderate interest)
('bid-c3771-ord3-d2-1', 'c1-o3-d2', '46e1eaeb-6bf2-40e0-8f19-ade043e2ecff', 53.00, 'PENDING', NULL, NOW() - INTERVAL 3 HOUR),
('bid-c3771-ord3-d2-2', 'c1-o3-d2', '48bff7b9-6dbe-45a4-ba6d-f9c557b39c80', 56.00, 'PENDING', 'Available now', NOW() - INTERVAL 2 HOUR),
('bid-c3771-ord3-d2-3', 'c1-o3-d2', 'ab1cfbd7-f20c-4543-bf95-52b130737adb', 54.50, 'PENDING', NULL, NOW() - INTERVAL 90 MINUTE),
-- Dropoff 3 (moderate interest)
('bid-c3771-ord3-d3-1', 'c1-o3-d3', 'bb008306-dbca-4dfe-b99c-cf9bc7f6c4ea', 52.50, 'PENDING', 'Experienced professional', NOW() - INTERVAL 2 HOUR),
('bid-c3771-ord3-d3-2', 'c1-o3-d3', 'e7900e47-e286-4c3e-9132-a437af07d3be', 57.00, 'PENDING', NULL, NOW() - INTERVAL 1 HOUR),
('bid-c3771-ord3-d3-3', 'c1-o3-d3', '1bc2a07c-229a-4e59-aa4c-a34d32ecdcfd', 55.50, 'PENDING', NULL, NOW() - INTERVAL 30 MINUTE);

-- C3771-ORD4 (Customer 1): 2 dropoffs - Add 2 bids each (low interest)
INSERT INTO bids (id, order_dropoff_id, process_server_id, bid_amount, status, comment, created_at) VALUES
-- Dropoff 1
('bid-c3771-ord4-d1-1', 'c1-o4-d1', '68656001-bc8d-4c98-a58e-b7a044580561', 64.00, 'PENDING', NULL, NOW() - INTERVAL 6 HOUR),
('bid-c3771-ord4-d1-2', 'c1-o4-d1', 'fc07ca60-4bb9-4968-bd21-9b88a8ee524d', 61.50, 'PENDING', 'Quick delivery', NOW() - INTERVAL 2 HOUR),
-- Dropoff 2
('bid-c3771-ord4-d2-1', 'c1-o4-d2', '31f1bf3e-0643-40c4-85cf-ffdb48aa525c', 63.00, 'PENDING', NULL, NOW() - INTERVAL 5 HOUR),
('bid-c3771-ord4-d2-2', 'c1-o4-d2', 'd9c5d0ad-d836-4bb2-bdd8-962c5d9a8c28', 66.00, 'PENDING', NULL, NOW() - INTERVAL 3 HOUR);

-- C708d-ORD2 (Customer 5): 1 dropoff - Add 4 bids (high interest)
INSERT INTO bids (id, order_dropoff_id, process_server_id, bid_amount, status, comment, created_at) VALUES
('bid-c708d-ord2-1', 'drop-c5-002', '2e122896-438c-4c38-81d3-04bd6ee2bfdd', 60.00, 'PENDING', 'Same area specialist', NOW() - INTERVAL 4 HOUR),
('bid-c708d-ord2-2', 'drop-c5-002', 'd5089847-1ede-428f-bb0c-675f9af65ed9', 57.50, 'PENDING', 'Best bid', NOW() - INTERVAL 3 HOUR),
('bid-c708d-ord2-3', 'drop-c5-002', '074eb09e-7a92-43de-a46a-2fdbf6abe6b9', 62.00, 'PENDING', NULL, NOW() - INTERVAL 2 HOUR),
('bid-c708d-ord2-4', 'drop-c5-002', 'e4eb5941-83df-425f-aeea-974a91d8f397', 59.00, 'PENDING', 'Experienced server', NOW() - INTERVAL 1 HOUR);

-- ========================================
-- PART 2: ADD REALISTIC DELIVERY ATTEMPTS
-- ========================================
-- Adding delivery attempts with realistic scenarios:
-- - Some failed attempts (recipient not home, wrong address, etc.)
-- - Final successful attempt with proof

-- C1aef-ORD1 (Customer 2) - Dropoff c2-o1-d1 - 2 attempts (1 failed, 1 success)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-c1aef-ord1-1', 'c2-o1-d1', 'db9829d6-f9c2-4083-93f9-9d65a1bc27c9', 1, NOW() - INTERVAL 2 DAY, 0, 1, 'Recipient not available. Left notice on door.', 40.7589, -73.9851, NULL, NOW() - INTERVAL 2 DAY),
('attempt-c1aef-ord1-2', 'c2-o1-d1', 'db9829d6-f9c2-4083-93f9-9d65a1bc27c9', 2, NOW() - INTERVAL 1 DAY, 1, 1, 'Successfully served. Documents handed to recipient.', 40.7589, -73.9851, '/delivery-photos/c1aef-ord1-success.jpg', NOW() - INTERVAL 1 DAY);

-- C25ec-ORD1 (Customer 4) - Dropoff drop-c4-001 - 1 attempt (immediate success)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-c25ec-ord1-1', 'drop-c4-001', '48bff7b9-6dbe-45a4-ba6d-f9c557b39c80', 1, NOW() - INTERVAL 3 DAY, 1, 1, 'Delivered on first attempt. Signed receipt obtained.', 40.7831, -73.9712, '/delivery-photos/c25ec-ord1-success.jpg', NOW() - INTERVAL 3 DAY);

-- C3771-ORD1 (Customer 1) - 2 dropoffs, both with multiple attempts
-- Dropoff 1 (c1-o1-d1) - 3 attempts (2 failed, 1 success)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-c3771-ord1-d1-1', 'c1-o1-d1', '0c641388-2721-416f-9cbd-d4a0c5d08c80', 1, NOW() - INTERVAL 5 DAY, 0, 1, 'No answer at door. Neighbors stated recipient at work.', 40.7484, -73.9857, NULL, NOW() - INTERVAL 5 DAY),
('attempt-c3771-ord1-d1-2', 'c1-o1-d1', '0c641388-2721-416f-9cbd-d4a0c5d08c80', 2, NOW() - INTERVAL 4 DAY, 0, 1, 'Recipient refused to answer door. Will attempt again.', 40.7484, -73.9857, '/delivery-photos/c3771-ord1-d1-attempt2.jpg', NOW() - INTERVAL 4 DAY),
('attempt-c3771-ord1-d1-3', 'c1-o1-d1', '0c641388-2721-416f-9cbd-d4a0c5d08c80', 3, NOW() - INTERVAL 3 DAY, 1, 1, 'Successfully served at workplace. Photo ID verified.', 40.7484, -73.9857, '/delivery-photos/c3771-ord1-d1-success.jpg', NOW() - INTERVAL 3 DAY);

-- Dropoff 2 (c1-o1-d2) - 2 attempts (1 failed, 1 success)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-c3771-ord1-d2-1', 'c1-o1-d2', '0c641388-2721-416f-9cbd-d4a0c5d08c80', 1, NOW() - INTERVAL 4 DAY, 0, 1, 'Address partially incorrect. Verified with building manager.', 40.7614, -73.9776, NULL, NOW() - INTERVAL 4 DAY),
('attempt-c3771-ord1-d2-2', 'c1-o1-d2', '0c641388-2721-416f-9cbd-d4a0c5d08c80', 2, NOW() - INTERVAL 3 DAY, 1, 1, 'Documents successfully delivered to correct apartment.', 40.7614, -73.9776, '/delivery-photos/c3771-ord1-d2-success.jpg', NOW() - INTERVAL 3 DAY);

-- C3771-ORD2 already has 3 attempts, keeping them as is

-- C3f59-ORD1 (Customer 3) - Dropoff drop-c3-001 - 2 attempts (1 failed, 1 success)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-c3f59-ord1-1', 'drop-c3-001', 'bb008306-dbca-4dfe-b99c-cf9bc7f6c4ea', 1, NOW() - INTERVAL 6 DAY, 0, 1, 'Business closed. Will return during business hours.', 40.7305, -73.9944, NULL, NOW() - INTERVAL 6 DAY),
('attempt-c3f59-ord1-2', 'drop-c3-001', 'bb008306-dbca-4dfe-b99c-cf9bc7f6c4ea', 2, NOW() - INTERVAL 5 DAY, 1, 1, 'Served to authorized representative. Proof of delivery obtained.', 40.7305, -73.9944, '/delivery-photos/c3f59-ord1-success.jpg', NOW() - INTERVAL 5 DAY);

-- C708d-ORD1 (Customer 5) - Dropoff drop-c5-001 - 1 attempt (quick success)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-c708d-ord1-1', 'drop-c5-001', '2a1a85f4-103e-47a8-b259-3abf738337c7', 1, NOW() - INTERVAL 4 DAY, 1, 1, 'Perfect delivery. Recipient was expecting service.', 40.7411, -73.9897, '/delivery-photos/c708d-ord1-success.jpg', NOW() - INTERVAL 4 DAY);

-- FIX-ORD-001 - Dropoff fix-drop-001 - 2 attempts (1 failed, 1 success)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-fix-ord-001-1', 'fix-drop-001', 'db9829d6-f9c2-4083-93f9-9d65a1bc27c9', 1, NOW() - INTERVAL 3 DAY, 0, 1, 'Gate code not working. Contacted customer for access.', 40.7280, -73.9820, NULL, NOW() - INTERVAL 3 DAY),
('attempt-fix-ord-001-2', 'fix-drop-001', 'db9829d6-f9c2-4083-93f9-9d65a1bc27c9', 2, NOW() - INTERVAL 2 DAY, 1, 1, 'Successfully served after gaining building access.', 40.7280, -73.9820, '/delivery-photos/fix-ord-001-success.jpg', NOW() - INTERVAL 2 DAY);

-- FIX-ORD-002 - Dropoff fix-drop-002 - 3 attempts (2 failed, 1 success)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-fix-ord-002-1', 'fix-drop-002', '5d796a83-0a1d-486c-9ba8-762fae8d7af6', 1, NOW() - INTERVAL 5 DAY, 0, 1, 'Recipient avoiding service. Left notice.', 40.7350, -73.9900, NULL, NOW() - INTERVAL 5 DAY),
('attempt-fix-ord-002-2', 'fix-drop-002', '5d796a83-0a1d-486c-9ba8-762fae8d7af6', 2, NOW() - INTERVAL 4 DAY, 0, 1, 'Attempted substitute service with cohabitant - refused.', 40.7350, -73.9900, '/delivery-photos/fix-ord-002-attempt2.jpg', NOW() - INTERVAL 4 DAY),
('attempt-fix-ord-002-3', 'fix-drop-002', '5d796a83-0a1d-486c-9ba8-762fae8d7af6', 3, NOW() - INTERVAL 3 DAY, 1, 1, 'Successfully served at place of business.', 40.7350, -73.9900, '/delivery-photos/fix-ord-002-success.jpg', NOW() - INTERVAL 3 DAY);

-- FIX-ORD-003 - Dropoff fix-drop-003 - 1 attempt (easy success)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-fix-ord-003-1', 'fix-drop-003', '31f1bf3e-0643-40c4-85cf-ffdb48aa525c', 1, NOW() - INTERVAL 2 DAY, 1, 1, 'Clean delivery. Recipient cooperative and signed affidavit.', 40.7220, -73.9820, '/delivery-photos/fix-ord-003-success.jpg', NOW() - INTERVAL 2 DAY);

-- FIX-ORD-004 - Dropoff fix-drop-004 - 2 attempts (1 failed, 1 success)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-fix-ord-004-1', 'fix-drop-004', 'e4eb5941-83df-425f-aeea-974a91d8f397', 1, NOW() - INTERVAL 7 DAY, 0, 1, 'Recipient out of town per neighbor. Will retry next week.', 40.7550, -73.9750, NULL, NOW() - INTERVAL 7 DAY),
('attempt-fix-ord-004-2', 'fix-drop-004', 'e4eb5941-83df-425f-aeea-974a91d8f397', 2, NOW() - INTERVAL 6 DAY, 1, 1, 'Served upon return. Documents received and acknowledged.', 40.7550, -73.9750, '/delivery-photos/fix-ord-004-success.jpg', NOW() - INTERVAL 6 DAY);

-- FIX-ORD-005 - Dropoff fix-drop-005 - 3 attempts (2 failed, 1 success - difficult case)
INSERT INTO delivery_attempts (id, order_dropoff_id, process_server_id, attempt_number, attempt_time, was_successful, is_valid_attempt, outcome_notes, gps_latitude, gps_longitude, photo_proof_url, created_at) VALUES
('attempt-fix-ord-005-1', 'fix-drop-005', '700d2d05-c30a-4657-85df-1ee168d22a81', 1, NOW() - INTERVAL 8 DAY, 0, 1, 'No one home. Mail uncollected. Possible vacant property.', 40.7600, -73.9700, NULL, NOW() - INTERVAL 8 DAY),
('attempt-fix-ord-005-2', 'fix-drop-005', '700d2d05-c30a-4657-85df-1ee168d22a81', 2, NOW() - INTERVAL 7 DAY, 0, 1, 'Spoke with property manager. Recipient moved. Obtained forwarding address.', 40.7600, -73.9700, NULL, NOW() - INTERVAL 7 DAY),
('attempt-fix-ord-005-3', 'fix-drop-005', '700d2d05-c30a-4657-85df-1ee168d22a81', 3, NOW() - INTERVAL 6 DAY, 1, 1, 'Successfully served at new address. Photo proof of service.', 40.7650, -73.9650, '/delivery-photos/fix-ord-005-success.jpg', NOW() - INTERVAL 6 DAY);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify the data was inserted correctly:

-- Check bid counts for BIDDING orders
-- SELECT o.order_number, o.status, COUNT(b.id) as bid_count, MIN(b.bid_amount) as lowest_bid
-- FROM orders o
-- LEFT JOIN order_dropoffs od ON o.id = od.order_id
-- LEFT JOIN bids b ON od.id = b.order_dropoff_id
-- WHERE o.status = 'BIDDING'
-- GROUP BY o.id, o.order_number, o.status;

-- Check delivery attempts for COMPLETED orders
-- SELECT o.order_number, od.id as dropoff_id, COUNT(da.id) as attempt_count,
--        SUM(CASE WHEN da.was_successful = 1 THEN 1 ELSE 0 END) as successful_attempts
-- FROM orders o
-- JOIN order_dropoffs od ON o.id = od.order_id
-- LEFT JOIN delivery_attempts da ON od.id = da.order_dropoff_id
-- WHERE o.status = 'COMPLETED'
-- GROUP BY o.id, o.order_number, od.id
-- ORDER BY o.order_number;
