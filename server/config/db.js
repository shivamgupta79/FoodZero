// server/config/db.js

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Free MongoDB Atlas connection string (read-only demo)
    // Replace with your own MongoDB Atlas connection string
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/foodzero";
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error(`\n⚠️  Using MongoDB Atlas is recommended!`);
    console.error(`\n📝 Quick Setup:`);
    console.error(`1. Go to: https://www.mongodb.com/cloud/atlas/register`);
    console.error(`2. Create a FREE cluster (M0)`);
    console.error(`3. Get your connection string`);
    console.error(`4. Update .env file with: MONGO_URI=your_connection_string\n`);
    
    // Don't exit - allow server to run for testing frontend
    console.log(`⚠️  Server running WITHOUT database connection`);
    console.log(`   Frontend will work but data won't be saved\n`);
  }
};

module.exports = connectDB;
