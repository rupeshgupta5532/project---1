const config = require('./src/config');
const logger = require('./src/config/logger');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/swagger/swagger');
const { notFound, errorHandler } = require('./src/middleware/error.middleware');

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

app.use(notFound);
app.use(errorHandler);

(async () => {
  await connectDB();
  await connectRedis();

  app.listen(config.port, () => {
    logger.info(`Server running on port http://localhost:${config.port}`);
  });
})();
