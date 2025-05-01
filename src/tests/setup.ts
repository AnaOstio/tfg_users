import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Variables globales para la instancia de MongoMemoryServer
let mongo: MongoMemoryServer;

// Configuración inicial antes de todos los tests
beforeAll(async () => {
    process.env.JWT_SECRET = 'testsecret';
    process.env.SESSION_SECRET = 'testsessionsecret';

    // Crear instancia de MongoDB en memoria
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    // Configuración especial para tests
    await mongoose.connect(mongoUri);
});

// Limpieza antes de cada test
beforeEach(async () => {
    // Limpiar todas las colecciones
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// Limpieza final después de todos los tests
afterAll(async () => {
    // Cerrar conexión de Mongoose primero
    await mongoose.disconnect();
    // Luego detener el servidor en memoria
    await mongo.stop();
});

// Función helper para autenticación en tests
export const getAuthCookie = (userId: string): string => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET!);
    return `token=${token}`;
};