import express from 'express';
import cors from 'cors';
import questionRoutes from './routes/question-routes.js';
import categoryRoutes from './routes/category-routes.js'; // Import category routes

const app = express();

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Handle CORS preflight requests
app.options('*', cors());

// To handle CORS Errors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );

  // Allow methods for preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT, PATCH');
    return res.status(200).json({});
  }

  next(); // Continue route processing
});

// Route handling
app.use('/questions', questionRoutes);
app.use('/categories', categoryRoutes); // Use category routes

// Root route
app.get('/', (req, res) => {
  console.log('Sending Greetings!');
  res.json({
    message: 'Hello World from question-service',
  });
});

// Handle 404 - Not Found
app.use((req, res, next) => {
  const error = new Error('Route Not Found');
  error.status = 404;
  next(error);
});

// Error handling middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

export default app;
