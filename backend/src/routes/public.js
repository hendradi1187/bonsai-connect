const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { minioClient, ALLOWED_BUCKETS } = require('../config/minio');
const participantController = require('../controllers/participantController');
const passportController = require('../controllers/passportController');
const certificateController = require('../controllers/certificateController');

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Terlalu banyak pendaftaran dari IP ini. Coba lagi dalam 1 jam.' },
});

router.post('/register', registerLimiter, participantController.registerPublic);

// Bonsai Passport Registry (public, no auth)
router.get('/passports', passportController.listPassports);
router.get('/passports/search', passportController.searchPassports);
router.get('/passports/:passportId', passportController.getPassport);

// Certificate verification (public)
router.get('/certificates/verify', certificateController.verify);

// Public photo upload — no auth required, bonsai-photos bucket only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Hanya file gambar yang diizinkan'));
    }
    cb(null, true);
  },
});

router.post('/upload-photo', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran file terlalu besar. Maksimum 5 MB.'
        : (err.message || 'File tidak valid');
      return res.status(status).json({ message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
    }

    const bucket = 'bonsai-photos';
    const ext = req.file.originalname.split('.').pop();
    const fileName = `public/${uuidv4()}.${ext}`;

    await minioClient.putObject(bucket, fileName, req.file.buffer, req.file.size, {
      'Content-Type': req.file.mimetype,
    });

    const base = process.env.MINIO_PUBLIC_URL
      || `http://${process.env.MINIO_ENDPOINT || 'localhost'}:9000`;

    res.json({
      url: `${base}/${bucket}/${fileName}`,
      fileName,
    });
  } catch (error) {
    console.error('Public upload error:', error);
    res.status(500).json({ message: 'Gagal mengunggah foto' });
  }
});

module.exports = router;
