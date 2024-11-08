import express from "express";
import fileUpload from 'express-fileupload';
import cookieParser from "cookie-parser";
import questionRoutes from './routes/question-routes.js';
import userRoutes from './routes/user-routes.js';
import collabRoutes from './routes/collab-routes.js';
import rateLimit from 'express-rate-limit';

const app = express();

// Define rate limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again',
});

app.use(limiter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

// CORS configuration for handling cookies
app.use((req, res, next) => {
  const allowedOrigin = req.headers.origin;
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
    return res.status(200).json({});
  }
  next();
});

app.use('/api', questionRoutes);
app.use('/api', userRoutes);
app.use('/api', collabRoutes);

app.get("/", (req, res, next) => {
    console.log("Sending Greetings!");
    res.status(200);
    res.json({
      message: "Hello World from peerprep",
    });
});

// Handle when no route match is found
app.use((req, res, next) => {
  const error = new Error("Route Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  if (error instanceof rateLimit.RateLimitError) {
    return res.status(429).json({
      error: {
        message: error.message, // 'Too many requests from this IP, please try again later.'
      },
    });
  }

  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

export default app;