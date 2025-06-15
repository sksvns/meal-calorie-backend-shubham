const axios = require('axios');
const { USDA_API_KEY } = require('../config/environment');
const { usdaCircuitBreaker } = require('../middleware/circuitBreaker');

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/';

/**
 * Modified to work with the circuit breaker pattern.
 * This implementation will properly report errors to the circuit breaker.
 */
const fetchFoodData = async (fdcId) => {
    try {
        const response = await axios.get(`${USDA_API_URL}food/${fdcId}`, {
            params: {
                api_key: USDA_API_KEY
            }
        });
        
        // Record success to the circuit breaker
        usdaCircuitBreaker.recordSuccess();
        
        return response.data;
    } catch (error) {
        // Record failure to the circuit breaker
        usdaCircuitBreaker.recordFailure();
        
        console.error(`USDA API Error for ID ${fdcId}:`, error.message);
        throw new Error('Error fetching food data from USDA API');
    }
};

/**
 * Modified to work with the circuit breaker pattern.
 * This implementation will properly report errors to the circuit breaker.
 */
const searchFoodData = async (query, pageSize = 10) => {
    try {
        const response = await axios.get(`${USDA_API_URL}search`, {
            params: {
                query,
                pageSize,
                api_key: USDA_API_KEY
            }
        });
        
        // Record success to the circuit breaker
        usdaCircuitBreaker.recordSuccess();
        
        return response.data;
    } catch (error) {
        // Record failure to the circuit breaker
        usdaCircuitBreaker.recordFailure();
        
        console.error(`USDA API Search Error for "${query}":`, error.message);
        throw new Error('Error searching food data from USDA API');
    }
};

module.exports = {
    fetchFoodData,
    searchFoodData
};
