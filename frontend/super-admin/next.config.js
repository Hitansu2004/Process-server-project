/** @type {import('next').NextConfig} */
const nextConfig = {
    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,
    swcMinify: true,

    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
    },

    experimental: {
        optimizeCss: true,
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'credentialless',
                    },
                ],
            },
        ];
    },

    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Enable bundle analyzer when ANALYZE=true
    ...(process.env.ANALYZE === 'true' && {
        webpack: (config) => {
            const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')();
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    reportFilename: './analyze.html',
                    openAnalyzer: true,
                })
            );
            return config;
        },
    }),
}

module.exports = nextConfig
