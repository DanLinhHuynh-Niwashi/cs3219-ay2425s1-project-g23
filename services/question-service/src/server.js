import http from "http";
import index from "./index.js";
import "dotenv/config";
import { connectToDB } from "./model/repository.js";
import express from 'express';
import cors from 'cors';
import questionRoutes from './routes/question-routes.js';
import categoryRoutes from './routes/category-routes.js';

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

const server = http.createServer(index);

await connectToDB().then(() => {
  console.log("MongoDB Connected!");

  server.listen(port);
  console.log("User service server listening on http://localhost:" + port);
}).catch((err) => {
  console.error("Failed to connect to DB");
  console.error(err);
});