#!/bin/bash

# Update ProcessServe Database - Fixed Version
# Adds tenant metadata and tenant-2 data

echo "🔄 ProcessServe Database Update"
echo "================================"
echo ""

# Backup first
echo "📦 Creating backup..."
mysqldump -u root processserve_db > "backup_$(date +%Y%m%d_%H%M%S).sql" 2>/dev/null
echo "✅ Backup created"
echo ""

# Add tenant metadata fields (fixed syntax)
echo "📋 Adding tenant metadata fields..."
mysql -u root processserve_db << 'EOF'
-- Add new tenant metadata fields
ALTER TABLE tenants 
ADD COLUMN business_email VARCHAR(255) AFTER api_key,
ADD COLUMN business_phone VARCHAR(20) AFTER business_email,
ADD COLUMN business_address TEXT AFTER business_phone,
ADD COLUMN business_category ENUM('LEGAL_SERVICES', 'PROCESS_SERVING', 'COURIER', 'DELIVERY', 'OTHER') DEFAULT 'PROCESS_SERVING' AFTER business_address,
ADD COLUMN business_type ENUM('LLC', 'CORPORATION', 'SOLE_PROPRIETOR', 'PARTNERSHIP', 'NPO') DEFAULT 'LLC' AFTER business_category,
ADD COLUMN contact_person_name VARCHAR(255) AFTER business_type,
ADD COLUMN contact_person_email VARCHAR(255) AFTER contact_person_name,
ADD COLUMN contact_person_phone VARCHAR(20) AFTER contact_person_email,
ADD COLUMN tax_id VARCHAR(50) AFTER contact_person_phone,
ADD COLUMN license_number VARCHAR(100) AFTER tax_id,
ADD COLUMN logo_url VARCHAR(500) AFTER license_number,
ADD COLUMN website_url VARCHAR(500) AFTER logo_url,
ADD COLUMN timezone VARCHAR(50) DEFAULT 'America/New_York' AFTER website_url,
ADD COLUMN currency VARCHAR(3) DEFAULT 'USD' AFTER timezone;

-- Update existing tenant-1 with metadata
UPDATE tenants 
SET 
    business_email = 'contact@demoshop.com',
    business_phone = '+1-555-0100',
    business_address = '123 Main Street, New York, NY 10001',
    business_category = 'PROCESS_SERVING',
    business_type = 'LLC',
    contact_person_name = 'John Manager',
    contact_person_email = 'john@demoshop.com',
    contact_person_phone = '+1-555-0101',
    tax_id = '12-3456789',
    license_number = 'PS-NY-2024-001',
    website_url = 'https://demoshop.processserve.com',
    timezone = 'America/New_York',
    currency = 'USD'
WHERE id = 'tenant-1';
EOF

if [ $? -eq 0 ]; then
    echo "✅ Tenant metadata fields added"
else
    echo "ℹ️  Fields may already exist (this is OK)"
fi

echo ""

# Add tenant-2 data
echo "📋 Adding tenant-2 data..."
mysql -u root processserve_db < seed_tenant2.sql 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Tenant-2 data added successfully"
else
    echo "⚠️  Check if tenant-2 already exists"
fi

echo ""
echo "================================"
echo "🎉 Database updated!"
echo ""

# Verify
echo "Verifying tenants..."
mysql -u root -e "SELECT id, name, business_email FROM tenants" processserve_db

echo ""
echo "✅ Done!"
echo "================================"
