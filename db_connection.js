
const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables

// Get the MongoDB URI from the .env file
const uri = process.env.MONGODB_URI;

const connectToDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://practiceuser:12345@test-pro-db.utets.mongodb.net/?retryWrites=true&w=majority&appName=test-pro-db', { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Adjust as needed
      socketTimeoutMS: 45000, // Adjust as needed
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = connectToDB;

