import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { notFound, errorHandler } from './middlewares/error.middleware';
import Logger from './config/logger';
import authRoutes from './routes/auth.routes';
import permissionRoutes from './routes/permission.routes';
import swaggerOptions from './config/swagger';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();

// Configuración de morgan para logs HTTP
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
const morganStream = {
    write: (message: string) => Logger.http(message.trim())
};

app.use(morgan(morganFormat, { stream: morganStream }));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', permissionRoutes);

// Health check
app.get('/health', (req, res) => {
    Logger.debug('Health check realizado');
    res.status(200).json({ status: 'OK' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;