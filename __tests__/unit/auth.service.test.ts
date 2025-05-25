
import authService from '../../src/services/auth.service';
import UserModel from '../../src/models/user.model';

jest.mock('../../src/models/user.model');

describe('AuthService (unit)', () => {
    beforeEach(() => jest.clearAllMocks());

    it('throws if no user found', async () => {
        (UserModel.findOne as jest.Mock).mockResolvedValue(null);
        await expect(authService.login('x', 'y'))
            .rejects.toThrow('Usuario no encontrado');
    });

    it('returns token when valid', async () => {
        const fake = { _id: '1', comparePassword: jest.fn().mockResolvedValue(true) };
        (UserModel.findOne as jest.Mock).mockResolvedValue(fake);
        const token = await authService.login('u', 'p');
        expect(token).toHaveProperty('token');
        expect(token).toHaveProperty('user');
    });
});
