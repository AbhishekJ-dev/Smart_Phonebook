import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. Basic Security Headers (Helmet)
// Configure Helmet to allow cross-origin resource sharing for static image serving
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// 2. Cross-Origin Resource Sharing
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. API Request Rate Limiter (Preventing Abuse)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});
app.use('/api', apiLimiter);

// 4. Body Parsers & Request Payload limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Static Files Serving (Serves uploaded contact profile pictures)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 6. Registered Routers
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/profile', profileRoutes);

// 7. System Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 8. 404 Fallback Router
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.baseUrl}`
  });
});

// 9. Error Handler Boundary
app.use(errorHandler);

export default app;
