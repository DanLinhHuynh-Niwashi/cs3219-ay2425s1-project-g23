import http from "http";
import index from "./index.js";
import "dotenv/config";
import mongoose from "mongoose";
const server = http.createServer(index);

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.ENV === "PROD" ? process.env.DB_CLOUD_URI : process.env.DB_LOCAL_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
  
// Start server

