# Food Data API

## Overview
The Food Data API is a Node.js application built with Express and MongoDB that integrates with the USDA FoodData Central API. It provides endpoints for user authentication and food data retrieval, focusing on performance and security.

## Features
- User authentication with JWT
- Integration with USDA FoodData Central API
- Rate limiting to prevent abuse
- Centralized error handling
- Input validation for data integrity

## Technologies Used
- Node.js
- Express
- MongoDB
- Mongoose
- JWT for authentication
- dotenv for environment variable management
- Jest for testing

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- MongoDB (local or cloud instance)
- Access to USDA FoodData Central API

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd food-data-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` template and fill in the required values:
   ```
   DATABASE_URI=<your_mongodb_connection_string>
   USDA_API_KEY=<your_usda_api_key>
   JWT_SECRET=<your_jwt_secret>
   ```

4. Start the application:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Log in an existing user

### Food Data
- `GET /api/food`: Fetch food data from USDA FoodData Central

## Testing
To run the tests, use the following command:
```
npm test
```

This will execute both unit and integration tests to ensure the application functions as expected.

## Security Considerations
- Ensure that sensitive information is stored in environment variables.
- Use HTTPS in production to secure data in transit.
- Implement rate limiting to protect against abuse.

## Contribution
Contributions are welcome! Please submit a pull request or open an issue for discussion.

## License
This project is licensed under the MIT License.