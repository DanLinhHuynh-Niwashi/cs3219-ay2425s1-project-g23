import express from "express";
import cors from "cors";
import collabRoutes from "./routes/collab-route.js";

const app = express();
let dbConnected = false;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// To handle CORS Errors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // "*" -> Allow all links to access

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  // Browsers usually send this before PUT or POST Requests
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
    return res.status(200).json({});
  }

  // Continue Route Processing
  next();
});

app.use("/collab", collabRoutes);

app.get("/", (req, res, next) => {
  if(!dbConnected) {
    console.log("Database connection failed!");
    res.status(503).json({
      message: "Service is currently unavailable due to database connection issues.",
    });
  } else {
    console.log("Sending Greetings!");
    res.json({
      message: "Hello World from collaboration-service",
    });
  }
});

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

// Function to update DB status message
export const updateDBStatus = (isConnected) => {
  dbConnected = isConnected;
};

export default app;