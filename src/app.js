const express = require('express');
const cors = require('cors');
const errorMiddleware = require('./middleware/error.middleware');

// Import routes
const healthRoutes = require('./routes/health.routes');
const tenantsRoutes = require('./routes/tenants.routes');
const usersRoutes = require('./routes/users.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Routes
app.use('/health', healthRoutes);
app.use('/tenants', tenantsRoutes);
app.use('/users', usersRoutes);
app.use('/auth', authRoutes);

// Global error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
