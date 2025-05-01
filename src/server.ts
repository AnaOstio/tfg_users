import app from './app';
import { connectDB } from './config/database';
import { PORT } from './utils/constants';

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
});