import "dotenv/config";
import { WebSocketServer } from 'ws'; 
import { setupRoutes } from './routes/match-routes.js'; // Import the setupRoutes function
import { initializeRedis, flushRedis } from './model/message-queue.js';
import index from "./index.js";
import http from "http";

const port = process.env.PORT || 8080;
const server = http.createServer(index);

// Create a WebSocket server
const wss = new WebSocketServer({ server });
await initializeRedis().then (() => {
    // Pass WebSocket server to route setup
    setupRoutes(wss);

    // Start the server
    server.listen(port, () => {
        console.log(`Matching service is running on http://localhost:${port}`);
    });
}).catch((err) => {
    console.error("Failed to connect to Redis");
    console.error(err);
  
    // Still start the server to handle requests
    server.listen(port);
    console.log("Service started, but redis connection failed.");
  });
