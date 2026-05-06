import { Router } from 'express';
import { uploadResume, getAllResumes, getResumeById, deleteResume, toggleShortlist } from '../controller/resume.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

// Public route — anyone can upload a resume (no auth)
router.route('/upload').post(upload.single('resume'), uploadResume);

// Protected routes — only authenticated hirers
router.route('/all').get(verifyJWT, getAllResumes);
router.route('/:id').get(verifyJWT, getResumeById);
router.route('/:id').delete(verifyJWT, deleteResume);
router.route('/:id/shortlist').put(verifyJWT, toggleShortlist);

export default router;
