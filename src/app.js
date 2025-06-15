const express = require('express');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { usdaCircuitBreakerMiddleware } = require('./middleware/circuitBreaker');

const app = express();

// Middleware
app.use(express.json());

// Apply general API rate limiter to all routes
app.use(apiLimiter);

// Routes with specific middleware
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/food', usdaCircuitBreakerMiddleware, foodRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;