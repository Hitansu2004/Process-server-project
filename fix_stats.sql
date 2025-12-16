-- Update stats based on actual order dropoffs
UPDATE process_server_profiles p
JOIN (
    SELECT 
        assigned_process_server_id,
        COUNT(*) as actual_total,
        SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as actual_success
    FROM order_dropoffs
    WHERE assigned_process_server_id IS NOT NULL
    GROUP BY assigned_process_server_id
) stats ON p.id = stats.assigned_process_server_id
SET 
    p.total_orders_assigned = stats.actual_total,
    p.successful_deliveries = stats.actual_success;

-- Update ratings based on actual ratings table
UPDATE process_server_profiles p
JOIN (
    SELECT 
        process_server_id,
        AVG(rating) as avg_rating
    FROM ratings
    GROUP BY process_server_id
) r ON p.id = r.process_server_id
SET p.current_rating = r.avg_rating;

-- Zero out stats for servers with no orders (optional cleanup)
UPDATE process_server_profiles p
LEFT JOIN order_dropoffs od ON p.id = od.assigned_process_server_id
SET 
    p.total_orders_assigned = 0,
    p.successful_deliveries = 0
WHERE od.id IS NULL;
