
// Circuit breaker for USDA API
const usdaCircuitBreaker = {
  failureCount: 0,
  failureThreshold: 5,
  resetTimeout: 60 * 5 * 1000, // 5 minutes in milliseconds
  state: 'CLOSED', // CLOSED, OPEN, HALF-OPEN
  lastFailureTime: null,
  
  // Record a failure and potentially trip the circuit
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      
      // Schedule reset to HALF-OPEN state after timeout
      setTimeout(() => {
        this.state = 'HALF-OPEN';
        console.log('Circuit changed to HALF-OPEN state');
      }, this.resetTimeout);
      
      console.log('Circuit OPEN: Too many failures detected');
    }
  },
  
  // Record a success and potentially reset the circuit
  recordSuccess() {
    if (this.state === 'HALF-OPEN') {
      this.failureCount = 0;
      this.state = 'CLOSED';
      console.log('Circuit CLOSED: Service appears to be working again');
    } else if (this.state === 'CLOSED') {
      // Gradually reduce failure count on success
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  },
  
  // Check if the circuit is open
  isOpen() {
    return this.state === 'OPEN';
  },
  
  // Check if in testing mode
  isHalfOpen() {
    return this.state === 'HALF-OPEN';
  }
};

// Middleware to wrap USDA API calls with circuit breaker
const usdaCircuitBreakerMiddleware = (req, res, next) => {
  // If circuit is open, immediately reject the request
  if (usdaCircuitBreaker.isOpen()) {
    return res.status(503).json({
      success: false,
      message: 'USDA API temporarily unavailable due to high error rate. Please try again later.'
    });
  }
  
  // If circuit is half-open, only allow one test request
  if (usdaCircuitBreaker.isHalfOpen()) {
    console.log('Circuit HALF-OPEN: Testing with a single request');
    
    // Add a response hook to record the outcome of this test request
    const originalSend = res.send;
    res.send = function(body) {
      const statusCode = res.statusCode;
      
      // Consider 2xx and 3xx as success
      if (statusCode >= 200 && statusCode < 400) {
        usdaCircuitBreaker.recordSuccess();
      } else {
        usdaCircuitBreaker.recordFailure();
      }
      
      return originalSend.call(this, body);
    };
  }
  
  // Attach an error handler to detect and record API failures
  res.on('finish', () => {
    // Status codes 4xx and 5xx are considered failures
    if (res.statusCode >= 400) {
      usdaCircuitBreaker.recordFailure();
    } else {
      usdaCircuitBreaker.recordSuccess();
    }
  });
  
  next();
};

module.exports = {
  usdaCircuitBreakerMiddleware,
  usdaCircuitBreaker
};
