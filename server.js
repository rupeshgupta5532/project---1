require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/swagger/swagger');

connectDB();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});