SELECT '--- PROFILES ---' as section;
SELECT 
    p.id, 
    p.tenant_user_role_id, 
    p.total_orders_assigned, 
    p.successful_deliveries, 
    p.current_rating
FROM process_server_profiles p;

SELECT '--- ACTUAL DROPOFFS ---' as section;
SELECT 
    assigned_process_server_id, 
    COUNT(*) as actual_total_orders,
    SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as actual_successful_deliveries
FROM order_dropoffs 
WHERE assigned_process_server_id IS NOT NULL 
GROUP BY assigned_process_server_id;

SELECT '--- ACTUAL RATINGS ---' as section;
SELECT 
    process_server_id, 
    AVG(rating) as actual_rating
FROM ratings 
GROUP BY process_server_id;
