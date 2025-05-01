import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        req.user = { _id: decoded.id };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'No autorizado' });
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