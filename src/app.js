const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger.middleware');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(logger);

app.use('/api/users', userRoutes);

module.exports = app;
