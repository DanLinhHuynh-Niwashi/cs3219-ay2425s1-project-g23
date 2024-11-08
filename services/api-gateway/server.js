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

server.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
});

const connectionLimit = 100; // Limit the number of connections per IP
const ipConnectionCounts = {};

wsServer.on('connection', (ws, req) => {
  console.log('New WebSocket connection established.');

  const ip = req.socket.remoteAddress; // Get the IP address of the client

  // Track the number of WebSocket connections per IP
  if (!ipConnectionCounts[ip]) {
    ipConnectionCounts[ip] = 1;
  } else {
    ipConnectionCounts[ip]++;
  }

  if (ipConnectionCounts[ip] > connectionLimit) {
    ws.send(JSON.stringify({event: 'connection-refuse', message:'Too many connections from this IP address.'}));
    ws.close();
    console.log('Connection limit exceeded for IP', ip);
    return;
  }

  // Track message count for each WebSocket connection
  let messageCount = 0;
  const MAX_MESSAGES_PER_MINUTE = 60; // 60 messages per minute limit

  const messageInterval = setInterval(() => {
    messageCount = 0; // Reset message count every minute
  }, 60 * 1000); // Reset every 60 seconds

  ws.on('message', (message) => {
    messageCount++;
    if (messageCount > MAX_MESSAGES_PER_MINUTE) {
      ws.send(JSON.stringify({event: 'connection-refuse', message: 'Too many messages, disconnecting...'}));
      ws.close();
      clearInterval(messageInterval);
      console.log('WebSocket connection closed due to excessive messages.');
    } else {
      handleWSMessage(ws, message, req); // Handle normal WebSocket message
    }
  });

  ws.on('close', () => {
    ipConnectionCounts[ip]--;
    clearInterval(messageInterval); // Clean up interval on close
    console.log('WebSocket connection closed.');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
