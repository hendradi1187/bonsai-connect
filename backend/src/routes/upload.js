const express = require('express');
const router = express.Router();
const multer = require('multer');
const { minioClient, bucketName } = require('../config/minio');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorizeRole } = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', authenticate, authorizeRole('superadmin', 'admin'), upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileName = `${uuidv4()}-${req.file.originalname}`;
        const metaData = {
            'Content-Type': req.file.mimetype,
        };

        await minioClient.putObject(
            bucketName,
            fileName,
            req.file.buffer,
            req.file.size,
            metaData
        );

        // Generate URL (for local dev using localhost:9000, 
        // in prod this would be your CDN or MinIO public endpoint)
        const baseUrl = process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT || 'localhost'}:9000`;
        const photoUrl = `${baseUrl}/${bucketName}/${fileName}`;

        res.json({
            message: 'File uploaded successfully',
            url: photoUrl,
            fileName: fileName
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
