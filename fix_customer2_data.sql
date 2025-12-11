USE processserve_db;

-- Add missing AUTO_ADDED contact for Customer 2 (c371b934...) and Process Server (db9829d6...)
-- ID generated randomly
INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname, created_at)
VALUES 
('fix-contact-c2-ps1', (SELECT id FROM global_users WHERE email = 'customer2@example.com'), 'db9829d6-f9c2-4083-93f9-9d65a1bc27c9', 'AUTO_ADDED', 'Auto Server (Fixed)', NOW());
