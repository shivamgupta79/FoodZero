// server/config/validateEnv.js

/**
 * Validate required environment variables
 * This helps catch configuration issues early
 */

function validateEnv() {
  const required = [
    'JWT_SECRET',
    'MONGO_URI'  // Changed from MONGODB_URI to match .env file
  ];

  const missing = [];
  const warnings = [];

  // Check required variables
  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long for security');
  }

  // Check if using default/weak secrets
  const weakSecrets = ['SECRET_KEY', 'secret', '123456', 'password'];
  if (process.env.JWT_SECRET && weakSecrets.includes(process.env.JWT_SECRET)) {
    warnings.push('JWT_SECRET is using a weak/default value. Please use a strong random secret');
  }

  // Report issues
  if (missing.length > 0) {
    console.error('\n❌ CRITICAL: Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables in your .env file\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Environment variable warnings:');
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
    console.warn('');
  }

  console.log('✅ Environment variables validated successfully\n');
}

module.exports = validateEnv;
