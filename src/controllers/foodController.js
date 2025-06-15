const FoodData = require('../models/FoodData');
const usdaApiService = require('../services/usdaApiService');
const logger = require('../utils/logger');
const validators = require('../utils/validators');

// Helper function for fuzzy matching
const calculateSimilarity = (str1, str2) => {
    // Convert both strings to lowercase for case-insensitive comparison
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    // Check if one string contains the other
    if (s1.includes(s2) || s2.includes(s1)) {
        return 0.8; // High similarity if one is substring of the other
    }
    
    // Count matching words
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    let matchCount = 0;
    
    for (const word1 of words1) {
        if (word1.length <= 2) continue; // Skip short words
        for (const word2 of words2) {
            if (word2.length <= 2) continue; // Skip short words
            if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
                matchCount++;
                break;
            }
        }
    }
    
    // Calculate similarity score
    const totalWords = Math.max(words1.length, words2.length);
    return totalWords > 0 ? matchCount / totalWords : 0;
};

// Get calories for a dish with servings
exports.getCaloriesForDish = async (req, res) => {
    const { dish_name, servings, pageSize } = req.body;
    const limit = pageSize ? parseInt(pageSize) : 20; // Default to 20 results for better matching
    
    const validation = validators.validateCaloriesForDish(req.body);
    if (!validation.isValid) return res.status(400).json(validation.errors);
    
    try {
        // First check if we have this in cache
        const cachedData = await FoodData.findOne({ 
            name: { $regex: new RegExp(dish_name, 'i') } 
        });
        
        if (cachedData) {
            // Return cached data with servings calculation
            const caloriesPerServing = cachedData.calories;
            const totalCalories = caloriesPerServing * servings;
            
            return res.status(200).json({
                dish_name,
                servings,
                calories_per_serving: caloriesPerServing,
                total_calories: totalCalories,
                source: "USDA FoodData Central (Cached)"
            });
        }
        
        // Search for food data
        const searchResults = await usdaApiService.searchFoodData(dish_name, limit);
        
        if (!searchResults || !searchResults.foods || searchResults.foods.length === 0) {
            return res.status(404).json({ message: 'Dish not found' });
        }
        
        // Use fuzzy matching to find best match
        let bestMatch = null;
        let highestSimilarity = 0;
        
        for (const food of searchResults.foods) {
            const similarity = calculateSimilarity(dish_name, food.description);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = food;
            }
        }
        
        if (!bestMatch || highestSimilarity < 0.2) {
            return res.status(404).json({ message: 'No good match found for the dish' });
        }
        
        // Get the food details
        const foodDetails = await usdaApiService.fetchFoodData(bestMatch.fdcId);
        
        if (!foodDetails) {
            return res.status(404).json({ message: 'Food details not found' });
        }
        
        // Extract calories
        const nutrients = foodDetails.foodNutrients || [];
        const calorieNutrient = nutrients.find(n => n.nutrient && n.nutrient.name === 'Energy' && n.nutrient.unitName === 'kcal');
        
        if (!calorieNutrient) {
            return res.status(404).json({ message: 'Calorie information not found for this dish' });
        }
        
        const caloriesPerServing = calorieNutrient.amount;
        const totalCalories = caloriesPerServing * servings;
        
        // Cache the result
        try {
            await FoodData.create({
                foodId: foodDetails.fdcId.toString(),
                name: dish_name,
                calories: caloriesPerServing,
                protein: 0, // Not required for this endpoint
                fat: 0,     // Not required for this endpoint
                carbohydrates: 0 // Not required for this endpoint
            });
        } catch (cacheError) {
            // If caching fails (e.g., duplicate key), just log and continue
            logger.error('Error caching dish data:', cacheError.message);
        }
        
        // Return the response
        return res.status(200).json({
            dish_name,
            servings,
            calories_per_serving: caloriesPerServing,
            total_calories: totalCalories,
            source: "USDA FoodData Central"
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({ message: 'An error occurred while fetching calorie data' });
    }
};