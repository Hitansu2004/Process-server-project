#!/bin/bash

# Database Migration Instructions for ProcessServe Platform
# Run these commands to update the database schema and add tenant-2 data

echo "🗄️  ProcessServe Database Setup"
echo "================================"
echo ""

# Get database password
echo "Please provide your MySQL root password when prompted."
echo ""

# Run migration
echo "📋 Step 1: Adding tenant metadata fields..."
mysql -u root -p processserve_db < migrations/add_tenant_metadata.sql

if [ $? -eq 0 ]; then
    echo "✅ Tenant metadata fields added successfully"
else
    echo "❌ Failed to add tenant metadata fields"
    exit 1
fi

echo ""

# Run seed script
echo "📋 Step 2: Creating tenant-2 with sample data..."
mysql -u root -p processserve_db < seed_tenant2.sql

if [ $? -eq 0 ]; then
    echo "✅ Tenant-2 data created successfully"
else
    echo "❌ Failed to create tenant-2 data"
    exit 1  
fi

echo ""
echo "================================"
echo "🎉 Database setup complete!"
echo ""
echo "Verifying data..."
echo ""

# Verify tenant-2
mysql -u root -p -e "
SELECT id, name, business_email, business_category 
FROM tenants 
WHERE id IN ('tenant-1', 'tenant-2');
" processserve_db

echo ""
mysql -u root -p -e "
SELECT 'Tenant-2 Orders' as Info, COUNT(*) as Count 
FROM orders WHERE tenant_id='tenant-2';
" processserve_db

echo ""  
mysql -u root -p -e "
SELECT 'Tenant-2 Servers' as Info, COUNT(*) as Count 
FROM process_server_profiles WHERE tenant_id='tenant-2';
" processserve_db

echo ""
echo "✅ Database is ready for testing!"
echo "================================"
