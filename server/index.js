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

// Function to find available port
const findAvailablePort = async (startPort = 3001) => {
  const net = await import('net');
  
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address()?.port;
      server.close(() => {
        resolve(port);
      });
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try next port
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

// Set JWT secret if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
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
    port: process.env.PORT || 'auto-detected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'X-UI SELL Panel API Server',
    version: '1.0.0',
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
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
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

// Function to kill process using port
const killProcessOnPort = async (port) => {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    console.log(`🔍 Checking for processes using port ${port}...`);
    
    // Find process using the port
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    const pids = stdout.trim().split('\n').filter(pid => pid);
    
    if (pids.length > 0) {
      console.log(`💀 Killing processes on port ${port}: ${pids.join(', ')}`);
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
          console.log(`✅ Killed process ${pid}`);
        } catch (error) {
          console.log(`⚠️ Could not kill process ${pid}: ${error.message}`);
        }
      }
      // Wait a moment for processes to be killed
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`ℹ️ No processes found using port ${port}`);
    }
  } catch (error) {
    console.log(`⚠️ Could not check/kill processes on port: ${error.message}`);
  }
};

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting X-UI SELL Panel Server...');
    
    // Initialize database
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    // Get desired port
    const desiredPort = parseInt(process.env.PORT) || 3001;
    
    // Try to kill any existing process on the port
    await killProcessOnPort(desiredPort);
    
    // Find available port
    const PORT = await findAvailablePort(desiredPort);
    
    if (PORT !== desiredPort) {
      console.log(`⚠️ Port ${desiredPort} was in use, using port ${PORT} instead`);
    }
    
    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('🎉 X-UI SELL Panel Server Started Successfully!');
      console.log('================================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📝 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔑 JWT Secret: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);
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
        console.error(`❌ Port ${PORT} is still in use. Trying to restart...`);
        setTimeout(startServer, 5000);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();