-- ======================================================================
-- Contact Book Auto-Add Backfill Script
-- ======================================================================
-- Purpose: Add all process servers who completed orders to customer 
--          contact books as AUTO_ADDED entries
-- 
-- This script finds all completed orders and adds the assigned process 
-- servers to the customer's contact book if they don't already exist.
-- ======================================================================

-- Step 1: Preview what will be added (for verification)
SELECT 
    o.customer_id as customer_profile_id,
    od.assigned_process_server_id as process_server_id,
    o.order_number,
    o.status as order_status,
    od.status as dropoff_status,
    'Would be added' as action
FROM orders o
JOIN order_dropoffs od ON o.id = od.order_id
WHERE o.status = 'COMPLETED'
  AND od.status = 'DELIVERED'
  AND od.assigned_process_server_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM contact_book_entries cbe
      WHERE cbe.owner_user_id = o.customer_id
        AND cbe.process_server_id = od.assigned_process_server_id
  )
GROUP BY o.customer_id, od.assigned_process_server_id, o.order_number, o.status, od.status
ORDER BY o.customer_id, od.assigned_process_server_id;

-- Step 2: Count how many entries will be added
SELECT COUNT(DISTINCT CONCAT(o.customer_id, '-', od.assigned_process_server_id)) as entries_to_add
FROM orders o
JOIN order_dropoffs od ON o.id = od.order_id
WHERE o.status = 'COMPLETED'
  AND od.status = 'DELIVERED'
  AND od.assigned_process_server_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM contact_book_entries cbe
      WHERE cbe.owner_user_id = o.customer_id
        AND cbe.process_server_id = od.assigned_process_server_id
  );

-- Step 3: ACTUAL INSERT - Run this after reviewing the preview
-- Note: Using UUID() for MySQL 8.0+, adjust if using different database
INSERT INTO contact_book_entries (id, owner_user_id, process_server_id, entry_type, nickname, created_at)
SELECT 
    UUID() as id,
    o.customer_id as owner_user_id,
    od.assigned_process_server_id as process_server_id,
    'AUTO_ADDED' as entry_type,
    NULL as nickname,
    NOW() as created_at
FROM orders o
JOIN order_dropoffs od ON o.id = od.order_id
WHERE o.status = 'COMPLETED'
  AND od.status = 'DELIVERED'
  AND od.assigned_process_server_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM contact_book_entries cbe
      WHERE cbe.owner_user_id = o.customer_id
        AND cbe.process_server_id = od.assigned_process_server_id
  )
GROUP BY o.customer_id, od.assigned_process_server_id;

-- Step 4: Verify the results
SELECT 
    cbe.owner_user_id as customer_id,
    cbe.process_server_id,
    cbe.entry_type,
    cbe.created_at,
    COUNT(*) as contact_count
FROM contact_book_entries cbe
WHERE cbe.entry_type = 'AUTO_ADDED'
GROUP BY cbe.owner_user_id, cbe.process_server_id, cbe.entry_type, cbe.created_at
ORDER BY cbe.created_at DESC
LIMIT 50;

-- ======================================================================
-- Additional Verification Queries
-- ======================================================================

-- Check all contacts for a specific customer
-- Replace 'CUSTOMER_PROFILE_ID' with actual customer profile ID
/*
SELECT 
    cbe.id,
    cbe.owner_user_id,
    cbe.process_server_id,
    cbe.entry_type,
    cbe.nickname,
    ps.tenant_id,
    ps.is_global,
    tur.global_user_id,
    gu.first_name,
    gu.last_name
FROM contact_book_entries cbe
JOIN process_server_profiles ps ON cbe.process_server_id = ps.id
JOIN tenant_user_roles tur ON ps.tenant_user_role_id = tur.id
JOIN global_users gu ON tur.global_user_id = gu.id
WHERE cbe.owner_user_id = 'CUSTOMER_PROFILE_ID'
ORDER BY cbe.entry_type, cbe.created_at;
*/

-- Check contact distribution by entry type
SELECT 
    entry_type,
    COUNT(*) as count,
    COUNT(DISTINCT owner_user_id) as unique_customers,
    COUNT(DISTINCT process_server_id) as unique_servers
FROM contact_book_entries
GROUP BY entry_type;

-- Check for duplicate contacts (should be 0)
SELECT 
    owner_user_id,
    process_server_id,
    COUNT(*) as duplicate_count
FROM contact_book_entries
GROUP BY owner_user_id, process_server_id
HAVING COUNT(*) > 1;
