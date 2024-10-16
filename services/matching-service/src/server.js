import WebSocket from 'ws'; 
import { setupRoutes } from './routes/match-routes.js'; // Import the setupRoutes function
import { initializeRedis, flushRedis } from './model/message-queue.js';

const PORT = process.env.PORT || 8080; // Port for the WebSocket server
// Create a WebSocket server
const wss = new WebSocket.Server({ port: PORT });
(async () => {
    await initializeRedis(); // Initialize Redis client
    await flushRedis();
    // Pass WebSocket server to route setup
    setupRoutes(wss);

    wss.on('error', (error) => {
        console.error(`WebSocket error: ${error.message}`);
    });

    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
})();
