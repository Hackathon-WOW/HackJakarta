import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

import authRoutes from './routes/auth.routes.js';
import msmeRoutes from './routes/msme.routes.js';
import adminRoutes from './routes/admin.routes.js';
import investorRoutes from './routes/investor.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/msme', msmeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/investor', investorRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🚀 MSME Investment API Server                        ║
  ║                                                       ║
  ║   Server running on port ${config.port.toString().padEnd(22)}║
  ║   Environment: ${config.nodeEnv.padEnd(34)}║
  ║                                                       ║
  ║   Endpoints:                                          ║
  ║   • POST /api/auth/register                           ║
  ║   • POST /api/auth/login                              ║
  ║   • GET  /api/auth/profile                            ║
  ║   • MSME, Admin, Investor routes available            ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
