require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/swagger/swagger');

const PORT = process.env.PORT || 8080;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

(async () => {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
})();