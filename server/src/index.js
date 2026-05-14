import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import env from './config/env.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import dns from 'dns';
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// ─── Security Middleware ──────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ─────────────────────────────────────────────
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsers ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Compression ──────────────────────────────────────
app.use(compression());

// ─── Logging ──────────────────────────────────────────
if (env.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Rate Limiting ────────────────────────────────────
// app.use('/api', generalLimiter);
app.use('/api', (req, res, next) => {
  next();
});

// ─── Static Files (local upload fallback) ─────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ───────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/models', modelRoutes);

// ─── Health Check ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '3D Object Studio API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Error Handler ────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`\n🚀 3D Object Studio API`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Port: ${env.PORT}`);
      console.log(`   S3 Storage: ${env.isS3Configured ? 'enabled' : 'local fallback'}`);
      console.log(`   Client URL: ${env.CLIENT_URL}\n`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });

      // Force close after 10s
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
