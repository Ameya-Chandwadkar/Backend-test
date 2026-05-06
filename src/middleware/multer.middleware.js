import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Use memoryStorage for Vercel deployment (no disk access)
const storage = multer.memoryStorage();

// Only accept PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
