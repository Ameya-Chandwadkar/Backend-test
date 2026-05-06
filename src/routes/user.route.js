import { Router } from 'express';
import { loginUser, logoutuser, registerUser, getDashboard, updateHiringRoles, getHirersList, getTechRoles, updateProfile, getAnalytics } from '../controller/user.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').post(logoutuser);
router.route('/dashboard').get(verifyJWT, getDashboard);
router.route('/roles').put(verifyJWT, updateHiringRoles);
router.route('/profile').put(verifyJWT, updateProfile);
router.route('/analytics').get(verifyJWT, getAnalytics);

// Public routes (no auth) — for the upload page
router.route('/list').get(getHirersList);
router.route('/tech-roles').get(getTechRoles);

export default router;