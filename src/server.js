const app = require('./app');
const environment = require('./config/environment');
const connectDB = require('./config/database');
const logger = require('./utils/logger');

connectDB()
    .then(() => {
        const PORT = environment.PORT || 5000;
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        logger.error('Failed to start server:', err.message);
    });
