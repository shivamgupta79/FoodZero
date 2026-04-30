// setup-mongodb.js
// Quick MongoDB Atlas Setup Helper

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 MongoDB Atlas Setup Helper\n');
console.log('This will help you connect to a FREE MongoDB cloud database\n');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('📝 Step 1: Create MongoDB Atlas Account');
  console.log('   Go to: https://www.mongodb.com/cloud/atlas/register\n');
  
  const hasAccount = await question('Do you have a MongoDB Atlas account? (yes/no): ');
  
  if (hasAccount.toLowerCase() !== 'yes') {
    console.log('\n✨ Please create an account first:');
    console.log('   1. Visit: https://www.mongodb.com/cloud/atlas/register');
    console.log('   2. Sign up (it\'s FREE!)');
    console.log('   3. Create a FREE M0 cluster');
    console.log('   4. Create a database user');
    console.log('   5. Whitelist your IP (or use 0.0.0.0/0 for all IPs)');
    console.log('   6. Get your connection string\n');
    console.log('Then run this script again!\n');
    rl.close();
    return;
  }

  console.log('\n📝 Step 2: Get Your Connection String');
  console.log('   1. Go to your Atlas dashboard');
  console.log('   2. Click "Connect" on your cluster');
  console.log('   3. Choose "Connect your application"');
  console.log('   4. Copy the connection string\n');
  console.log('   It looks like: mongodb+srv://username:password@cluster.mongodb.net/\n');

  const connectionString = await question('Paste your connection string here: ');

  if (!connectionString || !connectionString.includes('mongodb')) {
    console.log('\n❌ Invalid connection string. Please try again.\n');
    rl.close();
    return;
  }

  // Add database name if not present
  let finalConnectionString = connectionString.trim();
  if (!finalConnectionString.includes('food-donation')) {
    if (finalConnectionString.endsWith('/')) {
      finalConnectionString += 'food-donation';
    } else {
      finalConnectionString += '/food-donation';
    }
  }

  // Add retry writes if not present
  if (!finalConnectionString.includes('retryWrites')) {
    finalConnectionString += finalConnectionString.includes('?') ? '&' : '?';
    finalConnectionString += 'retryWrites=true&w=majority';
  }

  // Update .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    // Replace existing MONGO_URI or add it
    if (envContent.includes('MONGO_URI=')) {
      envContent = envContent.replace(/MONGO_URI=.*/g, `MONGO_URI=${finalConnectionString}`);
    } else {
      envContent += `\nMONGO_URI=${finalConnectionString}\n`;
    }
  } else {
    envContent = `PORT=5000
MONGO_URI=${finalConnectionString}
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
`;
  }

  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ MongoDB connection string saved to .env file!');
  console.log('\n🎉 Setup Complete!');
  console.log('\nNext steps:');
  console.log('   1. Restart your server: npm run server');
  console.log('   2. Look for "✅ MongoDB Connected" message');
  console.log('   3. Try registering a user at http://localhost:3001/register\n');

  rl.close();
}

setup().catch(error => {
  console.error('Error:', error);
  rl.close();
});
