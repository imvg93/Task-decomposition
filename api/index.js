const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const apiRoutes = require('../backend/routes/api');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Task Decomposition API is running' });
});

// Favicon handler to prevent browser 404 logs
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// API routes
app.use('/api', apiRoutes);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.warn('⚠️  MONGODB_URI is not defined in environment variables.');
  console.warn('⚠️  Server will run without database connection (API endpoints will work, but data persistence disabled).');
} else {
  // Validate connection string format
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    console.error('❌ Invalid MONGODB_URI format. Must start with "mongodb://" or "mongodb+srv://"');
    console.error('   Current value:', mongoUri);
    console.error('   Example: mongodb://localhost:27017/task-decomposition');
    console.warn('⚠️  Continuing without database connection...');
  } else {
    mongoose
      .connect(mongoUri)
      .then(() => {
        console.log('✅ Connected to MongoDB');
      })
      .catch((err) => {
        console.error('❌ Error connecting to MongoDB:', err.message);
        console.warn('⚠️  Server will continue without database connection...');
      });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      message,
    },
  });
});

// Export for Vercel serverless function
module.exports = app;
