import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { assignPermissions, getUserPermissions, revokePermissions, searchUsersByEmail } from '../controllers/permission.controller';

const router = Router();
router.use(authenticate);


/**
 * @openapi
 * /users/search:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Search users by email
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users matching the email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/users/search', searchUsersByEmail);

/**
 * @openapi
 * /permissions:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: Get permissions for the authenticated user
 *     responses:
 *       200:
 *         description: List of permissions for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/permissions', getUserPermissions);

/**
* @openapi
* /memory/{memoryId}/permissions:
*   post:
*     tags:
*       - Permissions
*     summary: Assign permissions to a user for a specific memory
*     parameters:
*       - in: path
*         name: memoryId
*         required: true
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               userId:
*                 type: string
*               permissions:
*                 type: array
*                 items:
*                   type: string
*     responses:
*       200:
*         description: Permissions assigned successfully
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                 data:
*                   type: object
*       400:
*         description: Bad request
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                 message:
*                   type: string
*       401:
*         description: Unauthorized
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                 message:
*                   type: string
*/
router.post('/memory/:memoryId/permissions', assignPermissions);

/**
 * @openapi
 * /memory/{memoryId}/permissions/{userId}:
 *   delete:
 *     tags:
 *       - Permissions
 *     summary: Revoke permissions from a user for a specific memory
 *     parameters:
 *       - in: path
 *         name: memoryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Permissions revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/memory/:memoryId/permissions/:userId', revokePermissions);

export default router;