const mongoose = require('mongoose');

const foodDataSchema = new mongoose.Schema({
    foodId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    calories: {
        type: Number,
        required: true
    },
    protein: {
        type: Number,
        required: true
    },
    fat: {
        type: Number,
        required: true
    },
    carbohydrates: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '30d' // Automatically remove documents after 30 days
    }
});

const FoodData = mongoose.model('FoodData', foodDataSchema);

module.exports = FoodData;