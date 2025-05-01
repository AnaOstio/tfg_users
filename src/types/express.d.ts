import { User } from '../models/user.model';

declare global {
    namespace Express {
        interface User {
            _id: string;
            // Otras propiedades que necesites
        }
        interface Request {
            user?: User;
        }
    }
}