-- ProcessServe-SaaS Database Schema
-- MySQL 8.0+

-- Drop existing tables if they exist (for clean resets)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS delivery_attempts;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS contact_book_entries;
DROP TABLE IF EXISTS order_dropoffs;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS process_server_profiles;
DROP TABLE IF EXISTS delivery_person_profiles;
DROP TABLE IF EXISTS customer_profiles;
DROP TABLE IF EXISTS tenant_user_roles;
DROP TABLE IF EXISTS global_users;
DROP TABLE IF EXISTS tenants;

-- ======================
-- CORE TABLES
-- ======================

-- Tenants (Shops/Agencies)
CREATE TABLE tenants (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain_url VARCHAR(255) UNIQUE NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    api_key CHAR(64) UNIQUE NOT NULL,
    theme_config JSON,
    subscription_tier ENUM('FREE', 'BASIC', 'PREMIUM') DEFAULT 'FREE',
    is_active BOOLEAN DEFAULT TRUE,
    business_hours JSON DEFAULT NULL COMMENT 'Operating hours for each day of the week',
    pricing_config JSON DEFAULT NULL COMMENT 'Pricing configuration including minimum price and commission rate',
    notification_settings JSON DEFAULT NULL COMMENT 'Notification preferences for email, SMS, and reports',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_domain (domain_url),
    INDEX idx_subdomain (subdomain),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Global Users (Central Identity)
CREATE TABLE global_users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    is_super_admin BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_super_admin (is_super_admin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tenant User Roles (Multi-Tenant User Association)
CREATE TABLE tenant_user_roles (
    id CHAR(36) PRIMARY KEY,
    global_user_id CHAR(36) NOT NULL,
    tenant_id CHAR(36) NOT NULL,
    role ENUM('TENANT_ADMIN', 'CUSTOMER', 'PROCESS_SERVER') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (global_user_id) REFERENCES global_users(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_tenant_role (global_user_id, tenant_id, role),
    INDEX idx_tenant (tenant_id),
    INDEX idx_user (global_user_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customer Profiles
CREATE TABLE customer_profiles (
    id CHAR(36) PRIMARY KEY,
    tenant_user_role_id CHAR(36) UNIQUE NOT NULL,
    default_address TEXT,
    default_zip_code VARCHAR(10),
    billing_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_user_role_id) REFERENCES tenant_user_roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Process Server Profiles (formerly Delivery Person Profiles)
CREATE TABLE process_server_profiles (
    id CHAR(36) PRIMARY KEY,
    tenant_user_role_id CHAR(36) UNIQUE NOT NULL,
    tenant_id CHAR(36),
    is_global BOOLEAN DEFAULT FALSE,
    operating_zip_codes JSON NOT NULL COMMENT 'Array of zip codes',
    current_rating DECIMAL(3,2) DEFAULT 0.00,
    total_orders_assigned INT DEFAULT 0,
    successful_deliveries INT DEFAULT 0,
    failed_after_max_attempts INT DEFAULT 0,
    total_attempts INT DEFAULT 0,
    average_attempts_per_delivery DECIMAL(4,2) DEFAULT 0.00,
    is_red_zone BOOLEAN DEFAULT FALSE,
    red_zone_trigger_count INT DEFAULT 0,
    verification_docs JSON COMMENT 'Links to ID, licenses',
    status ENUM('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'BANNED') DEFAULT 'PENDING_APPROVAL',
    last_delivery_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_user_role_id) REFERENCES tenant_user_roles(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_red_zone (is_red_zone),
    INDEX idx_rating (current_rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Book Entries (Manual & Auto Added Process Servers)
CREATE TABLE contact_book_entries (
    id CHAR(36) PRIMARY KEY,
    owner_user_id CHAR(36) NOT NULL COMMENT 'The Customer or Admin who owns this list',
    process_server_id CHAR(36) NOT NULL,
    entry_type ENUM('MANUAL', 'AUTO_ADDED') DEFAULT 'MANUAL',
    nickname VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES global_users(id) ON DELETE CASCADE,
    FOREIGN KEY (process_server_id) REFERENCES process_server_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_contact (owner_user_id, process_server_id),
    INDEX idx_owner (owner_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- ORDER MANAGEMENT
-- ======================

-- Orders (Order Header - Container for Dropoffs)
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('DRAFT', 'OPEN', 'PARTIALLY_ASSIGNED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- Payment Breakdown (Aggregated or Specific)
    customer_payment_amount DECIMAL(10,2) DEFAULT NULL COMMENT 'Total amount customer pays',
    process_server_payout DECIMAL(10,2) DEFAULT NULL COMMENT 'Total amount paid to servers (sum of dropoffs)',
    tenant_commission DECIMAL(10,2) DEFAULT NULL COMMENT 'Total commission',
    super_admin_fee DECIMAL(10,2) DEFAULT NULL COMMENT 'Platform fee',
    tenant_profit DECIMAL(10,2) DEFAULT NULL,
    
    -- Admin Hidden Pricing Config
    pricing_config JSON DEFAULT NULL COMMENT 'For Admin created orders: {customerPrice, serverPrice, profit}',
    
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_customer (customer_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order Dropoffs (Sub-Orders / Delivery Destinations)
CREATE TABLE order_dropoffs (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    sequence_number INT NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_zip_code VARCHAR(10) NOT NULL,
    
    -- Assignment & Bidding
    assigned_process_server_id CHAR(36),
    dropoff_type ENUM('GUIDED', 'AUTOMATED') DEFAULT 'AUTOMATED',
    status ENUM('PENDING', 'BIDDING', 'ASSIGNED', 'IN_PROGRESS', 'DELIVERED', 'FAILED') DEFAULT 'PENDING',
    
    -- Pricing per dropoff
    final_agreed_price DECIMAL(10,2),
    
    attempt_count INT DEFAULT 0,
    max_attempts INT DEFAULT 5,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_process_server_id) REFERENCES process_server_profiles(id),
    INDEX idx_order (order_id),
    INDEX idx_status (status),
    INDEX idx_assigned_server (assigned_process_server_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bids (Process Server Bids on Dropoffs)
CREATE TABLE bids (
    id CHAR(36) PRIMARY KEY,
    order_dropoff_id CHAR(36) NOT NULL,
    process_server_id CHAR(36) NOT NULL,
    bid_amount DECIMAL(10,2) NOT NULL,
    comment TEXT,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_dropoff_id) REFERENCES order_dropoffs(id) ON DELETE CASCADE,
    FOREIGN KEY (process_server_id) REFERENCES process_server_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_server_dropoff_bid (process_server_id, order_dropoff_id),
    INDEX idx_dropoff (order_dropoff_id),
    INDEX idx_server (process_server_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delivery Attempts (Attempt Tracking)
CREATE TABLE delivery_attempts (
    id CHAR(36) PRIMARY KEY,
    order_dropoff_id CHAR(36) NOT NULL,
    process_server_id CHAR(36) NOT NULL,
    attempt_number INT NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    was_successful BOOLEAN DEFAULT FALSE,
    outcome_notes TEXT,
    gps_latitude DECIMAL(10,8),
    gps_longitude DECIMAL(11,8),
    photo_proof_url VARCHAR(500),
    is_valid_attempt BOOLEAN DEFAULT TRUE COMMENT 'GPS verified, within timeframe',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_dropoff_id) REFERENCES order_dropoffs(id) ON DELETE CASCADE,
    FOREIGN KEY (process_server_id) REFERENCES process_server_profiles(id),
    INDEX idx_dropoff (order_dropoff_id),
    INDEX idx_server (process_server_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================
-- RATINGS & NOTIFICATIONS
-- ======================

-- Ratings (Customer Ratings for Delivery)
CREATE TABLE ratings (
    id CHAR(36) PRIMARY KEY,
    order_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    process_server_id CHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id),
    FOREIGN KEY (process_server_id) REFERENCES process_server_profiles(id),
    UNIQUE KEY unique_order_rating (order_id),
    INDEX idx_server (process_server_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications (Notification Queue)
CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    tenant_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    type ENUM('NEW_ORDER', 'BID_ACCEPTED', 'BID_REJECTED', 'ORDER_ASSIGNED', 'DELIVERY_REMINDER', 'PAYMENT_RECEIVED') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_order_id CHAR(36),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES global_users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created (created_at),
    INDEX idx_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
