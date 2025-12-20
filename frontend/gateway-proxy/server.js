const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development, enable in production
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: '*', // Configure this properly in production
    credentials: true
}));

// Compression middleware for better performance
app.use(compression({
    level: 6,
    threshold: 1024, // Only compress if > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            home: `http://localhost:${process.env.HOME_PAGE_PORT}`,
            processServer: `http://localhost:${process.env.PROCESS_SERVER_PORTAL_PORT}`,
            admin: `http://localhost:${process.env.ADMIN_PANEL_PORT}`,
            superAdmin: `http://localhost:${process.env.SUPER_ADMIN_PORT}`,
            customer: `http://localhost:${process.env.CUSTOMER_PORTAL_PORT}`
        }
    });
});

// Proxy configuration with performance optimizations
const createProxy = (target, pathRewrite = {}) => {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying for HMR
        pathRewrite,
        onProxyReq: (proxyReq, req, res) => {
            // Add custom headers if needed
            proxyReq.setHeader('X-Forwarded-Proto', 'http');
        },
        onProxyRes: (proxyRes, req, res) => {
            // Add caching headers for static assets
            if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
                proxyRes.headers['Cache-Control'] = 'public, max-age=31536000, immutable';
            }
        },
        onError: (err, req, res) => {
            console.error('Proxy Error:', err);
            res.status(500).json({
                error: 'Gateway Error',
                message: 'The requested service is unavailable',
                timestamp: new Date().toISOString()
            });
        }
    });
};

// Route mappings - Order matters! More specific routes first
console.log('🌐 Setting up route mappings...');

// Super Admin Portal
app.use('/super-admin', createProxy(`http://localhost:${process.env.SUPER_ADMIN_PORT}`));

// Admin Panel
app.use('/admin', createProxy(`http://localhost:${process.env.ADMIN_PANEL_PORT}`));

// Customer Portal
app.use('/customer', createProxy(`http://localhost:${process.env.CUSTOMER_PORTAL_PORT}`));

// Process Server Portal
app.use('/process-server', createProxy(`http://localhost:${process.env.PROCESS_SERVER_PORTAL_PORT}`));

// Backend API Proxy (optional - if you want to proxy API calls too)
app.use('/api', createProxy(process.env.BACKEND_API_URL, {
    '^/api': ''
}));

// Home Page (Root) - Must be last!
app.use('/', createProxy(`http://localhost:${process.env.HOME_PAGE_PORT}`));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Gateway Error:', err);
    res.status(500).json({
        error: 'Internal Gateway Error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 ProcessServe Frontend Gateway Started!');
    console.log('='.repeat(60));
    console.log(`\n📍 Gateway URL: http://localhost:${PORT}`);
    console.log('\n🔗 Route Mappings:');
    console.log(`   🏠 Home Page:        http://localhost:${PORT}/`);
    console.log(`   ⚙️  Admin Panel:      http://localhost:${PORT}/admin`);
    console.log(`   👥 Customer Portal:  http://localhost:${PORT}/customer`);
    console.log(`   ⚖️  Process Server:   http://localhost:${PORT}/process-server`);
    console.log(`   👑 Super Admin:      http://localhost:${PORT}/super-admin`);
    console.log(`   🔌 Backend API:      http://localhost:${PORT}/api`);
    console.log(`   ❤️  Health Check:    http://localhost:${PORT}/health`);
    console.log('\n📊 Performance Features:');
    console.log('   ✅ Gzip/Brotli compression enabled');
    console.log('   ✅ Security headers (Helmet)');
    console.log('   ✅ CORS configured');
    console.log('   ✅ Static asset caching');
    console.log('   ✅ WebSocket support (HMR)');
    console.log('\n' + '='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    process.exit(0);
});
