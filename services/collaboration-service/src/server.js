import { WebSocketServer } from 'ws'; 
import { setupRoutes } from './routes/collab-route.js'; // Import the setupRoutes function
import index from "./index.js";
import http from "http";

const port = process.env.PORT || 8080;
const server = http.createServer(index);

// Create a WebSocket server
const wss = new WebSocketServer({ server });
setupRoutes(wss)
server.listen(port, () => {
    console.log(`Collab service is running on http://localhost:${port}`);
});
