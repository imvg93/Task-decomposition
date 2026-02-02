const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
// In Vercel, env vars are set in dashboard, but we try to load .env for local dev
try {
  dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
} catch (err) {
  console.warn('Could not load .env file (this is normal in Vercel):', err.message);
}

let apiRoutes;
try {
  apiRoutes = require('../backend/routes/api');
} catch (err) {
  console.error('Failed to load API routes:', err);
  throw err;
}

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins (you can restrict this in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (accessible at /api/health, but function receives /health)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Task Decomposition API is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to verify services are loaded (accessible at /api/test, but function receives /test)
app.get('/test', (req, res) => {
  try {
    const DecompositionService = require('../backend/services/decompositionService');
    const DependencyService = require('../backend/services/dependencyService');
    const { PATTERNS } = require('../backend/utils/patternLibrary');
    
    res.status(200).json({
      status: 'ok',
      message: 'All services loaded successfully',
      services: {
        DecompositionService: typeof DecompositionService === 'function' ? 'loaded' : 'failed',
        DependencyService: typeof DependencyService === 'function' ? 'loaded' : 'failed',
        Patterns: Array.isArray(PATTERNS) ? `loaded (${PATTERNS.length} patterns)` : 'failed'
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to load services',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// API routes
// When Vercel routes /api/* to this function, it strips the /api prefix
// So /api/decompose becomes /decompose in the function
// Mount at root to match the stripped path
app.use('/', apiRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      availableEndpoints: ['/api/decompose', '/api/validate', '/api/clarify', '/api/health', '/api/test']
    }
  });
});

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
