import { Router } from 'express';
const router = Router();
import { register, login , getProfile , updateProfile} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';


router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getProfile);
router.patch('/update-profile', protect, updateProfile);

export default router;
