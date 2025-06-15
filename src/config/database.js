const mongoose = require('mongoose');
const environment = require('./environment');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        // URL encode username and password in the MongoDB URI to prevent deprecation warnings
        const mongoURI = environment.MONGODB_URI.replace(
            /(mongodb:\/\/)([^:]+):([^@]+)@/,
            (match, protocol, username, password) => {
                return `${protocol}${encodeURIComponent(username)}:${encodeURIComponent(password)}@`;
            }
        );
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection error:', error.message);
        // Log the full error for debugging
        console.error('MongoDB connection error details:', error);
        process.exit(1);
    }
};

module.exports = connectDB;