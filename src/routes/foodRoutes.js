const express = require('express');
const { getCaloriesForDish } = require('../controllers/foodController');
const auth = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all food routes
router.use(auth);

// Route to get calories for a dish with servings
router.post('/get-calories', getCaloriesForDish);

module.exports = router;