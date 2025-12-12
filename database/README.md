# ProcessServe Database Files

## 📁 Current Files (Clean & Organized)

### Essential Files
- **schema.sql** - Complete database schema with tenant metadata fields
- **seed.sql** - Initial seed structure (to be populated by update script)
- **seed_tenant2.sql** - Tenant-2 data (2 customers, 4 servers, 5 orders)
- **init.sql** - Database initialization

### Scripts
- **update-database.sh** - Main script to update database with tenant metadata + tenant-2
- **setup-database.sh** - Alternative manual setup (prompts for password)

### Backup & Export Files
- **complete_backup_20251212.sql** - Full database backup
- **current_data_dump.sql** - Current data export
- **current_schema.sql** - Raw schema export from MySQL

### Archived Files
- **old_sql_files/** - Previous intermediate SQL files (kept for reference)
- **migrations/** - Schema migration scripts

## 🚀 Quick Start

### Update Your Database
```bash
cd database
./update-database.sh
```

This will:
1. Backup current database
2. Add tenant metadata fields to tenants table
3. Update tenant-1 with business information
4. Add tenant-2 with complete data (users, orders, etc.)

### Manual Setup (if needed)
```bash
# Drop and recreate from scratch
mysql -u root -e "DROP DATABASE IF EXISTS processserve_db; CREATE DATABASE processserve_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Load schema
mysql -u root processserve_db < schema.sql

# Load existing data + tenant-2
mysql -u root processserve_db < current_data_dump.sql
mysql -u root processserve_db < seed_tenant2.sql
```

## 📊 What's in the Database?

### Tenant 1: Demo Shop
- **Type**: Process Serving LLC
- **Users**: 5 customers, 25 process servers, 1 admin
- **Status**: Active, Premium tier
- **Business Info**: contact@demoshop.com, +1-555-0100

### Tenant 2: Legal Services Pro
- **Type**: Legal Services Corporation  
- **Users**: 2 customers, 4 process servers, 1 admin
- **Orders**: 5 sample orders with varied statuses
- **Status**: Active, Basic tier
- **Business Info**: info@legalservicespro.com, +1-555-0200

## 🗄️ Tables

1. **tenants** - Multi-tenant organizations with business metadata
2. **global_users** - Cross-tenant user identities
3. **tenant_user_roles** - User-tenant-role assignments
4. **customer_profiles** - Customer-specific data
5. **process_server_profiles** - Server profiles with ratings
6. **orders** - Order headers
7. **order_dropoffs** - Individual delivery destinations
8. **bids** - Process server bids on dropoffs
9. **delivery_attempts** - Attempt tracking
10. **contact_book_entries** - Customer's preferred servers
11. **ratings** - Customer ratings for servers
12. **notifications** - System notifications

## 🔧 Maintenance

### Create Fresh Backup
```bash
mysqldump -u root processserve_db > backup_$(date +%Y%m%d).sql
```

### Verify Data
```bash
mysql -u root -e "SELECT id, name, business_email FROM tenants" processserve_db
mysql -u root -e "SELECT tenant_id, COUNT(*) FROM orders GROUP BY tenant_id" processserve_db
```

### Reset to Clean State
```bash
mysql -u root processserve_db < schema.sql
mysql -u root processserve_db < current_data_dump.sql
```

## 📝 Notes

- All passwords in seed data are hashed "password"
- Tenant-1 has extensive test data from previous development
- Tenant-2 has minimal but complete data for testing
- Old SQL files moved to `old_sql_files/` for reference
- Schema matches actual MySQL structure (exported from database)

## 🐛 Troubleshooting

### "Table doesn't exist" errors
Run `update-database.sh` or load schema.sql first

### Duplicate entry errors
Database already has the data, no action needed

### Foreign key constraint errors
Make sure to run schema.sql before loading data
