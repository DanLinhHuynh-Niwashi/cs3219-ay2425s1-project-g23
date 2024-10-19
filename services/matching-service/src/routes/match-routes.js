import { handleMessage, handleDisconnect } from '../controllers/websocket-match-controller.js';

export function setupRoutes(wss) {
    wss.on('connection', (ws) => {
        console.log('New client connected');

        ws.on('message', (message) => {
            handleMessage(ws, message);
        });

        ws.on('close', () => {
            handleDisconnect(ws);
        });
    });

    wss.on('error', (error) => {
        console.error(`WebSocket error: ${error.message}`);
    });
}
