import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import panelsRoutes from './routes/panels.js';
import adminsRoutes from './routes/admins.js';
import usersRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';
import xuiRoutes from './routes/xui.js';

// Import database initialization
import { initDatabase } from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Set JWT secret if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
}

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://localhost:4173',
    'https://tr3.hmray.us',
    'http://tr3.hmray.us'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/panels', panelsRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/xui', xuiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'X-UI SELL Panel API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'X-UI SELL Panel API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/panels',
      '/api/admins',
      '/api/users',
      '/api/settings',
      '/api/xui'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting X-UI SELL Panel Server...');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
    
    // Initialize database first
    console.log('🗄️ Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🎉 X-UI SELL Panel Server Started Successfully!');
      console.log('================================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
      console.log('');
      console.log('🔐 Demo Credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log('   GET  /api/health');
      console.log('   POST /api/auth/login');
      console.log('   GET  /api/auth/me');
      console.log('   GET  /api/panels');
      console.log('   GET  /api/users');
      console.log('   GET  /api/admins');
      console.log('   GET  /api/settings');
      console.log('');
      console.log('================================================');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('🔄 Trying to kill existing process...');
        
        // Try to kill existing process and restart
        import('child_process').then(({ exec }) => {
          exec(`lsof -ti:${PORT} | xargs -r kill -9`, (err) => {
            if (!err) {
              console.log('✅ Killed existing process, restarting...');
              setTimeout(() => startServer(), 2000);
            } else {
              console.error('❌ Could not kill existing process');
              process.exit(1);
            }
          });
        });
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

    // Graceful shutdown handlers
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();