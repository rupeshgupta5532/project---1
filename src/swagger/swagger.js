const config = require('../config');
const swaggerJsdoc = require('swagger-jsdoc');

const port = String(config.port).trim();

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Users & Orders API',
      description:
        '1. Call **Auth → POST /api/auth/login** (or **register**), copy the `token` from the response.\n' +
        '2. Click the green **Authorize** button (top of this page), enter the token in **Value** (only the token — not the word `Bearer`), and **Authorize**.\n' +
        '3. Swagger will send `Authorization: Bearer <token>` on every protected request.\n\n' +
        'Roles: `user` | `admin`. Public routes: login and register only.',
      version: '1.0.0'
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Local server (matches PORT in .env)'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Register & login (returns JWT)' },
      { name: 'Users', description: 'Users CRUD — admin or self where noted' },
      { name: 'Orders', description: 'Orders & analytics — Bearer required; stats admin-only' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Paste your JWT from login/register. The browser sends: `Authorization: Bearer <token>`.'
        }
      },
      schemas: {
        ErrorMessage: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Authentication required' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Alice' },
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            age: { type: 'integer', example: 28 },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'New User' },
            email: { type: 'string', format: 'email', example: 'newuser@example.com' },
            age: { type: 'integer', example: 22 },
            password: { type: 'string', format: 'password', minLength: 6, example: 'secret12' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'alice@example.com' },
            password: { type: 'string', format: 'password', example: 'secret12' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        },
        AdminCreateUserRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Staff' },
            email: { type: 'string', format: 'email', example: 'staff@example.com' },
            age: { type: 'integer', example: 30 },
            password: { type: 'string', minLength: 6, example: 'secret12' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' }
          }
        },
        UpdateUserRequest: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            age: { type: 'integer' },
            password: { type: 'string', minLength: 6 },
            role: { type: 'string', enum: ['user', 'admin'], description: 'Admin only' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            amount: { type: 'number', example: 99.5 },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'cancelled'],
              example: 'pending'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'number', minimum: 0, example: 49.99 },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'cancelled']
            }
          }
        },
        UpdateOrderRequest: {
          type: 'object',
          properties: {
            amount: { type: 'number', minimum: 0 },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'cancelled']
            }
          }
        },
        TotalRevenueResponse: {
          type: 'object',
          properties: {
            totalRevenue: { type: 'number', example: 469.5 }
          }
        },
        OrdersByStatusItem: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'completed' },
            count: { type: 'integer', example: 5 }
          }
        },
        AverageOrderValueResponse: {
          type: 'object',
          properties: {
            averageOrderValue: { type: 'number', example: 81.84 }
          }
        },
        TopUserRow: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            orderCount: { type: 'integer', example: 3 },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' }
          }
        },
        DeleteMessage: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'User deleted' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
