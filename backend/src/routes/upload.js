const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { minioClient, ALLOWED_BUCKETS, bucketName: DEFAULT_BUCKET } = require('../config/minio');
const { authenticate, authorizeRole } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

/**
 * POST /api/upload?bucket=<bucket-name>
 *
 * Allowed buckets  : bonsai-photos, event-assets, certificates, documents
 * Default bucket   : bonsai-photos
 * Access           : superadmin, admin
 *
 * Returns: { url, fileName, bucket }
 */
router.post(
  '/',
  authenticate,
  authorizeRole('superadmin', 'admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Resolve target bucket
      const requestedBucket = req.query.bucket || DEFAULT_BUCKET;
      if (!ALLOWED_BUCKETS.has(requestedBucket)) {
        return res.status(400).json({
          message: `Invalid bucket. Allowed: ${[...ALLOWED_BUCKETS].join(', ')}`,
        });
      }

      const ext = req.file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${ext}`;

      await minioClient.putObject(
        requestedBucket,
        fileName,
        req.file.buffer,
        req.file.size,
        { 'Content-Type': req.file.mimetype }
      );

      const base = process.env.MINIO_PUBLIC_URL
        || `http://${process.env.MINIO_ENDPOINT || 'localhost'}:9000`;

      res.json({
        message: 'File uploaded successfully',
        url:      `${base}/${requestedBucket}/${fileName}`,
        fileName,
        bucket:   requestedBucket,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
