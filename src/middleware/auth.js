const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');
const environment = require('../config/environment');

const verifyToken = promisify(jwt.verify);

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = await verifyToken(token, environment.JWT_SECRET);
        const user = await User.findById(decoded._id);
        
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = authMiddleware;