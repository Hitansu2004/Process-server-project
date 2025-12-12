-- ProcessServe Database - Complete Schema with Tenant Metadata
-- Updated: 2024-12-12
-- This schema includes all tables needed for frontend and backend

-- Drop existing tables in correct order
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS delivery_attempts;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS contact_book_entries;
DROP TABLE IF EXISTS order_dropoffs;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS process_server_profiles;
DROP TABLE IF EXISTS customer_profiles;
DROP TABLE IF EXISTS tenant_user_roles;
DROP TABLE IF EXISTS global_users;
DROP TABLE IF EXISTS tenants;

-- =======================
-- CORE TABLES
-- =======================

-- Tenants (Multi-tenant organizations)
CREATE TABLE tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain_url VARCHAR(255),
    subdomain VARCHAR(100),
    api_key VARCHAR(255),
    subscription_tier VARCHAR(50),
    is_active TINYINT(1) DEFAULT 1,
    
    -- Business Metadata (Added for Super Admin)
    business_email VARCHAR(255),
    business_phone VARCHAR(20),
    business_address TEXT,
    business_category ENUM('LEGAL_SERVICES', 'PROCESS_SERVING', 'COURIER', 'DELIVERY', 'OTHER') DEFAULT 'PROCESS_SERVING',
    business_type ENUM('LLC', 'CORPORATION', 'SOLE_PROPRIETOR', 'PARTNERSHIP', 'NPO') DEFAULT 'LLC',
    contact_person_name VARCHAR(255),
    contact_person_email VARCHAR(255),
    contact_person_phone VARCHAR(20),
    tax_id VARCHAR(50),
    license_number VARCHAR(100),
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Configuration
    business_hours JSON,
    pricing_config JSON,
    notification_settings JSON,
    
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    
    INDEX idx_subdomain (subdomain),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Global Users (Cross-tenant identity)
CREATE TABLE global_users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    is_super_admin TINYINT(1) DEFAULT 0,
    email_verified TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    last_login TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_super_admin (is_super_admin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tenant User Roles (Multi-tenant assignments)
CREATE TABLE tenant_user_roles (
    id VARCHAR(36) PRIMARY KEY,
    global_user_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    role ENUM('TENANT_ADMIN', 'CUSTOMER', 'PROCESS_SERVER') NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (global_user_id) REFERENCES global_users(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_tenant_role (global_user_id, tenant_id, role),
    INDEX idx_tenant (tenant_id),
    INDEX idx_user (global_user_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer Profiles
CREATE TABLE customer_profiles (
    id VARCHAR(36) PRIMARY KEY,
    tenant_user_role_id VARCHAR(36) NOT NULL UNIQUE,
    default_zip_code VARCHAR(10),
    billing_info JSON,
    default_address TEXT,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (tenant_user_role_id) REFERENCES tenant_user_roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Process Server Profiles
CREATE TABLE process_server_profiles (
    id VARCHAR(36) PRIMARY KEY,
    tenant_user_role_id VARCHAR(36) NOT NULL UNIQUE,
    tenant_id VARCHAR(36),
    is_global TINYINT(1) DEFAULT 0,
    operating_zip_codes JSON NOT NULL,
    current_rating DECIMAL(3,2) DEFAULT 0.00,
    total_orders_assigned INT DEFAULT 0,
    successful_deliveries INT DEFAULT 0,
    failed_after_max_attempts INT DEFAULT 0,
    total_attempts INT DEFAULT 0,
    average_attempts_per_delivery DECIMAL(4,2) DEFAULT 0.00,
    is_red_zone TINYINT(1) DEFAULT 0,
    red_zone_trigger_count INT DEFAULT 0,
    verification_docs JSON,
    status ENUM('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'BANNED') DEFAULT 'PENDING_APPROVAL',
    last_delivery_at TIMESTAMP NULL,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (tenant_user_role_id) REFERENCES tenant_user_roles(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_rating (current_rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Book Entries
CREATE TABLE contact_book_entries (
    id VARCHAR(36) PRIMARY KEY,
    owner_user_id VARCHAR(36) NOT NULL,
    process_server_id VARCHAR(36) NOT NULL,
    entry_type VARCHAR(50),
    nickname VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_user_id) REFERENCES global_users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================
-- ORDER MANAGEMENT
-- =======================

-- Orders
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('DRAFT', 'OPEN', 'PARTIALLY_ASSIGNED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'DRAFT',
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    completed_at TIMESTAMP NULL,
    
    -- Payment Breakdown
    customer_payment_amount DECIMAL(10,2),
    process_server_payout DECIMAL(10,2),
    tenant_commission DECIMAL(10,2),
    super_admin_fee DECIMAL(10,2),
    tenant_profit DECIMAL(10,2),
    pricing_config JSON,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Dropoffs
CREATE TABLE order_dropoffs (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    sequence_number INT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_zip_code VARCHAR(10) NOT NULL,
    assigned_process_server_id VARCHAR(36),
    dropoff_type ENUM('GUIDED', 'AUTOMATED') DEFAULT 'AUTOMATED',
    status ENUM('PENDING', 'BIDDING', 'ASSIGNED', 'IN_PROGRESS', 'DELIVERED', 'FAILED') DEFAULT 'PENDING',
    final_agreed_price DECIMAL(10,2),
    attempt_count INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    delivered_at TIMESTAMP NULL,
    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bids
CREATE TABLE bids (
    id VARCHAR(36) PRIMARY KEY,
    bid_amount DECIMAL(10,2) NOT NULL,
    comment TEXT,
    created_at DATETIME(6),
    order_dropoff_id VARCHAR(255),
    process_server_id VARCHAR(36) NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN') NOT NULL,
    updated_at DATETIME(6),
    
    FOREIGN KEY (order_dropoff_id) REFERENCES order_dropoffs(id) ON DELETE CASCADE,
    INDEX idx_dropoff (order_dropoff_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delivery Attempts
CREATE TABLE delivery_attempts (
    id VARCHAR(36) PRIMARY KEY,
    attempt_number INT NOT NULL,
    attempt_time DATETIME(6),
    created_at DATETIME(6),
    gps_latitude DECIMAL(10,8),
    gps_longitude DECIMAL(11,8),
    is_valid_attempt BIT(1),
    order_dropoff_id VARCHAR(255) NOT NULL,
    outcome_notes TEXT,
    photo_proof_url VARCHAR(500),
    process_server_id VARCHAR(36) NOT NULL,
    was_successful BIT(1) DEFAULT 0,
    
    FOREIGN KEY (order_dropoff_id) REFERENCES order_dropoffs(id) ON DELETE CASCADE,
    INDEX idx_dropoff (order_dropoff_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =======================
-- RATINGS & NOTIFICATIONS
-- =======================

-- Ratings
CREATE TABLE ratings (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    process_server_id VARCHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id),
    UNIQUE KEY unique_order_rating (order_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('NEW_ORDER', 'BID_ACCEPTED', 'BID_REJECTED', 'ORDER_ASSIGNED', 'DELIVERY_REMINDER', 'PAYMENT_RECEIVED') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_order_id VARCHAR(36),
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES global_users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
