/**
 * PM2 Ecosystem Configuration for ProcessServe Microservices
 * 
 * This configuration allows running all 14 microservices (8 backend + 6 frontend)
 * with a single command: pm2 start ecosystem.config.js
 * 
 * Environment Variables:
 * - Uses .env.local for local development
 * - Uses .env.production for VPS deployment
 * 
 * Commands:
 * - Start all: pm2 start ecosystem.config.js
 * - Stop all: pm2 stop all
 * - Restart all: pm2 restart all
 * - View status: pm2 list
 * - View logs: pm2 logs
 * - Monitor: pm2 monit
 */

const path = require('path');
const fs = require('fs');

// Determine environment (local or production)
const ENVIRONMENT = process.env.ENVIRONMENT || 'local';
const ENV_FILE = ENVIRONMENT === 'production' ? '.env.production' : '.env.local';

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, ENV_FILE) });

module.exports = {
  apps: [
    // ============================================
    // BACKEND SERVICES (Spring Boot with Maven)
    // ============================================

    {
      name: 'discovery-server',
      script: 'java',
      args: [
        '-jar',
        './backend/discovery-server/target/discovery-server-1.0.0.jar'
      ],
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        DISCOVERY_SERVER_PORT: process.env.DISCOVERY_SERVER_PORT || 8761,
        DISCOVERY_SERVER_HOST: process.env.DISCOVERY_SERVER_HOST || 'localhost',
        EUREKA_URL: process.env.EUREKA_URL || 'http://localhost:8761/eureka/',
        SPRING_PROFILES_ACTIVE: process.env.SPRING_PROFILES_ACTIVE || 'local'
      },
      error_file: './logs/discovery-server-error.log',
      out_file: './logs/discovery-server-out.log',
      log_file: './logs/discovery-server-combined.log',
      time: true,
      merge_logs: true
    },

    // API Gateway
    {
      name: 'api-gateway',
      script: 'java',
      args: [
        '-jar',
        './backend/api-gateway/target/api-gateway-1.0.0.jar'
      ],
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        SERVER_PORT: process.env.API_GATEWAY_PORT || 8080,
        EUREKA_URL: process.env.EUREKA_URL || 'http://localhost:8761/eureka/',
        JWT_SECRET: process.env.JWT_SECRET || 'processserve-jwt-secret-key-2024-secure',
        CORS_ORIGIN_1: process.env.CORS_ORIGIN_1 || 'http://localhost:3000',
        CORS_ORIGIN_2: process.env.CORS_ORIGIN_2 || 'http://localhost:3001',
        CORS_ORIGIN_3: process.env.CORS_ORIGIN_3 || 'http://localhost:3002',
        CORS_ORIGIN_4: process.env.CORS_ORIGIN_4 || 'http://localhost:3003',
        CORS_ORIGIN_5: process.env.CORS_ORIGIN_5 || 'http://localhost:3004',
        CORS_ORIGIN_6: process.env.CORS_ORIGIN_6 || 'http://localhost:3005',
        CORS_ORIGIN_VPS: process.env.CORS_ORIGIN_VPS || 'http://app.ezcollab.com',
        GATEWAY_LOG_LEVEL: process.env.GATEWAY_LOG_LEVEL || 'DEBUG',
        SPRING_PROFILES_ACTIVE: process.env.SPRING_PROFILES_ACTIVE || 'local'
      },
      error_file: './logs/api-gateway-error.log',
      out_file: './logs/api-gateway-out.log',
      time: true
    },

    // Auth Service
    {
      name: 'auth-service',
      script: 'java',
      args: [
        '-jar',
        './backend/auth-service/target/auth-service-1.0.0.jar'
      ],
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        SERVER_PORT: process.env.AUTH_SERVICE_PORT || 8081,
        EUREKA_URL: process.env.EUREKA_URL || 'http://localhost:8761/eureka/',
        DB_URL: process.env.DB_URL,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRATION: process.env.JWT_EXPIRATION,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        MAIL_HOST: process.env.MAIL_HOST,
        MAIL_PORT: process.env.MAIL_PORT,
        MAIL_USERNAME: process.env.MAIL_USERNAME,
        MAIL_PASSWORD: process.env.MAIL_PASSWORD,
        DELIVERY_PORTAL_URL: process.env.DELIVERY_PORTAL_URL || 'http://localhost:3001',
        APP_LOG_LEVEL: process.env.APP_LOG_LEVEL || 'DEBUG',
        SECURITY_LOG_LEVEL: process.env.SECURITY_LOG_LEVEL || 'DEBUG',
        JPA_SHOW_SQL: process.env.JPA_SHOW_SQL || 'true',
        SPRING_JPA_HIBERNATE_DDL_AUTO: 'update',
        SPRING_PROFILES_ACTIVE: process.env.SPRING_PROFILES_ACTIVE || 'local'
      },
      error_file: './logs/auth-service-error.log',
      out_file: './logs/auth-service-out.log',
      time: true
    },

    // User Service
    {
      name: 'user-service',
      script: 'java',
      args: [
        '-jar',
        './backend/user-service/target/user-service-1.0.0.jar'
      ],
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        SERVER_PORT: process.env.USER_SERVICE_PORT || 8082,
        EUREKA_URL: process.env.EUREKA_URL || 'http://localhost:8761/eureka/',
        DB_URL: process.env.DB_URL,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        APP_LOG_LEVEL: process.env.APP_LOG_LEVEL || 'DEBUG',
        JPA_SHOW_SQL: process.env.JPA_SHOW_SQL || 'true',
        SPRING_PROFILES_ACTIVE: process.env.SPRING_PROFILES_ACTIVE || 'local'
      },
      error_file: './logs/user-service-error.log',
      out_file: './logs/user-service-out.log',
      time: true
    },

    // ============================================
    // FRONTEND SERVICES (Next.js) - Add later
    // ============================================

    // Tenant Service
    {
      name: 'tenant-service',
      script: 'java',
      args: [
        '-jar',
        './backend/tenant-service/target/tenant-service-1.0.0.jar'
      ],
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        SERVER_PORT: process.env.TENANT_SERVICE_PORT || 8083,
        EUREKA_URL: process.env.EUREKA_URL || 'http://localhost:8761/eureka/',
        DB_URL: process.env.DB_URL,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        APP_LOG_LEVEL: process.env.APP_LOG_LEVEL || 'DEBUG',
        JPA_SHOW_SQL: process.env.JPA_SHOW_SQL || 'true',
        SPRING_JPA_HIBERNATE_DDL_AUTO: 'update',
        SPRING_PROFILES_ACTIVE: process.env.SPRING_PROFILES_ACTIVE || 'local'
      },
      error_file: './logs/tenant-service-error.log',
      out_file: './logs/tenant-service-out.log',
      time: true
    },

    // Order Service
    {
      name: 'order-service',
      script: 'java',
      args: [
        '-jar',
        './backend/order-service/target/order-service-1.0.0.jar'
      ],
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        SERVER_PORT: process.env.ORDER_SERVICE_PORT || 8084,
        EUREKA_URL: process.env.EUREKA_URL || 'http://localhost:8761/eureka/',
        DB_URL: process.env.DB_URL,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        TENANT_SERVICE_URL: 'http://localhost:' + (process.env.TENANT_SERVICE_PORT || 8083),
        APP_LOG_LEVEL: process.env.APP_LOG_LEVEL || 'DEBUG',
        CLOUD_LOG_LEVEL: process.env.CLOUD_LOG_LEVEL || 'DEBUG',
        JPA_SHOW_SQL: process.env.JPA_SHOW_SQL || 'true',
        SPRING_JPA_HIBERNATE_DDL_AUTO: 'update',
        SPRING_PROFILES_ACTIVE: process.env.SPRING_PROFILES_ACTIVE || 'local'
      },
      error_file: './logs/order-service-error.log',
      out_file: './logs/order-service-out.log',
      time: true
    },

    // Notification Service
    {
      name: 'notification-service',
      script: 'java',
      args: [
        '-jar',
        './backend/notification-service/target/notification-service-1.0.0.jar'
      ],
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        SERVER_PORT: process.env.NOTIFICATION_SERVICE_PORT || 8085,
        EUREKA_URL: process.env.EUREKA_URL || 'http://localhost:8761/eureka/',
        DB_URL: process.env.DB_URL,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        APP_LOG_LEVEL: process.env.APP_LOG_LEVEL || 'DEBUG',
        JPA_SHOW_SQL: process.env.JPA_SHOW_SQL || 'true',
        SPRING_JPA_HIBERNATE_DDL_AUTO: 'update',
        SPRING_PROFILES_ACTIVE: process.env.SPRING_PROFILES_ACTIVE || 'local'
      },
      error_file: './logs/notification-service-error.log',
      out_file: './logs/notification-service-out.log',
      time: true
    },

    // ============================================
    // FRONTEND SERVICES - To be configured
    // ============================================
    // Gateway Proxy (Frontend Entry Point)
    {
      name: 'gateway-proxy',
      script: 'server.js',
      cwd: './frontend/gateway-proxy',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 3000,
        HOME_PAGE_PORT: 3001,
        CUSTOMER_PORTAL_PORT: 3002,
        PROCESS_SERVER_PORTAL_PORT: 3003,
        ADMIN_PANEL_PORT: 3004,
        SUPER_ADMIN_PORT: 3005,
        BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://localhost:8080',
        NODE_ENV: 'production'
      }
    },

    // Home Page
    {
      name: 'home-page',
      script: 'npm',
      args: 'start',
      cwd: './frontend/home-page',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 3001,
        NODE_ENV: 'production'
      }
    },

    // Customer Portal
    {
      name: 'customer-portal',
      script: 'npm',
      args: 'start',
      cwd: './frontend/customer-portal',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 3002,
        NODE_ENV: 'production'
      }
    },

    // Process Server Portal
    {
      name: 'process-server-portal',
      script: 'npm',
      args: 'start',
      cwd: './frontend/process-server-portal',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 3003,
        NODE_ENV: 'production'
      }
    },

    // Admin Panel
    {
      name: 'admin-panel',
      script: 'npm',
      args: 'start',
      cwd: './frontend/admin-panel',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 3004,
        NODE_ENV: 'production'
      }
    },

    // Super Admin Portal
    {
      name: 'super-admin',
      script: 'npm',
      args: 'start',
      cwd: './frontend/super-admin',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        PORT: 3005,
        NODE_ENV: 'production'
      }
    }

  ]
};
