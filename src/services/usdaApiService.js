const axios = require('axios');
const { USDA_API_KEY } = require('../config/environment');

const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/';

const fetchFoodData = async (fdcId) => {
    try {
        const response = await axios.get(`${USDA_API_URL}food/${fdcId}`, {
            params: {
                api_key: USDA_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Error fetching food data from USDA API');
    }
};

const searchFoodData = async (query, pageSize = 10) => {
    try {
        const response = await axios.get(`${USDA_API_URL}search`, {
            params: {
                query,
                pageSize,
                api_key: USDA_API_KEY
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Error searching food data from USDA API');
    }
};

module.exports = {
    fetchFoodData,
    searchFoodData
};