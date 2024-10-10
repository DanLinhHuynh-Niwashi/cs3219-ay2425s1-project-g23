import WebSocket from 'ws'; 
import { setupRoutes } from './routes/match-routes.js'; // Import the setupRoutes function

const PORT = 8080; // Port for the WebSocket server

// Create a WebSocket server
const wss = new WebSocket.Server({ port: PORT });

setupRoutes(wss);

wss.on('error', (error) => {
    console.error(`WebSocket error: ${error.message}`);
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
