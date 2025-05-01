import { Request, Response, NextFunction } from 'express';
import { authenticate } from './auth.middleware';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/constants';

describe('Auth Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    it('should call next with valid token', async () => {
        const userId = '507f1f77bcf86cd799439011';
        const token = jwt.sign({ id: userId }, JWT_SECRET);

        mockRequest = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };

        await authenticate(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user).toBeDefined();
    });

    it('should return 401 if no token provided', async () => {

        mockRequest = {
            headers: {
                authorization: ``
            }
        };

        await authenticate(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'No autorizado'
        });
    });

    it('should return 401 for invalid token', async () => {
        mockRequest = {
            headers: {
                authorization: 'Bearer invalidtoken'
            }
        };

        await authenticate(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: 'No autorizado'
        });
    });
});