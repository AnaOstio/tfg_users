import { Router } from 'express';
import authRoutes from './auth.routes';
import permissionRoutes from './permission.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/permissions', permissionRoutes);

export default router;