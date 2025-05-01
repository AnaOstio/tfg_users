import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import mainRouter from './routes';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { SESSION_SECRET, SESSION_EXPIRATION } from './utils/constants';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: SESSION_EXPIRATION,
        httpOnly: true
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// Rutas
app.use('/api', mainRouter);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

export default app;