
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

    it('throws if password is incorrect', async () => {
        const fake = { _id: '1', comparePassword: jest.fn().mockResolvedValue(false) };
        (UserModel.findOne as jest.Mock).mockResolvedValue(fake);
        await expect(authService.login('u', 'p'))
            .rejects.toThrow('Credenciales inválidas');
    });

    it('throws if passwords do not match on register', async () => {
        await expect(authService.register('u@email.com', 'p1', 'p2'))
            .rejects.toThrow('Las contraseñas no coinciden');
    });

    it('throws if email is already registered on register', async () => {
        (UserModel.findOne as jest.Mock).mockResolvedValue({ _id: '1' });
        await expect(authService.register('u@email.com', 'p', 'p'))
            .rejects.toThrow('El correo electrónico ya está en uso');
    });

    it('throws if no value data gived on register', async () => {
        (UserModel.findOne as jest.Mock).mockResolvedValue({ _id: '1' });
        await expect(authService.register('', '', ''))
            .rejects.toThrow('Todos los campos son obligatorios');
    });

    it('throws if email not does not comply with ECORR on register', async () => {
        (UserModel.findOne as jest.Mock).mockResolvedValue({ _id: '1' });
        await expect(authService.register('a', 'p', 'p'))
            .rejects.toThrow('El correo electrónico no cumple con el estándar ECORR');
    });

    it('throws if no value data gived on login', async () => {
        (UserModel.findOne as jest.Mock).mockResolvedValue({ _id: '1' });
        await expect(authService.login('', ''))
            .rejects.toThrow('Correo electrónico y contraseña son obligatorios');
    });
});
