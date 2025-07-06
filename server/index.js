import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { bigCommerceRoutes } from './routes/bigcommerce.js';
import { googleRoutes } from './routes/google.js';
import { googleAnalyticsRoutes } from './routes/googleAnalytics.js';
import { metaRoutes } from './routes/meta.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { authRoutes } from './routes/auth.js';
import { businessRoutes } from './routes/businesses.js';
import { DataAggregator } from './services/dataAggregator.js';
import { CacheManager } from './services/cacheManager.js';
import { BusinessManager } from './services/businessManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize services
const cacheManager = new CacheManager();
const dataAggregator = new DataAggregator(cacheManager);
const businessManager = new BusinessManager();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Make services available to routes
app.use((req, res, next) => {
  req.dataAggregator = dataAggregator;
  req.cacheManager = cacheManager;
  req.businessManager = businessManager;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/bigcommerce', bigCommerceRoutes);
app.use('/api/google', googleRoutes);
app.use('/api/google-analytics', googleAnalyticsRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      bigcommerce: process.env.BIGCOMMERCE_STORE_HASH ? 'configured' : 'not configured',
      google: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not configured',
      googleAnalytics: process.env.GOOGLE_ANALYTICS_PROPERTY_ID ? 'configured' : 'not configured',
      meta: process.env.META_APP_ID ? 'configured' : 'not configured'
    },
    businesses: businessManager.businesses.size
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Schedule data refresh every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  console.log('Running scheduled data refresh...');
  try {
    await dataAggregator.refreshAllData();
    console.log('Data refresh completed successfully');
  } catch (error) {
    console.error('Data refresh failed:', error);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on port ${PORT}`);
  console.log(`📊 Dashboard API available at http://localhost:${PORT}/api/dashboard`);
  console.log(`🏢 Business management at http://localhost:${PORT}/api/businesses`);
  console.log(`📈 Google Analytics at http://localhost:${PORT}/api/google-analytics`);
  console.log(`🔧 Health check at http://localhost:${PORT}/api/health`);
});