// tests/integration/food-calories.test.js
const request = require('supertest');

// Mock auth middleware to always allow
jest.mock('../../src/middleware/auth', () => (req, res, next) => next());
// Mock FoodData model and usdaApiService
jest.mock('../../src/models/FoodData');
jest.mock('../../src/services/usdaApiService');

const FoodData = require('../../src/models/FoodData');
const usdaApiService = require('../../src/services/usdaApiService');
const app = require('../../src/app');

describe('/api/food/get-calories', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return calories for "macaroni and cheese" from cache', async () => {
    FoodData.findOne.mockResolvedValueOnce({
      name: 'macaroni and cheese',
      calories: 310
    });
    const res = await request(app)
      .post('/api/food/get-calories')
      .send({ dish_name: 'macaroni and cheese', servings: 2 });
    expect(res.status).toBe(200);
    expect(res.body.dish_name).toBe('macaroni and cheese');
    expect(res.body.total_calories).toBe(620);
    expect(res.body.source).toMatch(/cached/i);
  });

  it('should return calories for "grilled salmon" from USDA API', async () => {
    FoodData.findOne.mockResolvedValueOnce(null);
    usdaApiService.searchFoodData.mockResolvedValueOnce({
      foods: [{ fdcId: 123, description: 'grilled salmon' }]
    });
    usdaApiService.fetchFoodData.mockResolvedValueOnce({
      fdcId: 123,
      foodNutrients: [
        { nutrient: { name: 'Energy', unitName: 'kcal' }, amount: 200 }
      ]
    });
    FoodData.create.mockResolvedValueOnce({});
    const res = await request(app)
      .post('/api/food/get-calories')
      .send({ dish_name: 'grilled salmon', servings: 1 });
    expect(res.status).toBe(200);
    expect(res.body.dish_name).toBe('grilled salmon');
    expect(res.body.total_calories).toBe(200);
    expect(res.body.source).toMatch(/USDA/i);
  });

  it('should return calories for "paneer butter masala" with multiple servings', async () => {
    FoodData.findOne.mockResolvedValueOnce(null);
    usdaApiService.searchFoodData.mockResolvedValueOnce({
      foods: [{ fdcId: 456, description: 'paneer butter masala' }]
    });
    usdaApiService.fetchFoodData.mockResolvedValueOnce({
      fdcId: 456,
      foodNutrients: [
        { nutrient: { name: 'Energy', unitName: 'kcal' }, amount: 350 }
      ]
    });
    FoodData.create.mockResolvedValueOnce({});
    const res = await request(app)
      .post('/api/food/get-calories')
      .send({ dish_name: 'paneer butter masala', servings: 3 });
    expect(res.status).toBe(200);
    expect(res.body.dish_name).toBe('paneer butter masala');
    expect(res.body.total_calories).toBe(1050);
  });

  it('should return 404 for non-existent dish', async () => {
    FoodData.findOne.mockResolvedValueOnce(null);
    usdaApiService.searchFoodData.mockResolvedValueOnce({ foods: [] });
    const res = await request(app)
      .post('/api/food/get-calories')
      .send({ dish_name: 'unicorn pizza', servings: 1 });
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('should return 400 for zero servings', async () => {
    const res = await request(app)
      .post('/api/food/get-calories')
      .send({ dish_name: 'macaroni and cheese', servings: 0 });
    expect(res.status).toBe(400);
    expect(res.body.servings).toBe('Number of servings is required.');
  });

  it('should return 400 for negative servings', async () => {
    const res = await request(app)
      .post('/api/food/get-calories')
      .send({ dish_name: 'macaroni and cheese', servings: -2 });
    expect(res.status).toBe(400);
    expect(res.body.servings).toMatch(/positive number/i);
  });

  it('should pick best match when multiple similar matches exist', async () => {
    FoodData.findOne.mockResolvedValueOnce(null);
    usdaApiService.searchFoodData.mockResolvedValueOnce({
      foods: [
        { fdcId: 1, description: 'macaroni' },
        { fdcId: 2, description: 'macaroni and cheese' },
        { fdcId: 3, description: 'cheese pasta' }
      ]
    });
    usdaApiService.fetchFoodData.mockResolvedValueOnce({
      fdcId: 2,
      foodNutrients: [
        { nutrient: { name: 'Energy', unitName: 'kcal' }, amount: 310 }
      ]
    });
    FoodData.create.mockResolvedValueOnce({});
    const res = await request(app)
      .post('/api/food/get-calories')
      .send({ dish_name: 'macaroni and cheese', servings: 1 });
    expect(res.status).toBe(200);
    expect(res.body.dish_name).toBe('macaroni and cheese');
    expect(res.body.calories_per_serving).toBe(310);
  });
});
