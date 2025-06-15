module.exports = {
  validateUserRegistration: (data) => {
    const { username, password, email } = data;
    const errors = {};

    if (!username || username.length < 3) {
      errors.username = 'Username must be at least 3 characters long.';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateUserLogin: (data) => {
    const { email, password } = data;
    const errors = {};

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid.';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  validateCaloriesForDish: (data) => {
    const { dish_name, servings } = data;
    const errors = {};

    if (!dish_name || dish_name.trim().length === 0) {
      errors.dish_name = 'Dish name is required.';
    }
    
    if (!servings) {
      errors.servings = 'Number of servings is required.';
    } else if (isNaN(servings) || Number(servings) <= 0) {
      errors.servings = 'Servings must be a positive number.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
};