import http from "http";
import index from "./index.js";
import "dotenv/config";
import { WebSocketServer } from 'ws'; 
import { handleWSMessage } from './controllers/gateway-controller.js';
import { connectToMatchingService } from './routes/matching-socket.js';

const server = http.createServer(index);
const PORT = process.env.PORT || 3000;

const wsServer = new WebSocketServer({ server });

connectToMatchingService();

// Handle WebSocket upgrade requests
server.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});

wsServer.on('connection', (ws, req) => {
  console.log('New WebSocket connection established.');

  ws.on('message', (message) => {
    handleWSMessage(ws, message, req);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed.');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
