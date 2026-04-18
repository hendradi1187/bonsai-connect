const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── HTTP request logging ───────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── CORS — whitelist dari env var CORS_ORIGIN ─────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (curl, mobile app, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} tidak diizinkan`));
  },
  credentials: true,
}));

// ── Rate limiting ──────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak pendaftaran dari IP ini. Coba lagi dalam 1 jam.' },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/events', require('./routes/events'));
app.use('/api/public', require('./routes/public'));
app.use('/api/participants', require('./routes/participants'));
app.use('/api/scoring', require('./routes/scoring'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/ranking', require('./routes/ranking'));
app.use('/api/event-control', require('./routes/eventControl'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/certificates', require('./routes/certificates'));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Bonsai Connect API' });
});

// Error handling
app.use(errorHandler);

module.exports = app;
