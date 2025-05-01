import mongoose from 'mongoose';
import { MONGO_URI } from '../utils/constants';

// Variable para verificar si ya hay una conexión
let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB ya está conectado');
        return;
    }

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout después de 5s en lugar de 30s
        });

        isConnected = mongoose.connection.readyState === 1;
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

// Manejar eventos de conexión
mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('Mongoose conectado a DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Error de conexión a MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('Mongoose desconectado');
});

// Cerrar conexión adecuadamente al terminar la aplicación
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada por terminación de la app');
    process.exit(0);
});