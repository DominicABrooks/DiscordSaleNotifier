import express from 'express';
import cors from 'cors';
import steamworksCron from './cron-jobs/steamworksCron.js';
import webhookRouter from './routes/webhookRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SteamSaleNotifier API Documentation',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:1337'
      },
    ],
  },
  apis: ["**/routes/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * Apply Cross-Origin Resource Sharing (CORS) middleware.
 * This allows the server to accept requests from different origins.
 * 
 * @see https://expressjs.com/en/resources/middleware/cors.html
 */
app.use(cors());

/**
 * Middleware to parse incoming JSON requests.
 * Adds the parsed JSON data to the req.body property.
 * 
 * @see https://expressjs.com/en/api.html#express.json
 */
app.use(express.json());

/**
 * Mount the webhook router at the `/api/webhook` path.
 * All routes defined in webhookRouter will be accessible under this path.
 * 
 * @see ./routes/webhookRoutes.js
 */
app.use('/api/webhook', webhookRouter);

/**
 * Initialize and start the Steamworks cron job.
 * This sets up a scheduled task to manage sales data and webhooks.
 */
steamworksCron('* * * * *');

/**
 * Start the Express server and listen for connections on port 1337.
 * This is the main entry point for the application.
 * 
 * @see https://expressjs.com/en/starter/hello-world.html
 */
app.listen(1337, () => {
  console.log('Server is running on http://localhost:1337');
});