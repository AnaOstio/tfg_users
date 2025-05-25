import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { assignPermissions, getUserPermissions, revokePermissions, searchUsersByEmail } from '../controllers/permission.controller';

const router = Router();

router.use(authenticate);

router.get('/users/search', searchUsersByEmail);
router.get('/permissions', getUserPermissions);
router.post('/memory/:memoryId/permissions', assignPermissions);
router.delete('/memory/:memoryId/permissions/:userId', revokePermissions);

export default router;