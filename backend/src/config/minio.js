const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint:  process.env.MINIO_ENDPOINT  || 'localhost',
  port:      parseInt(process.env.MINIO_PORT) || 9000,
  useSSL:    process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

// ─── Bucket registry ─────────────────────────────────────────────────────────
// Each entry: { name, publicRead, description }
const BUCKETS = [
  {
    name:        'bonsai-photos',
    publicRead:  true,
    description: 'Foto bonsai lomba dan check-in',
  },
  {
    name:        'event-assets',
    publicRead:  true,
    description: 'Banner dan poster event',
  },
  {
    name:        'certificates',
    publicRead:  true,
    description: 'Sertifikat digital peserta',
  },
  {
    name:        'documents',
    publicRead:  false,
    description: 'Dokumen admin (private)',
  },
];

// Exported map: bucket key → bucket name (for use in controllers/routes)
const BUCKET = Object.fromEntries(BUCKETS.map((b) => [b.name.replace(/-/g, '_').toUpperCase(), b.name]));
// e.g. BUCKET.BONSAI_PHOTOS === 'bonsai-photos'

// Valid bucket names for upload route validation
const ALLOWED_BUCKETS = new Set(BUCKETS.map((b) => b.name));

// Public-read policy template
const publicReadPolicy = (bucketName) => JSON.stringify({
  Version: '2012-10-17',
  Statement: [
    {
      Effect:    'Allow',
      Principal: { AWS: ['*'] },
      Action:    ['s3:GetObject'],
      Resource:  [`arn:aws:s3:::${bucketName}/*`],
    },
  ],
});

const initMinio = async () => {
  for (const bucket of BUCKETS) {
    try {
      const exists = await minioClient.bucketExists(bucket.name);
      if (!exists) {
        await minioClient.makeBucket(bucket.name);
        console.log(`[minio] Bucket "${bucket.name}" created — ${bucket.description}`);
      } else {
        console.log(`[minio] Bucket "${bucket.name}" already exists`);
      }

      if (bucket.publicRead) {
        await minioClient.setBucketPolicy(bucket.name, publicReadPolicy(bucket.name));
        console.log(`[minio] Public-read policy applied to "${bucket.name}"`);
      }
    } catch (err) {
      console.error(`[minio] Error initialising bucket "${bucket.name}":`, err.message);
    }
  }
};

// Legacy export kept for backward compat (existing upload route used bucketName)
const bucketName = 'bonsai-photos';

module.exports = {
  minioClient,
  bucketName,      // legacy default
  BUCKET,
  ALLOWED_BUCKETS,
  initMinio,
};
