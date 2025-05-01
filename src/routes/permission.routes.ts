import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as controller from '../controllers/permission.controller';

const router = Router();

router.use(authenticate);

router.get('/search-user', controller.searchUserByEmail);
router.get('/available', controller.getPermissions);
router.post('/assign', controller.assign);
router.post('/revoke', controller.revoke);

export default router;