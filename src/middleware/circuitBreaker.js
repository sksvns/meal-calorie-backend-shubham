const { RateLimiterMemory } = require('rate-limiter-flexible');


// Circuit breaker for USDA API
const usdaCircuitBreaker = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60, // per 60 seconds
  blockDuration: 60 * 5 // block for 5 minutes if consumed
});

// Middleware to wrap USDA API calls with circuit breaker
const usdaCircuitBreakerMiddleware = async (req, res, next) => {
  try {
    await usdaCircuitBreaker.consume(req.ip);
    next();
  } catch (rejRes) {
    return res.status(503).json({
      success: false,
      message: 'USDA API temporarily unavailable due to high error rate. Please try again later.'
    });
  }
};

module.exports = usdaCircuitBreakerMiddleware

