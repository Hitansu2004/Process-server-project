# ProcessServe Platform - Development Guide

## 🎨 New Light Theme
All portals now feature a clean, professional light theme with:
- White/light gray backgrounds
- Dark text for readability
- Blue accents for interactive elements
- Glass-morphism effects with subtle shadows
- Consistent styling across all portals

## 🏗️ Project Structure

### Frontend Portals
- **home-page** (Port 3000) - Tenant selection and role-based routing
- **delivery-portal** (Port 3001) - Process server interface
- **admin-panel** (Port 3002) - Tenant admin dashboard
- **super-admin** (Port 3003) - Platform-wide management
- **customer-portal** (Port 3004) - Customer order management

### Backend Services
- **auth-service** - Authentication and JWT management
- **tenant-service** - Multi-tenant management
- **user-service** - User profiles and roles
- **order-service** - Order and delivery management
- **notification-service** - Notifications and alerts

## 🚀 Quick Start

### Start All Frontend Portals
```bash
cd frontend
./start-all-portals.sh
```

### Start Individual Portals
```bash
# Home Page (Port 3000)
cd frontend/home-page && npm install && npm run dev

# Delivery Portal (Port 3001)
cd frontend/delivery-portal && npm run dev

# Admin Panel (Port 3002)
cd frontend/admin-panel && npm run dev

# Super Admin (Port 3003)
cd frontend/super-admin && npm run dev

# Customer Portal (Port 3004)
cd frontend/customer-portal && npm run dev
```

### Start Backend Services
```bash
cd backend
./start-backend.sh
```

### Database Setup
```bash
# Run migrations
mysql -u root -p processserve_db < database/migrations/add_tenant_metadata.sql

# Seed tenant-2 data
mysql -u root -p processserve_db < database/seed_tenant2.sql
```

## 🏠 Home Page Flow

1. User visits `http://localhost:3000`
2. Selects a tenant from dropdown (Demo Shop or Legal Services Pro)
3. Chooses role: Admin, Customer, or Process Server
4. Redirected to appropriate portal with tenant context stored in localStorage

### Hidden Routes
- `/superadmin` - Direct link to super admin portal (port 3003)

## 👥 Default Login Credentials

### Super Admin
- Email: `superadmin@example.com`
- Password: `password`
- Portal: http://localhost:3003

### Tenant 1 (Demo Shop)
- **Admin**: `admin@example.com` / `password`
- **Customer**: `customer1@example.com` / `password`
- **Process Server**: `server1@example.com` / `password`

### Tenant 2 (Legal Services Pro)
- **Admin**: `admin@legalservicespro.com` / `password`
- **Customer**: `alice@example.com` / `password`
- **Process Server**: `james.server@example.com` / `password`

## 📊 Database Schema Changes

### New Tenant Fields
- `business_email`, `business_phone`, `business_address`
- `business_category` (LEGAL_SERVICES, PROCESS_SERVING, COURIER, etc.)
- `business_type` (LLC, CORPORATION, SOLE_PROPRIETOR, etc.)
- `contact_person_name`, `contact_person_email`, `contact_person_phone`
- `tax_id`, `license_number`
- `logo_url`, `website_url`
- `timezone`, `currency`

### Tenant 2 Data
- 1 Admin user
- 2 Customer users with profiles
- 4 Process server users with profiles
- 5 Sample orders with dropoffs, bids, and ratings

## 🔧 Development Tips

### Tenant Context
All portals (except super admin) should:
1. Read `selectedTenantId` from localStorage
2. Filter all data by tenant ID
3. Include tenant ID in all API calls

### Port Configuration
- Home Page: 3000
- Delivery Portal: 3001
- Admin Panel: 3002
- Super Admin: 3003
- Customer Portal: 3004

### API Base URL
Default: `http://localhost:8080`
Configure via `NEXT_PUBLIC_API_URL` environment variable

## 🎯 Key Features

### Home Page
- Multi-tenant selection
- Role-based portal routing
- Tenant context persistence
- Hidden super admin access

### Super Admin Dashboard
- Platform-wide statistics
- Tenant management
- Aggregated metrics
- Revenue tracking
- Quick actions for tenant creation

### Light Theme
- Professional appearance
- Better readability
- Consistent across all portals
- Modern UI components

## 📝 Next Steps

1. Install dependencies for new home-page portal
2. Run database migrations
3. Test tenant selection flow
4. Verify light theme across all portals
5. Test cross-tenant data isolation

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill all Next.js processes
pkill -f 'next dev'

# Or kill specific port
lsof -ti:3000 | xargs kill
```

### Database Connection Issues
- Ensure MySQL is running
- Check credentials in backend service configurations
- Verify database exists: `processserve_db`

### Module Not Found Errors
```bash
# Install dependencies in the specific portal
cd frontend/[portal-name]
npm install
```

## 🤝 Contributing
When making changes:
1. Follow the light theme color scheme
2. Maintain tenant context in all features
3. Update this guide if adding new features
4. Test across all portals for consistency
