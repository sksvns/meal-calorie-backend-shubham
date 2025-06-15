const express = require('express');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { usdaCircuitBreakerMiddleware } = require('./middleware/circuitBreaker');
const compression = require('compression');
const helmet = require('helmet');
const hpp = require('hpp');
const Sentry = require('@sentry/node');
const environment = require('./config/environment');

const app = express();

// Middleware
app.use(express.json());
app.use(compression());
app.use(helmet());
app.use(hpp());

// Sentry initialization (add SENTRY_DSN to your .env file for production)
if (process.env.SENTRY_DSN) {
    Sentry.init({ dsn: process.env.SENTRY_DSN, environment: environment.NODE_ENV });
    app.use(Sentry.Handlers.requestHandler());
}

// Apply general API rate limiter to all routes
app.use(apiLimiter);

// Routes with specific middleware
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/food', usdaCircuitBreakerMiddleware, foodRoutes);

// Error handling middleware (Sentry error handler first if enabled)
if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
}

app.use(errorHandler);

module.exports = app;