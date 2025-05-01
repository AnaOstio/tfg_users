import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, ERROR_MESSAGES } from '../utils/constants';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        return res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    }
};

// export const checkThesisOwnership = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const thesisId = req.params.thesisId || req.body.thesisId;
//         const userId = req.user.id;

//         const thesis = await Thesis.findById(thesisId);
//         if (!thesis) {
//             return res.status(404).json({ error: ERROR_MESSAGES.THESIS_NOT_FOUND });
//         }

//         if (thesis.createdBy.toString() !== userId) {
//             return res.status(403).json({ error: ERROR_MESSAGES.PERMISSION_DENIED });
//         }

//         next();
//     } catch (error: any) {
//         res.status(400).json({ error: error.message });
//     }
// };