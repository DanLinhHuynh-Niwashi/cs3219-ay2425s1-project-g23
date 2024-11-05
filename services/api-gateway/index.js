import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import questionRoutes from './routes/question-routes.js';
import userRoutes from './routes/user-routes.js';
import collabRoutes from './routes/collab-routes.js';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

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
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

export default app;