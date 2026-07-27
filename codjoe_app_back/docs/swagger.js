/**
 * @file swagger.js
 * @description Configuration Swagger/OpenAPI pour la documentation de l'API CodJoe
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CodJoe API',
            version: '1.0.0',
            description: `
## API REST CodJoe — Documentation officielle

Cette API expose les services de la plateforme e-commerce CodJoe.

### Authentification
La majorité des endpoints protégés utilisent un token **JWT Bearer**.
Après connexion via \`POST /api/auth/login\`, inclure le token dans le header :
\`\`\`
Authorization: Bearer <token>
\`\`\`

### Formats d'échange
Toutes les requêtes et réponses utilisent le format **JSON** (\`application/json\`),
sauf les uploads de fichiers (\`multipart/form-data\`).
            `,
            contact: {
                name: 'CodJoe Support',
                email: 'contact@codjoe.fr'
            },
            license: {
                name: 'ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:8085',
                description: 'Serveur de développement local'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token JWT obtenu via POST /api/auth/login'
                }
            },
            schemas: {
                // ----- Auth -----
                SignUpInput: {
                    type: 'object',
                    required: ['firstName', 'lastName', 'email', 'password', 'country', 'birthday'],
                    properties: {
                        firstName: { type: 'string', example: 'Jean' },
                        lastName:  { type: 'string', example: 'Dupont' },
                        email:     { type: 'string', format: 'email', example: 'jean.dupont@email.com' },
                        password:  { type: 'string', minLength: 6, maxLength: 15, example: 'motdepasse' },
                        country:   { type: 'string', example: 'France' },
                        birthday:  { type: 'string', format: 'date', example: '1990-01-15' },
                        address:   { type: 'string', example: '12 rue des Lilas' }
                    }
                },
                LoginInput: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email:    { type: 'string', format: 'email', example: 'jean.dupont@email.com' },
                        password: { type: 'string', example: 'motdepasse' }
                    }
                },
                AuthToken: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                    }
                },
                // ----- Product -----
                Product: {
                    type: 'object',
                    properties: {
                        _id:      { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                        name:     { type: 'string', example: 'T-Shirt Codjoe' },
                        price:    { type: 'string', example: '29.99' },
                        quantity: { type: 'integer', example: 50 },
                        soldOut:  { type: 'boolean', example: false },
                        sizes:    { type: 'string', example: 'S,M,L,XL' },
                        category: { type: 'string', example: 'tshirts' }
                    }
                },
                // ----- Order -----
                OrderItem: {
                    type: 'object',
                    required: ['productId', 'productName', 'productPrice', 'size', 'quantity', 'subtotal'],
                    properties: {
                        productId:    { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                        productName:  { type: 'string', example: 'T-Shirt Codjoe' },
                        productPrice: { type: 'number', example: 29.99 },
                        size:         { type: 'string', example: 'M' },
                        quantity:     { type: 'integer', example: 2 },
                        subtotal:     { type: 'number', example: 59.98 }
                    }
                },
                CreateOrderInput: {
                    type: 'object',
                    required: ['items', 'subtotal', 'total'],
                    properties: {
                        items:          { type: 'array', items: { '$ref': '#/components/schemas/OrderItem' } },
                        subtotal:       { type: 'number', example: 59.98 },
                        shippingFee:    { type: 'number', example: 5.99 },
                        total:          { type: 'number', example: 65.97 },
                        paymentIntentId:{ type: 'string', example: 'pi_3NxXxXXxXxX' },
                        shippingAddress:{ '$ref': '#/components/schemas/ShippingAddress' }
                    }
                },
                ShippingAddress: {
                    type: 'object',
                    properties: {
                        firstName:  { type: 'string', example: 'Jean' },
                        lastName:   { type: 'string', example: 'Dupont' },
                        address:    { type: 'string', example: '12 rue des Lilas' },
                        city:       { type: 'string', example: 'Paris' },
                        country:    { type: 'string', example: 'France' },
                        postalCode: { type: 'string', example: '75001' }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id:             { type: 'string' },
                        orderNumber:     { type: 'string', example: 'COD-L3K2J-AB1CD' },
                        userId:          { type: 'string' },
                        items:           { type: 'array', items: { '$ref': '#/components/schemas/OrderItem' } },
                        subtotal:        { type: 'number' },
                        shippingFee:     { type: 'number' },
                        total:           { type: 'number' },
                        status:          { type: 'string', enum: ['pending','processing','shipped','delivered','cancelled'] },
                        paymentStatus:   { type: 'string', enum: ['pending','completed','failed','refunded'] },
                        shippingAddress: { '$ref': '#/components/schemas/ShippingAddress' },
                        createdAt:       { type: 'string', format: 'date-time' }
                    }
                },
                // ----- Errors -----
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Une erreur est survenue' }
                    }
                },
                ValidationError: {
                    type: 'object',
                    properties: {
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    path:    { type: 'string', example: 'email' },
                                    msg:     { type: 'string', example: 'Email is required' },
                                    value:   { type: 'string' }
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                Unauthorized: {
                    description: 'Token JWT manquant ou invalide',
                    content: { 'text/plain': { schema: { type: 'string', example: 'Access denied.' } } }
                },
                NotFound: {
                    description: 'Ressource introuvable',
                    content: { 'application/json': { schema: { '$ref': '#/components/schemas/Error' } } }
                }
            }
        }
    },
    apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
