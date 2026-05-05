require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/swagger/swagger');

const PORT = process.env.PORT || 8080;

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      tryItOutEnabled: true
    }
  })
);

(async () => {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
})();