import { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TFG USERS API',
            version: '1.0.0',
            description: 'Auto-generated API docs',
        },
        servers: [
            { url: 'http://localhost:3000/api', description: 'Local server' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    // Point at your route/controller files where you’ll add JSDoc comments:
    apis: ['src/routes/*.ts', 'src/controllers/*.ts']
};

export default swaggerOptions;
