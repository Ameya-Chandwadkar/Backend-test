import { Router } from 'express';
import { loginUser, logoutuser, registerUser, getDashboard, uploadGuestFile, updateAvatar } from '../controller/user.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutuser);
router.route('/dashboard').get(verifyJWT, getDashboard);

// Upload routes
router.route('/upload-guest').post(upload.single('file'), uploadGuestFile);
router.route('/avatar').post(verifyJWT, upload.single('avatar'), updateAvatar);

export default router;