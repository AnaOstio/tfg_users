# TFG Users API

API RESTful para la gestión de usuarios y persmisos. 

## Requisitos

- Node.js >= 16
- MongoDB (local o Atlas)
- npm

## Instalación

1. Clonar el repositorio:
    ```bash
   git clone https://github.com/anaostio/tfg_users.git
   cd tfg_users
   ```
2. Instala las dependencias:
    ```bash
    npm install
    ````
3. Configura las variables de entorno
   ```
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/tfg_users
    JWT_SECRET=tu_clave_secreta
    NODE_ENV=development
   ```
4. Iniciar el servidor:
   ```bash
   npm run dev
   ```

El servidor estará disponible en: http://localhost:3000 

El proyecto dispone de Documentación Swagger: http://localhost:3000/api-docs/ 