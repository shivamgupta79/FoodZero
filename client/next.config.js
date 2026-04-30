/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable React 19 features
    ppr: false,
  },
  outputFileTracingRoot: __dirname,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    // Ignore external modules that might cause issues
    config.externals = config.externals || [];
    config.externals.push({
      'web3': 'web3',
      'ethereum': 'ethereum'
    });
    return config;
  }
};

module.exports = nextConfig;
