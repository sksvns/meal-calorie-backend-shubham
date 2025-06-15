const express = require('express');
const authRoutes = require('./authRoutes');
const foodRoutes = require('./foodRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/food', foodRoutes);

module.exports = router;