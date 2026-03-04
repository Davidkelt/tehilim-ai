import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/database.js';
import { prefetchAllPsalms } from './services/sefaria.js';
import psalmsRoutes from './routes/psalms.js';
import analysisRoutes from './routes/analysis.js';
import dailyRoutes from './routes/daily.js';
import searchRoutes from './routes/search.js';
import moodsRoutes from './routes/moods.js';
import userRoutes from './routes/user.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// Security headers
app.use(helmet({
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: [
        "'self'",
        "https://www.sefaria.org",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://apis.google.com",
      ],
      frameSrc: [
        "'self'",
        "https://tehilimai-david.firebaseapp.com",
        "https://accounts.google.com",
      ],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS — הרחבנו כדי לאפשר ל-Railway healthcheck + כל origin מה-env
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3001',
  'https://tehilim-ai-production.up.railway.app',          // הדומיין שלך
  'https://*.railway.app',                                 // wildcard ל-healthcheck ו-subdomains
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server, Railway healthcheck)
    if (!origin || allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // wildcard handling
        const regex = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return allowed === origin;
    })) {
      console.log(`[CORS] Allowed origin: ${origin || 'no-origin'}`);
      callback(null, true);
    } else {
      console.log(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // אם אתה משתמש ב-cookies/auth
}));

// Body parsing with size limit (50kb for user data sync)
app.use(express.json({ limit: '50kb' }));

// Global rate limiter: 100 req/min per IP
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'בקשות רבות מדי, נסה שוב מאוחר יותר' },
});
app.use('/api', globalLimiter);

// Stricter rate limiter for AI analysis (expensive API calls): 10 req/min
const analysisLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'בקשות ניתוח רבות מדי, נסה שוב בעוד דקה' },
});

// Serve static files from built client
const clientDistPath = path.resolve(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Health check - כבר קיים, אבל הוספתי לוג כדי לראות
app.get('/api/health', (_req, res) => {
  console.log('[Healthcheck] Requested from:', _req.headers.origin || 'unknown');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/psalms', psalmsRoutes);
app.use('/api/analysis', analysisLimiter, analysisRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/moods', moodsRoutes);
app.use('/api/user', userRoutes);

// API 404 handler (before SPA fallback)
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

async function start() {
  try {
    initDatabase();
    console.log('Database initialized');

    // Pre-fetch psalms in background
    prefetchAllPsalms().catch(err => {
      console.error('Background psalm fetch error:', err);
    });

    app.listen(PORT, '0.0.0.0', () => {  // ← חשוב: '0.0.0.0' כדי ש-Railway יוכל לגשת
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();