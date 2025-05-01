import { findUserByEmail, getUserById } from '../services/user.service';
import User from '../models/user.model';

describe('User Service', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'password123'
    };

    beforeEach(async () => {
        await User.create(testUser);
    });

    describe('findUserByEmail', () => {
        it('should find user by email', async () => {
            const user = await findUserByEmail(testUser.email);

            expect(user).toBeDefined();
            expect(user?.email).toBe(testUser.email);
        });

        it('should return null for non-existent email', async () => {
            const user = await findUserByEmail('nonexistent@example.com');
            expect(user).toBeNull();
        });
    });

    describe('getUserById', () => {
        it('should get user by id', async () => {
            const existingUser = await User.findOne({ email: testUser.email });
            const user = await getUserById(existingUser!._id.toString());

            expect(user).toBeDefined();
            expect(user?.email).toBe(testUser.email);
        });

        it('should return null for non-existent id', async () => {
            const user = await getUserById('507f1f77bcf86cd799439011');
            expect(user).toBeNull();
        });
    });
});