import { Router } from 'express';
import { register, login, logout, verifyToken } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';


const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify-token', authenticate, verifyToken);;

export default router;