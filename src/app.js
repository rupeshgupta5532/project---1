const express = require('express');
const cors = require('cors');
const logger = require('./middleware/logger.middleware');
const userRoutes = require('./routes/user.routes');
const orderRoutes = require('./routes/order.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(logger);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

module.exports = app;
