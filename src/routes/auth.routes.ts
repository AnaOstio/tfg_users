import { Router } from 'express';
import { register, login, verifyTokenNext } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-token', authenticate, verifyTokenNext)

export default router;